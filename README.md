# DOZEN WAR II v1.40.22 - Duel desktop map fit

This step continues the regression-gated Part 13.8 cleanup without redesigning locked Core gameplay.

## Changes

- REMOVE comment-only `src/legacy/legacy-prelude-a-head.js` from the runtime.
- RELOCATE the exact `DW_SHELL` MatchResult delivery kernel from `src/legacy/legacy-prelude-b.js` to `src/shell/shell-kernel-runtime.js`.
- REMOVE the old legacy-prelude-b path.
- ADD `LEGACY_DEPENDENCY_AUDIT.md` documenting why the remaining legacy files are not yet safe to delete.
- UPDATE runtime order/build metadata only.

No gameplay rule is intentionally changed.

## Commands

- `npm run dev`
- `npm run validate`
- `npm run build`
- `npm run preview`
- `npm run report`

## v1.35 / Part 13.8C

Remaining legacy dependency reduction, regression-gated:
- Presentation now owns the embedded Hero fallback resource.
- Debug owns the playtest QA API.
- Shell owns boot/reset/main-button wiring.
- The former mixed `legacy-post-runtime.js` is removed.
- Core gameplay rules remain locked and unchanged.

Next gate: Part 13.8D final Content/Mode boundary check before normal Hero / Equipment / Mode Rule expansion resumes.

## Part 13.8D — Final Content / Mode Boundary Gate
The v1.36 gate is intentionally **CONDITIONAL**, not a false all-green signoff. Equipment and Mode/Mode Rule boundaries are ready. The audit found two blockers before multiple new Heroes/Skills can be safely playable: class-shaped Hero runtime identity (`HEROES[kind]`) and explicit current Skill-ID branches in Core targeting/effect application. See `CONTENT_MODE_BOUNDARY_GATE.md`.

No gameplay rule was changed in Part 13.8D. The next task is the behavior-preserving Hero/Skill Content Readiness Fix, after which normal ADD Hero / Equipment / Skill / Mode Rule work becomes the primary workflow.


## v1.37 — Hero / Skill Content Readiness

Hero identity is now definitionId-first. Class remains a separate gameplay property. The playable runtime no longer resolves Hero stats, presentation, or Skills through `HEROES[kind]`. Current Skill special cases have been moved to generic metadata/effect checks while preserving the existing three Heroes' behavior. Content expansion is now the primary workflow.

## v1.38 — Foundation Stabilization

- Consolidated the three `resetTurnFlags` wrappers into one implementation while retaining all turn reset side effects.
- Added six deterministic gameplay checks for turn reset, Pierce, line Skill, Guard redirection, and lethal Reflect. These use the runtime functions from source with controlled state.
- Prevented Pierce and line Skill damage from leaving unit HP below zero.
- Updated Bot difficulty descriptions to match the current heuristic implementation; no search tree is implemented.
- `npm run build` now runs validation, content readiness checks, and gameplay checks before writing `dist/`.

This release does not implement multiplayer, Three.js, a unified Action Dispatcher, or a full browser playthrough. Other legacy wrappers remain. The original v1.37 archive is the comparison baseline.

## v1.39 — Duel action rule

In `MODE_DUEL_001`, committing an ACTIVE Skill consumes the Hero action just like an Attack. A cancelled target selection consumes neither the action nor a Card. DEFENSE_REACTION Skills remain separate reactions.

Damage Skills may attach one eligible attack Equipment from the acting Hero's hand while choosing targets. The Card is consumed once on confirmation; its effects and damage apply to each hit in a multi-target Skill. Interaction Power uses the higher of Skill ★ and Equipment ★, with equal power awarded to the later defense response. Support and defense Skills do not attach attack Equipment.

The deck and Card distribution remain unchanged. Other Mode rules are unchanged.

## v1.40 — Pending Equipment and sequential defense

Choose an eligible attack Card in the action popup, confirm it as pending, then choose a normal Attack or an active Skill. The Card remains in hand until a legal action is committed. The attached Card contributes its applicable effects and maximum Star according to Core rules. One Card applies to every target of a multi-target damage Skill and is consumed once.

Eligible attack Cards can also attach to support Skills. Because support Skills have no attack resolution, the Card is consumed on Skill confirmation and its entire attack payload is kept on the acting Hero for their next normal Attack, across turn resets. Another attack Card cannot be attached while that payload is queued.

Each incoming hit opens a separate defense choice. A defensive Skill may be used on one hit; later hits may use available defense Equipment without a per-turn Card cap, or choose no defense. A single hit still takes only one defense response.

Both Heroes and troops may use eligible attack and defense Equipment. An Equipment Card must match the unit's class or be neutral, and its type must fit the action (attack or defense; neutral fits either). Troops attach attack Equipment to a normal Attack and can use defense Equipment for an incoming hit. ACTIVE Skills belong to Heroes; a Hero may also attach eligible attack Equipment to an ACTIVE Skill.

## v1.40.2 — Bot combat and tactics

The Bot now ranks lethal hits, Hero threats, Guard protection, legal Equipment, and safe positions. Its Heroes can use ACTIVE Skills when their effect exceeds a normal Attack. Easy chooses among simple legal actions; Normal adds tactical target selection and some positional variety; Hard protects low-HP Heroes, looks for finishing attacks and uses Cards when beneficial. A completed hit or Skill sequence advances the Bot's remaining actions and returns the turn. When a human defender has no legal reaction, incoming damage resolves automatically. With a legal defense choice, select it or press **KHÔNG ĐỠ ĐÒN** to take damage. The end-turn button stays disabled while a defense response is pending. Hero death opens the result and rematch UI.

## v1.40.3 — Duel result UI

Duel victory is resolved when a Hero reaches 0 HP after combat effects finish. The match result now tolerates incomplete room metadata: it opens the result UI before rendering rematch details. If an interrupted result render left `matchEnded` set but the overlay hidden, the next victory check may reopen it. `npm run test:result-ui` executes the actual combat resolver, Duel rule and result UI code against a DOM state harness for win, loss, draw, no result, and interrupted room metadata. The local app could not be opened in the available remote browser, so a complete browser playthrough remains to be checked on the player's machine.

## v1.40.4 — Hero and troop action status

During battle, a Hero or troop with no action has no badge. After any movement, a crossed shoe badge appears; it indicates movement already used, even if Move remains. After a normal Attack, active Skill, or skip action, a red X badge replaces it and the acting unit cannot be selected again to issue orders this turn. The unit remains a valid target for attacks, Skills, and Guard reactions. Badges read existing Core flags and reset when that side starts its next turn. `npm run test:action-visual` checks both unit types, render state, reset behavior, and targeting priority.

## v1.40.5 — Rodoc

Rodoc is an Infantry Hero (3 HP, Move 1, normal Attack 1 damage in a radius of 1). The Hero picker lists Rodoc with a temporary E glyph until final art arrives. Hồi sức (★3) is a defense reaction that heals one injured Infantry ally or Rodoc within three hexes, before the incoming hit resolves; it does not cancel that hit unless an attached defense Equipment cancels it. Eligible defense Equipment may join the reaction: its effects apply and the higher ★ between Card and Skill decides Interaction Power. Tiếng thét xung trận (★1) grants +2 Move to up to two Infantry allies or Rodoc within three hexes and expires at the end of their current side turn. Chiến Thần (★1) deals 1 damage each to up to four selected enemies on a single line up to four hexes away, resolving a separate defense reaction for every hit. Skill use limits follow each mode.

The design did not specify the damage number of Chiến Thần; this build uses the Hero normal Attack value (1 per target). Healing requires a living target that is already missing HP.

## v1.40.6 — Chiến Thần + Equipment

Chiến Thần deals 1 base damage per enemy. Attaching one eligible attack Equipment Card adds that Card’s damage and attack effects to each of the up to four separate hits. Each hit uses the higher ★ of Skill and Card for its defense interaction. The Card is spent once for the full sequence, and Rodoc finishes their action on confirmation. `npm run test:gameplay` includes a four-target Rodoc regression with +1 damage, Guard bypass, ★3 Card versus ★1 Skill and single Card consumption.

## v1.40.11 — EST

EST is an Infantry Hero with 3 HP, Move 1 and a 1-damage normal Attack in radius 1; the token uses a temporary E glyph. Phi thân (defense ★1) triggers when EST is attacked, swaps EST with one allied troop within three hexes, and redirects the incoming hit to that troop. Phục thù (defense ★1) retaliates for 1 damage each against up to two living enemies within three hexes of EST that have attacked EST’s side during this player turn, including the current attacker. The incoming hit still resolves and the retaliation is applied before victory is checked. Both reactions use the existing Equipment/Star rules and mode-defined usage limit.

Ác mộng phía đông (active ★1) temporarily adds 2 Move while its targeting panel is open. Use the Move button to choose an empty reachable hex, then select up to four adjacent enemies and confirm for 1 damage each with separate defense responses. Cancel restores EST’s original position and movement budget. Confirmation ends EST’s action; the Move bonus expires at the end of the current player turn. Eligible attack Equipment adds effects/damage per target and contributes the higher Star. The Bot also evaluates reachable hexes with the +2 Move bonus before choosing EST’s targets.

## v1.40.11 — Bot và kết quả trận

- Skill nhiều mục tiêu giải quyết phản ứng phòng thủ tuần tự ngay sau đòn trước, không để hẹn giờ giữ lượt chờ.
- Bot tiếp tục chuỗi skill bị gián đoạn, dọn lựa chọn mục tiêu còn sót và kết thúc lượt đúng lượt hiện hành.
- Màn hình kết quả được kiểm tra lại khi UI cập nhật sau khi Hero hết máu; lý do khóa nút kết thúc lượt hiển thị trong hướng dẫn.
- Kiểm thử hồi quy bổ sung cho Guard, nhiều mục tiêu, Hero tử trận và lượt Bot bị kẹt.

## v1.40.11 — Quyền điều khiển Bot

- Bàn cờ, nút kết thúc lượt và giao diện hành động không nhận lệnh người chơi khi tới lượt Bot; Bot tiếp tục dùng core để hành động.
- Tay bài Bot được ẩn trong lượt Bot; chọn quân và kéo quân Bot khi triển khai bị khóa.
- Người chơi vẫn chọn cách phòng thủ khi Bot tấn công, và không thể can thiệp khi Bot phòng thủ.
- Kiểm thử router bao gồm lượt Bot, phòng thủ của người chơi và phản ứng của Bot.

## v1.40.11 — Bot thích nghi trong từng trận

- Theo dõi hành động thực sự đã giải quyết của người chơi: xu hướng tấn công Hero, dùng Infantry Guard và Card phòng thủ. Bộ nhớ xóa khi bắt đầu trận mới.
- Bot tăng ưu tiên giữ Hero, hỗ trợ Guard hoặc dùng Card bỏ qua Guard theo quan sát (sau tối thiểu ba mẫu).
- Trong các phương án gần ngang điểm, Normal/Hard có xác suất chọn phương án khác; thứ tự quân được xoay theo lượt. Core vẫn kiểm tra mọi thao tác.
- Kiểm thử quan sát đúng phía người chơi, đáp trả Guard, chọn nước đi gần điểm và 25 lượt Bot liên tiếp.

## v1.40.11 — RULE_MODE Đối Đầu 1vs1

- Người thua Roll chọn Hero, rút Equipment và triển khai trước; người thắng Roll đi trước.
- Mỗi đơn vị có một quyền Move và một Attack mỗi lượt. Skill hỗ trợ không khóa Attack của Hero; Skill gây sát thương trực tiếp có ký hiệu Hero Attack sẽ khóa. Một Active Skill và một Attack Equipment trong lượt mình; một Defense Skill và một Defense Equipment trong lượt đối phương; mỗi Skill chỉ dùng một lần cả trận.
- Người đi trước thua nếu kết thúc năm lượt của mình liên tiếp mà không tấn công. Hero chết vẫn kết thúc trận ngay.
- Lượt công 180 giây, tạm dừng khi phòng thủ. Mỗi Defense Window có 30 giây; hết giờ tự Pass; hết giờ công tự End Turn.
- Bộ đếm hiển thị trên bàn cờ. Kiểm thử riêng cho đồng hồ, giới hạn, thứ tự setup, di chuyển và điều kiện thua.

## v1.40.12 — Timeout và kết quả trận

- Timeout 180 giây chỉ xử lý một lần cho mỗi lượt, xóa chuỗi chọn Skill còn treo và khởi tạo lại đồng hồ khi chuyển lượt thành công.
- Timeout phòng thủ 30 giây chỉ bỏ qua một lần cho mỗi đòn.
- Khi Hero hết HP, đồng hồ và End Turn kiểm tra lại kết quả để hiển thị Thắng/Thua. Nhánh đòn đánh mất mục tiêu cũng đóng cửa sổ phòng thủ, kiểm tra thắng thua và cập nhật giao diện.

## v1.40.13 — Khởi tạo Core trên trình duyệt

- Core tự đóng băng cấu hình kiến trúc trước khi Content được nạp. Khắc phục lỗi `DW_CORE` chưa khởi tạo khiến Hero HP 0 không hiển thị kết quả và trận vẫn đổi lượt.
- Có bài kiểm tra nạp riêng file Core theo đúng thứ tự script của trang phát triển.

## v1.40.14 — EST: Ác mộng phía đông

- Chọn Skill 3 vào trạng thái di chuyển tự do trong Move còn lại (cộng 2), có thể di chuyển nhiều chặng hoặc đứng yên.
- Nút TẤN CÔNG trong bảng Skill hoặc cạnh thông tin đơn vị lập tức chốt vị trí và tấn công tối đa 4 địch kề bên; mỗi mục tiêu vẫn được phòng thủ theo Core. Không cần dùng hết Move.
- Trang bị tấn công hợp lệ được chọn trước khi bấm TẤN CÔNG và áp dụng cho từng mục tiêu. Hủy trước khi tấn công trả vị trí và Move.

## v1.40.15 — EST chọn mục tiêu thủ công

- Ác mộng phía đông giữ Move linh hoạt; Player chạm thủ công tối đa 4 địch kề EST để chọn/bỏ chọn rồi nhấn TẤN CÔNG.
- Chỉ những mục tiêu đã chọn mới bị tấn công. Di chuyển tiếp xóa danh sách chọn cũ và cho phép chọn lại theo vị trí mới. Nút tấn công chỉ bật khi có ít nhất một mục tiêu hợp lệ.

## v1.40.16 — Hero kế thừa cơ chế của hệ

- Rodoc, EST và Hero Bộ binh được đỡ đòn cho đồng minh kề bên như Lính Bộ binh.
- Hero kế thừa nội tại từ định nghĩa Lính cùng hệ; giữ nguyên máu, Move, tầm đánh và Skill riêng.
- Hero Kỵ binh có Pierce cho đòn đánh thường theo cùng điều kiện của Lính Kỵ binh. Skill tiếp tục theo hiệu ứng riêng.
- Kiểm tra kiểu bắn đường thẳng của Hero Cung và trang bị đúng hệ cho cả ba lớp.

## v1.40.17 — Hệ Hero Giả Kim Thuật (ALCH)

- Hệ mới chỉ có Hero: mặc định Move 1, tầm đánh thường 1 theo bán kính. Sát thương đánh thường giữ core hiện tại là 1.
- Chỉ dùng trang bị chung (NEU); không dùng trang bị Bộ binh, Cung thủ, Kỵ binh hoặc bài riêng ALCH.
- Chưa có nội tại của hệ. Không kế thừa Guard, bắn đường thẳng hoặc Pierce.
- Chưa tạo Hero cụ thể: tên, máu, ba Skill và hình ảnh sẽ được thêm theo yêu cầu sau. Hero mới khai báo class ALCH tự nhận mặc định của hệ và xuất hiện qua HeroRegistry.
- Không thêm Lính ALCH; bộ chọn 5 Lính vẫn gồm ba hệ hiện tại.

## v1.40.18 — Highlight mục tiêu đang bị tấn công

- Ô mục tiêu sáng cam, vòng sáng quanh quân, biểu tượng tâm ngắm và nhãn BỊ TẤN CÔNG.
- Hiện ngay khi mở phản ứng phòng thủ cho đánh thường hoặc từng mục tiêu Skill, áp dụng Player và Bot.
- Chuyển sang quân đỡ đòn khi chọn Guard; tự xóa sau resolve, hủy hoặc kết thúc trận.
- Visual không chặn thao tác và không thay đổi chỉ số; hỗ trợ tắt chuyển động theo cài đặt hệ thống.

## v1.40.19 — Xóa ba Hero mặc định

- Xóa Hero Bộ binh, Hero Cung thủ, Hero Kỵ binh khỏi HeroRegistry và gói nội dung chơi.
- Danh sách hiện có: Rodoc và EST. Mặc định chọn Rodoc. Bot chọn từ HeroRegistry để không gọi Hero đã xóa.
- Giữ các hệ và Lính Bộ binh, Cung thủ, Kỵ binh cùng cơ chế kế thừa cho Hero mới.
- Giả Kim Thuật vẫn là hệ đã hỗ trợ, chưa có Hero cụ thể.

## v1.40.22 — Map Đối Đầu vừa khung PC

- Map cân theo chiều rộng khung chơi và chiều cao còn lại của cửa sổ PC, căn giữa và giữ tỷ lệ 1:1.
- Nền map và SVG/ô/quân cùng co giãn; không thay đổi 61 ô hoặc tọa độ Core.
- Tự cập nhật khi resize hoặc chuyển sang triển khai/trận đấu. Màn nhỏ dưới 900px giữ cách hiển thị theo chiều rộng.
- Khắc phục chiều rộng tối thiểu của cột map gây tràn ngang ở màn PC hẹp.

## v1.40.22 — Duel bottom control dock
Map above a responsive Hero / Skill / Card dock (23:33:44). Full HD: 64/756/260 px; laptop: 48/530/190 px. Original controls and map coordinates retained; current glyphs/artwork are placeholders. See docs/gameplay-layout.md.

## v1.40.22 — Full Duel viewport and camera
Added wheel/button zoom, empty-map/middle-mouse pan, Pan toggle and reset. Map background covers the viewport; world/hex proportions and deploy drag coordinates stay aligned. Popup anchors follow the camera without scaling UI.



## v1.44.0 — Trang bị

Bộ trang bị hoàn chỉnh: 29 mẫu / 60 lá, gồm Bộ binh 7/14, Cung thủ 6/13, Kỵ binh 6/11 và Dùng chung 10/22. Mỗi mẫu có ID/asset riêng, hỗ trợ Công, Thủ và Công–Thủ. Chi tiết luật và validation: [RELEASE_1_44_0.md](docs/equipment/RELEASE_1_44_0.md).
