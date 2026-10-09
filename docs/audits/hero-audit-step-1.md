# Bước 1 — Đối chiếu 12 Hero với luật đã chốt

Bản kiểm tra: mã nguồn 1.49.0 trong workspace. Ngày: 2026-10-09.
Phạm vi: 36 skill, định nghĩa nội dung, xử lý Core, các điểm nối với UI.
Chỉ bổ sung báo cáo và công cụ tái hiện; chưa sửa gameplay, chưa commit/push.

## Kết quả kiểm chứng

- `npm run test:heroes`: 32 trường hợp PASS.
- `npm run test:browser-heroes`: 141 trường hợp Core trình duyệt PASS; các flow map trực tiếp, phòng thủ trực tiếp và phát bài trước chọn quân cũng PASS.
- Kiểm tra bổ sung: `node tools/audit-hero-defense-targeting.cjs`.
- Dữ liệu tái hiện: [hero-audit-evidence.json](hero-audit-evidence.json).

PASS của bộ test cũ không đồng nghĩa mọi luật đều đúng. Ví dụ test thế mạng đặt trực tiếp `pending.cancel=true`, nên không kiểm chứng khả năng người chơi dùng card của lính thay thế.

## Các khác biệt đã tái hiện

| Vấn đề | Luật đã chốt | Mã hiện tại / kết quả tái hiện | Đề xuất sửa |
| --- | --- | --- | --- |
| Est — Phi Thân | Lính thay thế được dùng phản ứng phòng thủ hợp lệ. | Đổi vị trí và chuyển người nhận đòn đúng, nhưng `defenseSkillUsed=true` khiến card thủ của lính mới bị chặn. Probe: `replacement=true`, `cardAllowed=false`. | Tách trạng thái phòng thủ của người nhận cũ và người nhận mới; không tự cấp thêm ngân sách ngoài rule_mode. |
| Soul — Thây Độc | Lính thế mạng được phòng thủ; người tấn công vẫn mất 1 HP dù đòn bị hủy hoặc sát thương bằng 0. | Phần trả 1 HP đúng; lính mới cũng bị chặn card thủ như Est. | Sửa chung cơ chế thay người nhận đòn, giữ nguyên trả HP trực tiếp. |
| Grim — Cải Tạo Nhanh | Trong lượt thủ, đổi hệ trước sát thương và cho lính dùng phản ứng hợp lệ của hệ mới. | UI đổi bộ binh thành cung thủ rồi xử lý đòn ngay. Probe: cung thủ về 0 HP, `pending=false`; không còn bước chọn phòng thủ mới. | Giữ đòn chờ sau đổi hệ và cập nhật lựa chọn phòng thủ cho lính. |
| Lucy — Bắn Trả | Chọn tối đa hai địch trong tầm bắn cơ bản của cung thủ; không dùng buff/trang bị. | UI/Core chọn mục tiêu cho phép mục tiêu lệch đường bắn. Khi xử lý, Core kiểm tra đường thẳng và bỏ qua mục tiêu đó. Probe: mục tiêu hợp lệ ở bước chọn nhưng vẫn nguyên 2 HP. | Thống nhất highlight/chọn mục tiêu với kiểm tra tầm bắn thực tế. |
| Raen — Tên Lưới | Chọn địch trong tầm bắn, đẩy theo đường thẳng từ Raen qua mục tiêu. | Cho chọn địch không nằm trên một trong các đường thẳng hex. Không tìm được hướng đẩy nên mục tiêu đứng nguyên, nhưng vẫn bị ROOT. | Với tầm bắn cung thủ theo đường thẳng hiện tại, chỉ cho chọn mục tiêu có hướng đẩy hợp lệ. |

Vị trí liên quan:
- `src/core/hero-roster-runtime.js`: `candidate`, `applySelection`, `afterHit`.
- `src/core/equipment-runtime.js`: `canUse`, `canDefend`.
- `src/ui/combat-flow-ui-runtime.js`: `commit`.
- `src/ui/direct-defense-flow-runtime.js`: `guards`.

## Đối chiếu đủ 36 skill

“Khớp phần đã rà” nghĩa là định nghĩa và các nhánh xử lý đã xem phù hợp với luật; không phải tuyên bố đã thử hết mọi tổ hợp skill/card/map. Tất cả Hero giữ HP tối đa 3.

| Hero / hệ | Skill | Sao / lượt / Attack | Luật đã chốt và trạng thái hiện tại |
| --- | --- | --- | --- |
| Est / Bộ binh | Phi Thân | 1 / Thủ / Không | Đổi chỗ với một lính phe ta trong 3 ô; lính nhận đòn thay. **Sai bước phòng thủ của lính thay thế**, xem trên. |
| Est | Phục Thù | 1 / Thủ / Không | Tối đa hai địch đã đánh đồng đội trong lượt công hiện tại; đồng đội bị đánh nằm trong 3 ô, kể cả đã chết; mỗi địch mất 1 HP. Khớp phần đã rà. |
| Est | Ác Mộng Phía Đông | 1 / Công / Không | Buff +2 ô di chuyển và +3 mục tiêu, tổng cơ bản tối đa 4; đòn sau mới commit; sát thương cơ bản, trang bị có thể tăng mục tiêu. Khớp phần đã rà. |
| Kazu / Bộ binh | Khiên Rồng | 1 / Thủ / Không | Hủy phần đòn đánh lên Kazu hoặc một lính phe ta trong 1 ô. Khớp phần đã rà. |
| Kazu | Khóa Xích | 2 / Công / Có | Một địch trên đường thẳng tối đa 3 ô, 2 sát thương; stun đến hết lượt công kế tiếp của bên bị stun, cấm di chuyển/đánh/Guard/phản ứng/skill thủ. Khớp phần đã rà. |
| Kazu | Xích Quỷ Kazu | 3 / Công / Có | Một địch trên đường thẳng tối đa 4 ô, đường trống và hex đích trống; gây 1 sát thương trước rồi kéo nếu còn sống; cấm Guard bộ binh. Không tăng số mục tiêu, có thể tăng số lần. Khớp phần đã rà. |
| Rodoc / Bộ binh | Hồi Sức | 3 / Thủ / Không | Hồi 1 HP cho bộ binh/Hero bộ binh sống, thiếu HP trong 3 ô; dùng tự do trong lượt thủ. Được kết hợp Bình Máu khi tổng hồi không vượt maxHP và đủ sống qua đòn. Khớp phần đã rà. |
| Rodoc | Tiếng Thét Xung Trận | 1 / Công / Không | Tối đa hai bộ binh phe ta trong 3 ô nhận +2 di chuyển trong lượt công; đã di chuyển vẫn nhận, đã Attack không nhận. Khớp phần đã rà. |
| Rodoc | Chiến Thần | 1 / Công / Có | Tối đa bốn địch cùng đường thẳng trong 4 ô, 1 sát thương/mục tiêu; chọn được sau quân đứng giữa; không tự có xuyên. Khớp phần đã rà; xử lý vật cản cần chốt rõ hơn. |
| Mask / Kỵ binh | Ma Kích | 1 / Công / Có | Tối đa hai địch cùng đường thẳng trong 3 ô; 1 sát thương/mục tiêu, chọn được sau quân, không tự gây lan. Khớp phần đã rà. |
| Mask | Phán Quyết | 1 / Công / Không | Một kỵ binh phe ta trong 3 ô nhận +1 lần đánh, chưa Attack; các lần đánh trong cùng commit mở phòng thủ riêng. Khớp phần đã rà. |
| Mask | Cán Cân Công Lý | 4 / Công / Có | Một Hero địch trên đường thẳng tối đa 3 ô; dice chẵn gây/hồi 2, lẻ 1; Mask vẫn hồi khi đòn bị né/hủy; cấm Guard bộ binh, cho phản ứng khác. Khớp phần đã rà. |
| Soul / Kỵ binh | Ám Kỵ | 1 / Công / Không | Bản thân +1 sát thương, +1 ô di chuyển trong lượt công; áp dụng đòn thường/skill Attack, không dùng sau commit. Khớp phần đã rà. |
| Soul | Triệu Gọi Ám Hồn | 1 / Công / Không | Trả 1 HP tạo lính kỵ binh mới ở hex cạnh hợp lệ, hành động ngay; Soul còn 1 HP vẫn tạo rồi thua Duel, lính không hành động. Khớp phần đã rà. |
| Soul | Thây Độc | 3 / Thủ / Không | Đổi chỗ với lính phe ta trong 3 ô; trả 1 HP trực tiếp vào người đánh kể cả đòn bị hủy. **Sai bước phòng thủ của lính thay thế**. |
| Siri / Kỵ binh | Săn Người | 1 / Công / Không | Buff bản thân cấm Guard bộ binh trong lượt công, gồm skill Attack. Khớp phần đã rà. |
| Siri | Phong Bộ | 1 / Thủ / Không | Khi bị đánh đi tối đa 3 ô theo địa hình, xuyên qua quân/Hero; ô kết thúc khác vị trí hiện tại và hợp lệ; hủy sát thương và hiệu ứng. Khớp phần đã rà. |
| Siri | Ám Phong | 1 / Công / Không | Một đồng đội bất kỳ trong 3 ô nhận +3 di chuyển; gồm Siri, chưa Attack, hết lượt công hết buff. Khớp phần đã rà. |
| Raen / Cung thủ | Viễn Tiễn | 1 / Công / Không | Một cung thủ phe ta trong 3 ô nhận +1 tầm đánh cho đòn thường/skill Attack, chưa Attack, hết lượt công hết buff. Khớp phần đã rà. |
| Raen | Tên Lưới | 2 / Thủ / Không | Khả dụng sau khi đồng đội/bản thân bị đánh, giữ đến hết lượt công địch; đẩy tối đa 4 ô, gặp cản dừng; trói cấm di chuyển/đánh/skill công, cho trang bị. **Sai mục tiêu lệch đường bắn**. |
| Raen | Hàn Tiễn | 3 / Công / Có | Một mục tiêu đường thẳng tối đa 4 ô, qua quân/vật cản; 1 sát thương, trúng đòn kể cả 0 damage vẫn đóng băng đến cuối lượt hiện tại. Né/hủy tránh hiệu ứng; cấm skill thủ, di chuyển/đánh; trang bị hợp lệ vẫn dùng. Khớp phần chính đã rà. |
| Xacnas / Cung thủ | Lời Chào Của Quỷ | 1 / Công / Không | Một cung thủ phe ta trong 3 ô nhận +1 sát thương đòn thường/skill Attack, chưa Attack, hết lượt công hết buff. Khớp phần đã rà. |
| Xacnas | Bão Phi Đao | 1 / Công / Có | Tối đa hai địch trong tầm hiện tại, không cần cùng đường thẳng, 1 sát thương/mục tiêu; trang bị tăng chỉ số/số mục tiêu/số lần. Khớp phần đã rà. |
| Xacnas | Phân Bóng | 3 / Thủ / Không | Người chơi chọn hai số khác nhau, giữ hết lượt thủ, roll từng đòn; sai số hủy cả đòn và hiệu ứng. Khớp phần dice; **cần thống nhất luật kết hợp phản ứng với quy tắc thủ mới**. |
| Lucy / Cung thủ | Phân Ảnh | 1 / Thủ / Không | Hủy một đòn và hiệu ứng lên Lucy; nhiều mục tiêu chỉ hủy phần Lucy. Khớp phần đã rà. |
| Lucy | Bắn Trả | 1 / Thủ / Không | Sau sát thương vào đồng đội/bản thân, Lucy sống mới bắn tối đa hai địch bằng chỉ số cơ bản, đối phương không phòng thủ. **Sai bộ lọc mục tiêu ở bước chọn**. |
| Lucy | Điên Cuồng | 1 / Công / Có | Hai lần bắn, mỗi lần cơ bản 2 sát thương; chọn mục tiêu lại từng lần, mở phòng thủ từng lần. Tầm bắn đường thẳng cơ bản của cung thủ, có cộng buff/trang bị. Khớp sửa mới 1.49.0. |
| Grim / Giả kim | Giả Dạng | 1 / Công + Thủ / Không | Đổi thành chủng lính mode cho phép, nhận thuộc tính chủng nhưng giữ Hero/HP hiện tại/max3; trang bị không hợp hệ trả về tay; giữ hình dạng đến lần đổi sau. Khớp phần đã rà. |
| Grim | Cải Tạo Nhanh | 1 / Công + Thủ / Không | Một lính phe ta trong 3 ô đổi chủng vĩnh viễn, đầy HP mới, giữ trạng thái di chuyển/commit. **Sai flow phản ứng của hệ mới khi đang nhận đòn**. |
| Grim | Sao Chép | 3 / Công + Thủ / Theo skill gốc | Skill Hero địch đã dùng trong trận kể cả đã chết; đúng lượt, dùng vị trí/chỉ số Grim; sao hiệu lực min(sao gốc,3), Attack copy commit. Khớp phần chính; trường hợp sao chép Sao Chép chưa có quy tắc rõ. |
| Neuro / Giả kim | Thuốc Câm | 4 / Công / Không | Một Hero địch trong 3 ô, không cần đường thẳng; mở phản ứng né/hủy đủ sao trước khi khóa skill thủ đến hết lượt thủ hiện tại; không cấm Guard/trang bị. Khớp phần đã rà. |
| Neuro | Triệu Gọi | 1 / Công + Thủ / Không | Có lính đồng đội từng chết thì giữ điều kiện cả trận, không tiêu thụ xác; tạo mới lính đầy HP cạnh Neuro, loại/giới hạn theo mode; hành động ngay theo lượt. Khớp phần đã rà. |
| Neuro | Thuốc Cấm | 1 / Công / Không | Tối đa hai đồng đội trong 3 ô nhận +2 di chuyển, gồm Neuro, đã di chuyển được nhận nhưng đã Attack không được. Khớp phần đã rà. |
| Ranus / Giả kim | Dịch Chuyển | 1 / Công + Thủ / Không | Teleport tối đa 4 ô tới hex khác hợp lệ, bỏ qua đường đi/vật cản/quân; không tiêu hao di chuyển thường; trong thủ hủy đòn và hiệu ứng. Khớp phần đã rà. |
| Ranus | Thuật Cường Hóa | 1 / Công / Không | Một đồng đội trong 2 ô, gồm Ranus, +1 lần đánh và +1 di chuyển trong lượt công; chưa Attack, áp dụng đòn thường/skill Attack. Khớp phần đã rà. |
| Ranus | Bùng Cháy | 1 / Công / Có | Tối đa bốn địch trong vùng 2 ô, không cần đường thẳng, qua quân/vật cản, 1 sát thương/mục tiêu; trang bị tăng các chỉ số, phòng thủ từng lần. Khớp phần đã rà. |

## Các điểm cần chốt trước khi sửa mở rộng

1. **Phân Bóng**: xác nhận Guard vẫn được kết hợp; với skill thủ/card thủ khác, áp dụng quy tắc mới “không cộng dồn trong cùng đòn” hay giữ ngoại lệ riêng cho Phân Bóng? Hội thoại trước cho phép kết hợp, sau đó có quy tắc chung hạn chế.
2. **Chiến Thần và Ma Kích**: đã cho chọn qua quân. Vật cản địa hình có chặn không? Chiến Thần đã nói không tự có xuyên nhưng chưa chốt vật cản riêng; không suy diễn thay người chơi.
3. **Sao Chép một Sao Chép của Grim địch**: hiện Core loại skill COPY khỏi danh sách. Cần quy định chọn hiệu ứng đã được Grim địch sao chép hay không cho sao chép skill này.

Ưu tiên sửa sau khi chốt: phản ứng của người nhận đòn mới (Est/Soul/Grim), bộ lọc mục tiêu Lucy/Raen, rồi các trường hợp kết hợp còn chưa rõ. Chưa thay đổi luật hoặc đưa lên GitHub trong bước kiểm tra này.

## Cập nhật sau khi người chơi chốt

Đã sửa tại workspace: thế mạng mở lại card thủ; Giả Dạng/Cải Tạo Nhanh giữ đòn chờ để phòng thủ theo hệ mới; Lucy Bắn Trả dùng đường thẳng tầm cơ bản; Tên Lưới dùng đường thẳng trong tầm đánh Raen. Phân Bóng cho tiếp tục Guard/card/skill hợp lệ, vẫn chịu ngân sách rule_mode.

Sao Chép được chọn Sao Chép của Grim địch đã dùng, sau đó chọn skill địch đã dùng để thực hiện như bình thường; không tự chạy đệ quy. Lịch sử ghi nhận cả hành động Sao Chép và skill thực hiện. Chiến Thần/Ma Kích qua địa hình chưa được chốt, chưa thay đổi.

Kiểm chứng mới: `node tools/audit-hero-defense-targeting.cjs` có assertion cho 8 ca sửa lỗi. Dữ liệu JSON phía trên là bằng chứng trước sửa.

Chốt bổ sung: Chiến Thần và Ma Kích chỉ đánh qua lính/Hero, không qua vật cản địa hình. Đã thêm kiểm tra đường đi ở bước chọn và trước từng mục tiêu được xử lý; gồm skill Grim sao chép.
