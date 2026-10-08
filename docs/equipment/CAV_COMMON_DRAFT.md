# Trang bị Kỵ binh và Dùng chung — đã chốt — v1.44.0

Toàn bộ 16 mẫu / 33 lá của danh sách này đã thêm cục bộ: Kỵ binh 6 mẫu / 11 lá; Dùng chung 10 mẫu / 22 lá. Bộ trang bị hoàn chỉnh hiện có 29 mẫu / 60 lá (Bộ binh 7/14, Cung thủ 6/13, Kỵ binh 6/11, Dùng chung 10/22).

| Tên | ID | Sao | Bản sao | Trạng thái |
| --- | --- | --- | --- | --- |
| Thương Kỵ Sĩ | EQUIP_CAV_ATK_001 | 1 | 3 | Đã thêm cục bộ |
| Đại Đao | EQUIP_CAV_ATK_002 | 1 | 2 | Đã thêm cục bộ |
| Kiếm Một Tay | EQUIP_CAV_DEF_001 | 2 | 2 | Đã thêm cục bộ |
| Khiên Gỗ | EQUIP_CAV_DEF_002 | 2 | 2 | Đã thêm cục bộ |
| Giáo Thép | EQUIP_CAV_ATK_003 | 1 | 1 | Đã thêm cục bộ |
| Lưới Sắt | EQUIP_CAV_DEF_003 | 4 | 1 | Đã thêm cục bộ |
| Triệu Gọi Ám Kỵ | EQUIP_COMMON_ATK_001 | 1 | 2 | Đã thêm cục bộ |
| Kèn Gọi Quân | EQUIP_COMMON_ATK_002 | 1 | 2 | Đã thêm cục bộ |
| Bình Máu | EQUIP_COMMON_BOTH_001 | 4 | 4 | Đã thêm cục bộ |
| Lọ Phép Thuật | EQUIP_COMMON_ATK_003 | 1 | 2 | Đã thêm cục bộ |
| Thuốc Hồi Sức | EQUIP_COMMON_ATK_004 | 1 | 2 | Đã thêm cục bộ |
| Thuốc Tăng Lực | EQUIP_COMMON_ATK_005 | 1 | 2 | Đã thêm cục bộ |
| Dây Chuyền May Mắn | EQUIP_COMMON_BOTH_002 | 5 | 2 | Đã thêm cục bộ |
| Đánh Cắp | EQUIP_COMMON_BOTH_003 | 4 | 2 | Đã thêm cục bộ |
| Nhẫn Dịch Chuyển | EQUIP_COMMON_BOTH_004 | 3 | 2 | Đã thêm cục bộ |
| Quyền Trượng Phép Thuật | EQUIP_COMMON_DEF_001 | 3 | 2 | Đã thêm cục bộ |

Mỗi mẫu có ID thiết kế cố định và ba ID asset riêng (art/frame/icon), lưu trong CAV_COMMON_DRAFT.json. ID BOTH dành cho card dùng cả lượt công và lượt thủ; schema đã hỗ trợ category BOTH, timing ATTACK/DEFENSE và hiển thị Công và thủ. Các card BOTH đã có cơ chế và số lượng trong deck.

Các card cộng sát thương/lần đánh/bỏ Guard đã thêm áp dụng cho đòn thường và skill Attack trong một commit. Card hủy đòn hủy cả sát thương và hiệu ứng trên người được bảo vệ, vẫn so sánh sao và ngân sách của rule_mode. Không tự coi tên card là hiệu ứng mới.



Người chơi đã yêu cầu cập nhật GitHub cho bản v1.44.0.

Chốt bổ sung: Kiếm Một Tay dùng cơ chế Dao Găm với chỉ số cơ bản của Kỵ binh. Lưới Sắt dùng tự do trong lượt thủ, chọn một địch trong tối đa hai ô, không cần đường thẳng, khóa di chuyển/Attack/skill công tới hết lượt công hiện tại của địch. Trang bị phòng thủ vẫn dùng được. Hiệu ứng khóa không tự hủy đòn đã bắt đầu; không gắn Lưới Sắt làm phòng thủ cho đòn đang xử lý. Giới hạn card thủ vẫn theo rule_mode.

Thương Kỵ Sĩ đã chốt: hạ mục tiêu chính mới lan theo đường thẳng phía sau, tối đa hai đơn vị ở hai hex kế tiếp, sát thương bằng sát thương đòn chính đã xử lý, không mở phản ứng phòng thủ. Áp dụng cho đòn thường và skill Attack. Không có trang bị này thì đòn thường Kỵ binh vẫn lan một hex theo Core và skill Attack không tự có lan.

Các card Dùng chung đã chốt và triển khai:

- Triệu Gọi Ám Kỵ / Kèn Gọi Quân: hành động card riêng trong lượt công, tạo lính bình thường mới tại hex hợp lệ cạnh Hero còn sống, không mất HP/commit Hero và không cần có lính chết. Lính được đi/đánh ngay. Hex áp dụng occupancy của mode/map.
- Bình Máu: hồi đúng 1 HP cho Hero bất kỳ hoặc lính Bộ binh cùng phe còn sống/thiếu HP ở bất kỳ đâu; dùng công/thủ tự do. Khi hồi cho người nhận đòn đang xử lý, HP sau hồi phải lớn hơn sát thương sắp nhận. Không hồi sinh. Kết hợp Hồi Sức của Rodoc cho tổng +2 HP; hiệu ứng đòn đánh vẫn áp dụng.
- Thuốc Tăng Lực: chọn đồng đội chưa Attack, cộng số ô bằng di chuyển cơ bản hiện tại (kể cả Grim đã biến hình), được đi tiếp sau di chuyển trước đó; hết lượt công thì hết buff.
- Dây Chuyền May Mắn: cửa sổ phản ứng trước mọi hiệu ứng card. Card bị hủy rời tay, mọi hiệu ứng card bị bỏ, ngân sách vẫn tiêu hao. Đòn/skill gốc tiếp tục nếu card chỉ là trang bị kết hợp. Hủy card độc lập thì hành động card không có hiệu ứng. So sánh sao card và ngân sách công/thủ; có thể phản hủy Dây Chuyền khi mode cho phép. Cửa sổ mặc định 30 giây theo chính sách phòng thủ mode, hết giờ bỏ qua.
- Đánh Cắp: hiển thị tay địch để chọn đúng một instance chưa sử dụng, đổi chủ sở hữu và chuyển vào tay mình. Không nhân bản hoặc dùng ngẫu nhiên. Có thể dùng ngay nếu còn ngân sách và đáp ứng hệ/công-thủ; Duel hiện chỉ cho một card công/một card thủ mỗi lượt nên ngân sách đã hết sẽ phải đợi.

Card triệu hồi, hồi máu và Đánh Cắp là hành động của Player; Hero đã commit vẫn có thể làm điểm neo/mục tiêu hợp lệ. Các card di chuyển chỉ chọn đơn vị chưa Attack. Dây Chuyền chỉ xuất hiện trong cửa sổ phản ứng card, không dùng để hồi tố hiệu ứng đã xử lý.

Kiểm tra: build và kiểm thử trang bị/Core, cùng kịch bản Chromium cho triệu hồi, hồi máu, di chuyển, hủy card công/thủ/độc lập, phản hủy và chuyển sở hữu. Phát hành trong v1.44.0.


Chốt bổ sung 2026-10-08:

- Dây Chuyền: card bị hủy vẫn mất ngân sách; giữ đòn/skill gốc khi card là trang bị kết hợp.
- Sau khi card tăng tầm bị hủy, phải kiểm tra lại tầm với buff còn hợp lệ. Nếu có mục tiêu không hợp lệ, dừng trước sát thương và mở chọn lại mục tiêu; giữ những mục tiêu còn hợp lệ trong lựa chọn nhiều mục tiêu. Người chơi có thể chọn mục tiêu hợp lệ khác hoặc Bỏ qua; card không hoàn lại, đơn vị vẫn commit và skill gốc vẫn tiêu hao khi hoàn tất/bỏ qua. Không được Attack ngoài tầm, đi lại hoặc đổi skill bằng cửa sổ này. Bot chọn mục tiêu hợp lệ hoặc bỏ qua; hết giờ lượt công cũng bỏ qua.
- Thương Kỵ Sĩ: mục tiêu chính phải chết vì đòn đã xử lý mới lan. Nếu phòng thủ làm mục tiêu chính sống thì không lan. Khi điều kiện này đạt, lan tới tối đa hai đơn vị phía sau theo luật đã chốt; không thêm điều kiện giết đơn vị lan thứ nhất.
- Lưới Sắt không mở thêm cửa sổ né/hủy ≥ 4 sao; Dây Chuyền vẫn có thể hủy card trước hiệu ứng.

Kiểm thử bổ sung: chọn lại/bỏ qua đòn thường, skill Attack có tầm cố định và commit nhiều mục tiêu; giữ mục tiêu khi còn trong tầm. Phát hành trong v1.44.0.

Nhẫn Dịch Chuyển đã chốt: chỉ Hero đồng đội còn sống; lượt công phải chưa Attack, có thể dùng sau di chuyển thường, không tiêu hao quyền di chuyển thường. Tới hex khác trong tối đa 4 ô từ Hero, bỏ qua đường đi/quân/vật cản; ô đích phải hợp lệ theo mode/map. Lượt thủ chỉ khi Hero được chọn đang nhận đòn và card đủ sao (3 sao), hủy cả sát thương/hiệu ứng của phần đòn lên Hero. Không có đích hợp lệ thì không dùng được. Dây Chuyền có thể hủy Nhẫn trước khi dịch chuyển; hủy Nhẫn không đổi vị trí hoặc né đòn. ID/asset riêng được giữ nguyên.
