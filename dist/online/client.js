"use strict";
(() => {
  const $ = (id) => document.getElementById(id);
  const BASE = String(
    globalThis.DOZEN_ONLINE_SERVER || location.origin,
  ).replace(/\/$/, "");
  const storageKey = "dozenwar-online-v1:" + BASE;
  const asset = (src) =>
    new URL(String(src).replace(/^\.\//, ""), BASE + "/").href;
  let socket,
    catalog,
    state,
    session,
    outbox,
    ticket,
    authenticated = false,
    joining = false,
    epoch = 0,
    retryTimer = null,
    retryAttempt = 0,
    needsSync = false,
    transientNotice = false,
    sending = false,
    ackRevision = -1;
  const transient = new Set([
    "NOT_CONNECTED",
    "ACK_TIMEOUT",
    "SERVER_ERROR",
    "REQUEST_IN_PROGRESS",
    "STORE_CONFLICT",
  ]);
  let actorId = null,
    draft = null,
    deploy = null,
    deploySlot = 0,
    teamHero = "HERO_INF_KAZU";
  let clockReceived = 0;
  let presentationTab = "hero";
  const counts = { inf: 3, arch: 1, cav: 1 };
  try {
    ({ session, outbox, ticket } = JSON.parse(
      localStorage.getItem(storageKey) || "{}",
    ));
  } catch {
    /* New session. */
  }
  function save() {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ session, outbox, ticket }),
    );
  }
  function el(tag, text, className) {
    const n = document.createElement(tag);
    if (text !== undefined) n.textContent = text;
    if (className) n.className = className;
    return n;
  }
  function btn(label, fn, disabled = false) {
    const b = el("button", label, "btn");
    if (/^(Sẵn sàng|Xác nhận|Kết thúc lượt|Đấu lại|Chọn tiếp)/i.test(label)) b.classList.add("gold");
    if (/^(Di chuyển|Đỡ đòn)/i.test(label)) b.classList.add("primary");
    if (/^(Đánh thường|Nhận đòn)/i.test(label)) b.classList.add("danger");
    if (/^(Di chuyển|Đánh thường)/i.test(label)) b.dataset.uiAction = "unit";
    if (label === "Kết thúc lượt") b.dataset.uiAction = "turn";
    b.type = "button";
    b.disabled = disabled;
    b.onclick = () => Promise.resolve(fn()).catch(showError);
    return b;
  }
  const messages = {
    STALE_STATE: "Trận đã thay đổi. Đã đồng bộ; hãy chọn lại hành động.",
    UNAUTHORIZED:
      "Không thể khôi phục phiên này. Bạn cần mã phòng và phiên đăng nhập gốc.",
    ROOM_NOT_FOUND: "Phòng không còn tồn tại.",
    ROOM_FULL: "Phòng đã đủ người hoặc đã bắt đầu.",
    INVALID_ROOM: "Mã phòng gồm 8 ký tự.",
    WAITING_FOR_OPPONENT: "Đang chờ người chơi thứ hai.",
    BUILD_MISMATCH:
      "Trận thuộc bản server trước. Cần chạy lại đúng bản server để khôi phục trận.",
    RATE_LIMIT: "Bạn thao tác quá nhanh. Hãy chờ một lát.",
    SERVER_FULL: "Server đã đủ phòng.",
    SERVER_ERROR:
      "Server chưa lưu được hành động. Đang giữ lệnh để thử lại an toàn.",
    INVALID_SELECTION:
      "Mục tiêu hoặc lựa chọn chưa hợp lệ. Hãy kiểm tra mô tả kỹ năng.",
    INVALID_COPY_TARGETS: "Mục tiêu của kỹ năng sao chép chưa hợp lệ.",
    NOT_CONNECTED:
      "Mất kết nối. Lệnh đã gửi sẽ được kiểm tra lại khi kết nối trở lại.",
    ACK_TIMEOUT:
      "Chưa nhận được xác nhận. Đang thử lại cùng lệnh để tránh thực hiện hai lần.",
    REQUEST_IN_PROGRESS: "Đang khôi phục phiên chơi. Vui lòng chờ một chút.",
    ROOM_COMMAND_LIMIT:
      "Phòng đã đạt giới hạn lệnh. Hãy tạo phòng mới sau trận này.",
  };
  function notice(text) {
    $("notice").textContent = text || "";
  }
  function showError(error) {
    if (["INVALID_ROOM", "ROOM_NOT_FOUND", "ROOM_FULL"].includes(error.message)) $("roomCode").setAttribute("aria-invalid", "true");
    transientNotice = transient.has(error.message);
    notice(
      messages[error.message] || "Hành động chưa hợp lệ: " + error.message,
    );
  }
  function request(event, payload = {}) {
    const generation = epoch;
    return new Promise((resolve, reject) => {
      if (!socket?.connected) return reject(Error("NOT_CONNECTED"));
      socket.timeout(7000).emit(event, payload, (error, response) => {
        if (generation !== epoch || !socket.connected)
          return reject(Error("NOT_CONNECTED"));
        if (error) return reject(Error("ACK_TIMEOUT"));
        if (!response?.ok)
          return reject(Error(response?.error || "SERVER_ERROR"));
        resolve(response);
      });
    });
  }
  function retry() {
    if (retryTimer || !socket?.connected) return;
    const delay = Math.min(500 * 2 ** Math.min(retryAttempt++, 4), 5000);
    retryTimer = setTimeout(async () => {
      retryTimer = null;
      if (!socket?.connected) return;
      try {
        if (session && !authenticated) await resume();
        else if (ticket) await enter(ticket.event);
        else if (outbox) await flush();
        else if (session && needsSync) await sync();
      } catch (error) {
        showError(error);
        if (transient.has(error.message)) retry();
      }
    }, delay);
  }
  async function sync() {
    if (!session || !authenticated) return;
    needsSync = true;
    try {
      const result = await request("room:sync");
      receive(result.state);
      needsSync = false;
      retryAttempt = 0;
    } catch (error) {
      if (transient.has(error.message)) retry();
      throw error;
    }
  }
  async function flush() {
    if (!outbox || sending || !socket?.connected || !session || !authenticated)
      return;
    const envelope = outbox;
    sending = true;
    render();
    try {
      const result = await request("command", envelope);
      if (outbox !== envelope) return;
      ackRevision = Math.max(ackRevision, result.revision);
      outbox = null;
      save();
      notice("");
      await sync();
    } catch (error) {
      if (outbox !== envelope && outbox !== null) return;
      if (!transient.has(error.message)) {
        outbox = null;
        save();
      }
      showError(error);
      if (socket?.connected && authenticated) {
        try {
          await sync();
        } catch {
          /* Keep retryable command. */
        }
      }
    } finally {
      sending = false;
      render();
      if (outbox || needsSync) retry();
    }
  }
  async function command(value) {
    if (
      !state ||
      !authenticated ||
      outbox ||
      sending ||
      state.revision < ackRevision
    )
      return;
    outbox = {
      commandId: crypto.randomUUID(),
      expectedRevision: state.revision,
      command: value,
    };
    save();
    await flush();
  }
  function receive(next) {
    if (state && next.code === state.code && next.revision < state.revision)
      return;
    if (!state || state.revision !== next.revision) {
      draft = null;
      deploy = null;
    }
    state = next;
    clockReceived = performance.now();
    render();
  }
  async function enter(event) {
    if (joining || !socket?.connected) return;
    joining = true;
    render();
    try {
      if (!ticket) {
        const token = Array.from(
          crypto.getRandomValues(new Uint8Array(32)),
          (n) => n.toString(16).padStart(2, "0"),
        ).join("");
        ticket = {
          event,
          name: $("playerName").value.trim(),
          code: $("roomCode").value.trim().toUpperCase(),
          resumeToken: token,
        };
        save();
      }
      let result;
      try {
        result = await request(ticket.event, ticket);
      } catch (error) {
        if (!transient.has(error.message)) {
          ticket = null;
          save();
        }
        if (transient.has(error.message)) retry();
        throw error;
      }
      session = {
        code: result.code,
        side: result.side,
        resumeToken: result.resumeToken,
      };
      outbox = null;
      ticket = null;
      authenticated = true;
      save();
      await sync();
      $("connection").textContent = "Đã kết nối";
      if (transientNotice && !outbox) {
        notice("");
        transientNotice = false;
      }
    } finally {
      joining = false;
      render();
    }
  }
  async function resume() {
    $("connection").textContent =
      session || ticket ? "Đang khôi phục trận…" : "Đã kết nối";
    if (!session) {
      if (ticket) await enter(ticket.event);
      return;
    }
    try {
      await request("room:resume", session);
      authenticated = true;
      await sync();
      await flush();
      $("connection").textContent = "Đã kết nối";
      if (transientNotice && !outbox) {
        notice("");
        transientNotice = false;
      }
      retryAttempt = 0;
      render();
    } catch (error) {
      showError(error);
      if (transient.has(error.message)) retry();
      else
        $("lobby").append(
          btn("Bỏ phiên cũ và về phòng chờ", () => {
            session = null;
            outbox = null;
            ticket = null;
            state = null;
            authenticated = false;
            save();
            socket.disconnect().connect();
            render();
          }),
        );
    }
  }
  function card(uid) {
    return state.game.hand.find((c) => c.uid === uid);
  }
  function cardName(uid) {
    return card(uid)?.name || "Trang bị";
  }
  function unit(id) {
    return state.game.units.find((u) => u.id === id);
  }
  function unitName(id) {
    const u = unit(id);
    return u ? u.spec?.name || definition(u.definitionId)?.name : "";
  }
  function definition(id) {
    return (
      catalog.heroes.find((h) => h.id === id) ||
      catalog.troops.find((t) => t.canonicalId === id)
    );
  }
  function select(label, choices, selected, change) {
    const wrap = el("label", label),
      node = el("select");
    node.setAttribute("aria-label", label);
    for (const [value, text] of choices) {
      const o = el("option", text);
      o.value = value;
      node.append(o);
    }
    node.value = selected || "";
    node.onchange = () => change(node.value);
    wrap.append(node);
    return wrap;
  }
  function startDraft(value, preview) {
    draft = {
      value,
      preview,
      targets: [],
      cell: null,
      kind: preview?.kinds?.[0]?.id,
      dice: [1, 2],
      copyId: null,
    };
    render();
  }
  function effectivePreview() {
    if (!draft) return null;
    return draft.preview?.skill?.mechanic === "COPY" && draft.copyId
      ? draft.preview.copies.find((p) => p.skill.id === draft.copyId) ||
          draft.preview
      : draft.preview;
  }
  function submitDraft() {
    const value = { ...draft.value, targetIds: draft.targets };
    for (const key of ["cell", "kind", "copyId", "dice"])
      if (draft[key]) value[key] = draft[key];
    return command(value);
  }
  function deployUnits() {
    const g = state.game,
      team = g.teams[state.side];
    if (!deploy) {
      const ids = [
        team.heroDefinitionId,
        ...Object.entries(team.troops).flatMap(([k, n]) =>
          Array(n).fill(catalog.troops.find((t) => t.kind === k).canonicalId),
        ),
      ];
      const available = catalog.cells.filter(
        (c) =>
          c.zone === state.side &&
          !g.units.some((u) => u.q === c.q && u.r === c.r),
      );
      deploy = ids.map((definitionId, i) => ({
        definitionId,
        q: available[i].q,
        r: available[i].r,
      }));
    }
    return deploy;
  }
  function renderSetup() {
    const box = $("setup"),
      g = state.game;
    box.replaceChildren();
    box.classList.toggle("onlineResult", g.phase === "ended");
    if (g.phase === "ready") {
      box.append(
        el("h2", "Phòng chờ"),
        el("p", "Mã phòng: " + state.code + " · Bạn là Player " + state.side),
      );
      const slots = el("div", undefined, "onlinePlayerSlots");
      for (const side of [1, 2]) {
        const player = state.players.find((p) => p.side === side);
        const slot = el("div", undefined, "onlinePlayerSlot");
        slot.append(el("strong", "P" + side + " · " + (player?.name || "Đang chờ người chơi…")), el("small", g.ready[side - 1] ? "✓ SẴN SÀNG" : "ĐANG CHỜ"));
        slots.append(slot);
      }
      box.append(slots);
      box.append(
        btn(
          g.ready[state.side - 1] ? "Đã sẵn sàng" : "Sẵn sàng",
          () => command({ type: "READY" }),
          state.players.length !== 2 || g.ready[state.side - 1],
        ),
      );
    } else if (g.phase === "team") {
      box.append(
        el("h2", "Chọn đội hình"),
        el(
          "p",
          "Xúc xắc: " +
            g.dice.join(" – ") +
            ". Player " +
            g.firstSide +
            " đi trước; Player " +
            (3 - g.firstSide) +
            " chọn và xếp quân trước.",
        ),
      );
      if (g.selecting !== state.side) {
        box.append(el("p", "Đang chờ đối thủ chọn Hero và 5 lính."));
        return;
      }
      const heroes = el("div", undefined, "heroes");
      for (const h of catalog.heroes) {
        const b = btn(h.name, () => {
          teamHero = h.id;
          render();
        });
        b.classList.toggle("selected", teamHero === h.id);
        const img = el("img");
        img.src = asset(h.avatar);
        img.alt = h.name;
        b.prepend(img);
        b.title = h.skills.map((s) => s.description).join("\n");
        heroes.append(b);
      }
      box.append(heroes);
      const chosen = catalog.heroes.find((hero) => hero.id === teamHero);
      const info = el("div", undefined, "onlineTeamInfo");
      const portrait = el("img"); portrait.src = asset(chosen.avatar); portrait.alt = chosen.name;
      const copy = el("div"); copy.append(el("h3", chosen.name), el("p", chosen.skills.map((skill) => skill.name).join(" · ")));
      info.append(portrait, copy); box.append(info);
      const troopCounts = el("div", undefined, "onlineTroopCounts");
      for (const t of catalog.troops) {
        const wrap = el("label", t.name),
          input = el("input");
        input.type = "number";
        input.min = 0;
        input.max = 5;
        input.value = counts[t.kind];
        input.onchange = () => {
          counts[t.kind] = Number(input.value);
          render();
        };
        wrap.append(input);
        troopCounts.append(wrap);
      }
      box.append(troopCounts, el("p", "Tổng lính: " + Object.values(counts).reduce((a, b) => a + b, 0) + "/5"));
      box.append(
        btn(
          "Xác nhận đội hình",
          () =>
            command({ type: "TEAM", heroId: teamHero, troops: { ...counts } }),
          Object.values(counts).reduce((a, b) => a + b, 0) !== 5,
        ),
      );
    } else if (g.phase === "deploy") {
      box.append(el("h2", "Xếp quân"));
      if (g.selecting !== state.side) {
        box.append(el("p", "Đang chờ đối thủ xếp quân."));
        return;
      }
      const units = deployUnits();
      box.append(
        el(
          "p",
          "Chọn quân, rồi chạm ô được tô sáng để đổi vị trí. Mỗi ô chứa một quân.",
        ),
      );
      box.append(
        select(
          "Quân đang xếp",
          units.map((u, i) => [
            String(i),
            i + 1 + ". " + definition(u.definitionId).name,
          ]),
          String(deploySlot),
          (v) => {
            deploySlot = Number(v);
            render();
          },
        ),
      );
      box.append(
        btn("Xác nhận xếp quân", () => command({ type: "DEPLOY", units })),
      );
    } else if (g.phase === "ended") {
      box.classList.add("onlineResult");
      const r = g.result,
        win =
          r.resultType === "DRAW" ? "Hòa" : "Player " + r.winnerSide + " thắng";
      box.append(
        el("h2", "Kết thúc · " + win),
        el(
          "p",
          r.reason === "SURRENDER"
            ? "Đối thủ hoặc bạn đã đầu hàng."
            : r.reason === "SETUP_TIMEOUT"
              ? "Hết thời gian chuẩn bị."
              : "Trận đã được server ghi nhận.",
        ),
      );
      const result = el("div", undefined, "resultGrid");
      for (const side of [1, 2]) {
        const player = state.players.find((p) => p.side === side);
        const outcome = r.resultType === "DRAW" ? "HÒA" : r.winnerSide === side ? "CHIẾN THẮNG" : "THUA CUỘC";
        const card = el("div", undefined, "resultCard " + (r.resultType === "DRAW" ? "draw" : r.winnerSide === side ? "win" : "lose"));
        const heroUnit = g.units.find((u) => u.hero && u.side === side);
        const hero = heroUnit && catalog.heroes.find((h) => h.id === heroUnit.definitionId);
        if (hero?.avatar) { const image = el("img", undefined, "dwResultPortrait"); image.src = asset(hero.avatar); image.alt = hero.name; card.append(image); }
        card.append(el("div", player?.name || "Player " + side, "resultPlayer"), el("div", outcome, "resultOutcome"), el("small", g.rematch.includes(side) ? "✓ SẴN SÀNG CHƠI LẠI" : "ĐANG QUYẾT ĐỊNH"));
        result.append(card);
      }
      box.append(result);
      box.append(
        btn(
          g.rematch.includes(state.side) ? "Đang chờ đấu lại" : "Đấu lại",
          () => command({ type: "REMATCH" }),
          g.rematch.includes(state.side),
        ),
      );
      box.append(btn("Rời phòng", () => $("leave").click()));
    }
  }
  function renderDraft(box) {
    const p = effectivePreview(),
      sk = p?.skill;
    box.append(
      el(
        "h2",
        sk?.name || (draft.value.type === "MOVE" ? "Di chuyển" : "Đánh thường"),
      ),
    );
    if (sk?.description) box.append(el("p", sk.description));
    if (draft.preview?.skill?.mechanic === "COPY")
      box.append(
        select(
          "Kỹ năng sao chép",
          [
            ["", "Chọn kỹ năng"],
            ...draft.preview.copies.map((p) => [p.skill.id, p.skill.name]),
          ],
          draft.copyId,
          (v) => {
            draft.copyId = v;
            draft.targets = [];
            draft.cell = null;
            render();
          },
        ),
      );
    if (
      ["MORPH", "CONVERT", "SUMMON"].includes(sk?.mechanic) &&
      !sk.parameters?.summonClass
    )
      box.append(
        select(
          "Loại lính",
          p.kinds.map((k) => [k.id, k.name]),
          draft.kind,
          (v) => {
            draft.kind = v;
          },
        ),
      );
    if (sk?.mechanic === "DICE_WARD")
      for (const i of [0, 1])
        box.append(
          select(
            "Số xúc xắc " + (i + 1),
            [1, 2, 3, 4, 5, 6].map((n) => [String(n), String(n)]),
            String(draft.dice[i]),
            (v) => {
              draft.dice[i] = Number(v);
            },
          ),
        );
    const needsCell =
      draft.value.type === "MOVE" ||
      ["SUMMON", "ESCAPE"].includes(sk?.mechanic);
    const optionOnly = ["MORPH", "DICE_WARD", "COPY"].includes(sk?.mechanic);
    const canConfirm =
      draft.preview?.skill?.mechanic === "COPY" && !draft.copyId
        ? false
        : needsCell
          ? !!draft.cell
          : optionOnly ||
            sk?.target?.side === "SELF" ||
            draft.targets.length > 0;
    box.append(
      el(
        "p",
        needsCell
          ? "Chọn ô sáng trên bàn cờ."
          : optionOnly
            ? "Chọn thông số rồi xác nhận."
            : "Chọn mục tiêu viền xanh trên bàn cờ. Tối đa " +
              (p?.maxTargets || 1) +
              " mục tiêu.",
        "hint",
      ),
    );
    if (draft.targets.length)
      box.append(el("p", "Đã chọn: " + draft.targets.map(unitName).join(", ")));
    box.append(
      btn("Xác nhận hành động", submitDraft, !canConfirm),
      btn("Hủy lựa chọn", () => {
        draft = null;
        render();
      }),
    );
  }
  function renderControls() {
    const box = $("controls"),
      g = state.game,
      o = g.options;
    box.replaceChildren();
    if (g.phase !== "battle") return;
    if (draft) {
      renderDraft(box);
      return;
    }
    box.append(el("h2", "Lượt " + g.turn + " · Player " + g.battleSide));
    if (g.reaction) {
      box.append(el("p", "Đang chờ phản ứng với " + g.reaction.card.name));
      if (o.counter) {
        for (const c of o.counter)
          box.append(
            btn("Hủy bằng " + cardName(c.cardUid), () =>
              command({ type: "COUNTER_CARD", cardUid: c.cardUid }),
            ),
          );
        box.append(
          btn("Bỏ qua hủy trang bị", () => command({ type: "PASS_COUNTER" })),
        );
      }
      return;
    }
    if (Object.hasOwn(o, "post")) {
      if (o.post) {
        for (const uid of o.post)
          box.append(
            btn("Phản sát thương · " + cardName(uid), () =>
              command({ type: "POST_HIT", cardUid: uid }),
            ),
          );
        box.append(
          btn("Bỏ qua phản sát thương", () => command({ type: "POST_HIT" })),
        );
      } else box.append(el("p", "Đối thủ đang chọn phản sát thương."));
      return;
    }
    if (o.steal) {
      box.append(el("p", "Chọn một trang bị của đối thủ để lấy."));
      for (const c of o.steal)
        box.append(
          btn(c.name, () => command({ type: "STEAL_CHOOSE", cardUid: c.uid })),
        );
      return;
    }
    if (o.continuation) {
      actorId = o.actorId;
      box.append(el("p", g.notice || "Chọn mục tiêu cho lần đánh tiếp theo."));
      box.append(
        btn("Chọn tiếp", () =>
          startDraft({ type: "CONTINUE" }, o.continuation),
        ),
      );
      if (o.recovery)
        box.append(btn("Bỏ qua đòn", () => command({ type: "SKIP_CONTINUE" })));
      return;
    }
    if (g.pending) {
      box.append(
        el(
          "p",
          unitName(g.pending.a) +
            " → " +
            unitName(g.pending.d) +
            " · " +
            (g.pending.skill || "Đánh thường"),
        ),
      );
      if (unit(g.pending.d)?.side === state.side) {
        box.append(
          btn("Nhận đòn / Bỏ qua phòng thủ", () => command({ type: "DEFEND" })),
        );
        for (const id of o.guards || [])
          box.append(
            btn("Đỡ đòn · " + unitName(id), () =>
              command({ type: "DEFEND", guardId: id }),
            ),
          );
      }
    }
    const actors = o.actors || [];
    if (!actors.length) {
      box.append(el("p", "Đang chờ đối thủ xử lý."));
      return;
    }
    if (!actors.some((a) => a.id === actorId)) actorId = actors[0].id;
    box.append(
      select(
        "Quân điều khiển",
        actors.map((a) => [a.id, unitName(a.id)]),
        actorId,
        (id) => {
          actorId = id;
          render();
        },
      ),
    );
    const a = actors.find((a) => a.id === actorId);
    if (a.moves.length)
      box.append(
        btn("Di chuyển", () =>
          startDraft({ type: "MOVE", actorId }, { cells: a.moves }),
        ),
      );
    for (const attack of a.attacks.filter((a) => a.targetIds.length))
      box.append(
        btn(
          "Đánh thường" +
            (attack.cardUid ? " + " + cardName(attack.cardUid) : ""),
          () =>
            startDraft(
              { type: "ATTACK", actorId, cardUid: attack.cardUid },
              attack,
            ),
        ),
      );
    for (const sk of a.skills) {
      box.append(
        btn(sk.skill.name, () =>
          startDraft({ type: "SKILL", actorId, skillNo: sk.n }, sk),
        ),
      );
      for (const attach of sk.attachments || [])
        box.append(
          btn(sk.skill.name + " + " + cardName(attach.cardUid), () =>
            startDraft(
              {
                type: "SKILL",
                actorId,
                skillNo: sk.n,
                cardUid: attach.cardUid,
              },
              attach,
            ),
          ),
        );
    }
    for (const c of a.cards.filter((c) => c.standalone))
      box.append(
        btn(cardName(c.uid), () => {
          if (
            catalog.cards
              .find((x) => x.id === card(c.uid)?.id)
              ?.effects.includes("EFFECT_STEAL_EQUIPMENT")
          )
            return command({ type: "CARD", actorId, cardUid: c.uid });
          if (!c.preview)
            return command({ type: "CARD", actorId, cardUid: c.uid });
          startDraft({ type: "CARD", actorId, cardUid: c.uid }, c.preview);
        }),
      );
    if (o.canEndTurn)
      box.append(btn("Kết thúc lượt", () => command({ type: "END_TURN" })));
  }
  const NS = "http://www.w3.org/2000/svg";
  function svg(tag, attributes) {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attributes)) n.setAttribute(k, v);
    return n;
  }
  const point = (c) => ({
    x: 500 + Math.sqrt(3) * 46 * (c.q + c.r / 2),
    y: 440 + 69 * c.r,
  });
  const cellEqual = (a, b) => a && b && a.q === b.q && a.r === b.r;
  function clickCell(c) {
    const g = state.game;
    if (
      g.phase === "deploy" &&
      g.selecting === state.side &&
      c.zone === state.side &&
      !g.units.some((u) => cellEqual(c, u))
    ) {
      const units = deployUnits(),
        old = { ...units[deploySlot] },
        existing = units.findIndex((u) => cellEqual(c, u));
      units[deploySlot] = { ...units[deploySlot], q: c.q, r: c.r };
      if (existing >= 0 && existing !== deploySlot)
        units[existing] = { ...units[existing], q: old.q, r: old.r };
      render();
      return;
    }
    if (draft && effectivePreview()?.cells?.some((x) => cellEqual(x, c))) {
      draft.cell = { q: c.q, r: c.r };
      render();
    }
  }
  function clickUnit(u) {
    if (draft) {
      const p = effectivePreview();
      if (!p?.targetIds?.includes(u.id)) return;
      if (draft.targets.includes(u.id))
        draft.targets = draft.targets.filter((id) => id !== u.id);
      else if ((p.maxTargets || 1) === 1) draft.targets = [u.id];
      else if (draft.targets.length < p.maxTargets) draft.targets.push(u.id);
    } else if (u.side === state.side) actorId = u.id;
    render();
  }
  function renderBoard() {
    const board = $("board"),
      g = state.game,
      p = effectivePreview();
    board.replaceChildren();
    const isDeploy = g.phase === "deploy" && g.selecting === state.side;
    for (const c of catalog.cells) {
      const { x, y } = point(c),
        points = Array.from({ length: 6 }, (_, i) => {
          const a = ((60 * i - 30) * Math.PI) / 180;
          return x + 46 * Math.cos(a) + "," + (y + 46 * Math.sin(a));
        }).join(" ");
      const valid = isDeploy
        ? c.zone === state.side
        : p?.cells?.some((a) => cellEqual(c, a));
      const n = svg("polygon", {
        points,
        class:
          "hex" +
          (valid ? " valid" : "") +
          (cellEqual(draft?.cell, c) ? " chosen" : ""),
        "data-cell": c.q + "," + c.r,
      });
      n.onclick = () => clickCell(c);
      board.append(n);
    }
    const units = [
      ...g.units.filter((u) => u.hp > 0),
      ...(isDeploy
        ? deployUnits().map((u, i) => ({
            ...u,
            id: "deploy-" + i,
            side: state.side,
            ghost: true,
            hp:
              definition(u.definitionId).stats?.hp ||
              definition(u.definitionId).hp,
          }))
        : []),
    ];
    units.sort((a,b) => point(a).y - point(b).y);
    for (const u of units) {
      const { x, y } = point(u),
        h = catalog.heroes.find((h) => h.id === u.definitionId),
        t = catalog.troops.find((t) => t.canonicalId === u.definitionId);
      const chosen =
        draft?.targets.includes(u.id) ||
        actorId === u.id ||
        (u.ghost && u.id === "deploy-" + deploySlot);
      const n = svg("g", {
        class:
          "unit" +
          (chosen ? " selected" : "") +
          (p?.targetIds?.includes(u.id) ? " target" : "") +
          (u.ghost ? " ghost" : "") +
          (u.attacked ? " used" : ""),
        "data-unit": u.id,
        "aria-label": (h?.name || t?.name) + " · Player " + u.side,
      });
      // Keep the click area inside its hex; transparent art margins must not cover neighboring moves.
      n.append(
        svg("ellipse", {
          cx: x,
          cy: y - 8,
          rx: 30,
          ry: 38,
          class: "unitHit",
          fill: "transparent",
          "pointer-events": "all",
        }),
      );
      n.append(
        svg("ellipse", {
          cx: x,
          cy: y + 15,
          rx: 32,
          ry: 20,
          class: "ring",
          stroke: u.side === 1 ? "#61b9fb" : "#e06559",
        }),
      );
      const visualUnit = {...u, kind: t?.kind || u.kind};
      const camera = (h || t) && typeof HeroBoardVisuals !== 'undefined'
        ? HeroBoardVisuals.create(h ? u.definitionId : HeroBoardVisuals.troopId(visualUnit), HeroBoardVisuals.pose(visualUnit),
            {x, y: y + 18}, {resolve: asset, label: h?.name || t.name, className: h ? 'heroBoardSprite' : 'troopSprite troopFacingSprite'})
        : null;
      if (camera) {
        n.append(camera.root);
        camera.image.addEventListener('error', () => {
          camera.root.setAttribute('visibility','hidden');
          const fallback = svg('image', {
            href: asset(h?.board || './assets/troops-compact-dw-style-01/' + t.kind + (u.side === 1 ? '-blue.webp' : '-red.webp')), x: x - camera.entry.frame.width / 2,
            y: y + 18 - camera.entry.frame.height * .96,
            width: camera.entry.frame.width, height: camera.entry.frame.height,
            class: h ? 'heroBoardFallback' : 'troopBoardFallback', 'pointer-events': 'none',
          });
          fallback.addEventListener('error', () => {
            fallback.setAttribute('visibility','hidden');
            const glyph = svg('text', {x, y: y - 8});
            glyph.textContent = (h?.name || t.name).slice(0,2); n.append(glyph);
          }, {once:true});
          n.insertBefore(fallback, camera.root.nextSibling);
        }, {once:true});
      } else if (h || t)
        n.append(
          svg("image", {
            href: asset(
              h?.board ||
                "./assets/troops-compact-dw-style-01/" +
                  t.kind +
                  (u.side === 1 ? "-blue.webp" : "-red.webp"),
            ),
            x: x - 49,
            y: y - 72,
            width: 98,
            height: 98,
          }),
        );
      const text = svg("text", { x, y: y + 39 });
      text.textContent = "P" + u.side + " · " + u.hp + " HP";
      n.append(text);
      if (u.statuses?.length) {
        const status = svg("text", { x, y: y - 61 });
        status.textContent = u.statuses
          .map(
            (s) =>
              ({
                ROOT: "Trói",
                STUN: "Choáng",
                FREEZE: "Đóng băng",
                SILENCE: "Câm lặng",
              })[s.kind] || s.kind,
          )
          .join(", ");
        n.append(status);
      }
      n.onclick = () => {
        if (u.ghost) {
          deploySlot = Number(u.id.slice(7));
          render();
        } else clickUnit(u);
      };
      board.append(n);
    }
  }
  function syncPresentationTabs() {
    $("onlineDock").dataset.tab = presentationTab;
    const mobile = innerWidth < 900;
    for (const button of $("onlineTabs").querySelectorAll("button")) {
      const selected = button.dataset.onlineTab === presentationTab;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
      const panel = $(button.getAttribute("aria-controls"));
      panel.setAttribute("role", mobile ? "tabpanel" : "region");
      if (mobile && state?.game.phase === "battle") panel.setAttribute("aria-hidden", String(!selected));
      else panel.removeAttribute("aria-hidden");
    }
  }
  function renderPresentation() {
    const g = state?.game;
    document.body.classList.toggle("dwOnlineBattle", g?.phase === "battle");
    document.body.dataset.uiPhase = g?.phase || "lobby";
    $("onlineActorInfo").replaceChildren();
    $("onlineTurnAction").replaceChildren();
    if (!g) return;
    const actor = unit(actorId) || g.units.find((u) => u.hero && u.side === state.side);
    const box = $("onlineActorInfo");
    box.append(el("h3", "HERO / ĐƠN VỊ ĐANG CHỌN"));
    if (actor) {
      const h = catalog.heroes.find((entry) => entry.id === actor.definitionId);
      const identity = el("div", undefined, "onlineActorIdentity");
      if (h?.avatar) { const image = el("img"); image.src = asset(h.avatar); image.alt = h.name; identity.append(image); }
      const copy = el("div"); copy.append(el("strong", unitName(actor.id)), el("p", "HP " + actor.hp + " · Phe " + actor.side));
      identity.append(copy); box.append(identity);
    } else box.append(el("p", "Chọn một đơn vị của bạn trên bàn cờ."));
    const controls = $("controls");
    for (const label of controls.querySelectorAll("label")) {
      if (label.textContent.startsWith("Quân điều khiển")) box.append(label);
    }
    const actions = el("div", undefined, "row");
    for (const button of controls.querySelectorAll('[data-ui-action="unit"]')) actions.append(button);
    box.append(actions);
    for (const button of controls.querySelectorAll('[data-ui-action="turn"]')) $("onlineTurnAction").append(button);
    if (draft || g.pending || g.reaction || Object.hasOwn(g.options || {}, "post")) presentationTab = "skills";
    syncPresentationTabs();
  }
  $("onlineTabs").onclick = (event) => {
    const button = event.target.closest("[data-online-tab]");
    if (!button) return;
    presentationTab = button.dataset.onlineTab;
    syncPresentationTabs();
  };
  $("onlineTabs").onkeydown = (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const buttons = [...$("onlineTabs").querySelectorAll("button")], index = buttons.indexOf(document.activeElement);
    if (index < 0) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? 2 : (index + (event.key === "ArrowRight" ? 1 : 2)) % 3;
    buttons[next].click(); buttons[next].focus();
  };
  $("roomCode").addEventListener("input", () => $("roomCode").removeAttribute("aria-invalid"));
  window.addEventListener("resize", syncPresentationTabs);
  function render() {
    if (!catalog) return;
    $("createRoom").disabled = $("joinRoom").disabled =
      joining || !socket?.connected || !!session;
    $("lobby").hidden = !!state;
    $("room").hidden = !state;
    if (!state) { renderPresentation(); return; }
    const g = state.game;
    $("room").dataset.revision = String(state.revision);
    $("room").dataset.phase = g.phase;
    $("roomLabel").textContent = "PHÒNG " + state.code;
    $("players").textContent = state.players
      .map(
        (p) =>
          "P" +
          p.side +
          " · " +
          p.name +
          (p.side === state.side ? " (bạn)" : ""),
      )
      .join(" / ");
    renderSetup();
    renderControls();
    renderBoard();
    $("hand").replaceChildren();
    for (const c of g.hand) {
      const figure = el("figure"),
        meta = catalog.cards.find((x) => x.id === c.id),
        img = el("img");
      img.src = asset(meta?.src);
      img.alt = c.name;
      img.loading = "lazy";
      figure.title = c.text;
      figure.append(img, el("figcaption", c.name + " · " + "★".repeat(c.star)));
      $("hand").append(figure);
    }
    $("opponentHand").textContent =
      "Đối thủ còn " + g.opponentHandCount + " trang bị (ẩn).";
    $("events").replaceChildren(
      ...g.events.map((e) => el("li", "Lượt " + e.turn + " · " + e.message)),
    );
    for (const b of document.querySelectorAll(
      "#setup button, #controls button",
    ))
      if (
        outbox ||
        sending ||
        !socket?.connected ||
        !authenticated ||
        state.revision < ackRevision
      )
        b.disabled = true;
    renderPresentation();
    updateClock();
  }
  function updateClock() {
    const c = state?.game.clock;
    $("clock").textContent = c
      ? (c.side ? "P" + c.side + " · " : "") +
        ({
          setup: "Chuẩn bị",
          turn: "Lượt",
          defense: "Phòng thủ",
          counter: "Hủy trang bị",
          post: "Phản sát thương",
          steal: "Lấy trang bị",
        }[c.kind] || "") +
        ": " +
        Math.ceil(
          Math.max(0, c.remainingMs - (performance.now() - clockReceived)) /
            1000,
        ) +
        "s"
      : "";
  }
  $("createRoom").onclick = () => enter("room:create").catch(showError);
  $("joinRoom").onclick = () => enter("room:join").catch(showError);
  $("sync").onclick = () => (outbox ? flush() : sync()).catch(showError);
  $("leave").onclick = async () => {
    if (state && state.game.phase !== "ended") {
      try {
        await command({ type: "SURRENDER" });
      } catch (e) {
        showError(e);
        return;
      }
    }
    if (outbox) {
      notice("Cần đồng bộ lệnh đang chờ trước khi rời phòng.");
      return;
    }
    if (state && state.game.phase !== "ended") {
      notice("Chưa xác nhận được đầu hàng. Hãy đồng bộ rồi thử rời phòng lại.");
      return;
    }
    session = null;
    state = null;
    authenticated = false;
    ackRevision = -1;
    save();
    socket.disconnect().connect();
    render();
  };
  async function boot() {
    const health = await fetch(BASE + "/api/health", {
      cache: "no-store",
    }).then((r) => {
      if (!r.ok) throw Error("Server HTTP " + r.status);
      return r.json();
    });
    if (health.protocol !== 1) throw Error("PROTOCOL_MISMATCH");
    catalog = await fetch(BASE + "/api/catalog").then((r) => r.json());
    const loader = el("script");
    loader.src = BASE + "/socket.io/socket.io.js";
    await new Promise((resolve, reject) => {
      loader.onload = resolve;
      loader.onerror = () => reject(Error("SOCKET_CLIENT_UNAVAILABLE"));
      document.head.append(loader);
    });
    socket = globalThis.io(BASE, {
      transports: ["websocket", "polling"],
      autoConnect: false,
    });
    socket.on("connect", () => {
      epoch++;
      authenticated = false;
      resume().catch((error) => {
        showError(error);
        if (transient.has(error.message)) retry();
      });
      render();
    });
    socket.on("state", receive);
    socket.on("disconnect", () => {
      epoch++;
      authenticated = false;
      clearTimeout(retryTimer);
      retryTimer = null;
      $("connection").textContent = "Mất kết nối · đang thử lại";
      render();
    });
    socket.on("connect_error", () => {
      $("connection").textContent = "Chưa kết nối được server";
    });
    socket.on("notice", (data) => showError(Error(data.code)));
    notice("");
    socket.connect();
    setInterval(updateClock, 250);
    render();
  }
  async function start() {
    try {
      await boot();
    } catch (error) {
      $("connection").textContent = "Server chưa khả dụng";
      notice(
        "Chưa kết nối được server online tại " +
          BASE +
          ". " +
          error.message +
          ". Trang này cần backend DozenWar đang chạy.",
      );
      $("createRoom").disabled = $("joinRoom").disabled = true;
      if (
        !socket &&
        !["PROTOCOL_MISMATCH", "Server HTTP 404"].includes(error.message)
      )
        setTimeout(start, 3000);
    }
  }
  start();
})();
