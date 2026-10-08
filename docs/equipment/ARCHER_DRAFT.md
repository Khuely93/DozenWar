# Card Cung thủ — đã chốt — v1.44.0

Áp dụng cho lính và Hero Cung thủ. Tổng danh sách: 6 mẫu, 13 bản (6 công, 7 thủ). Đã thêm đủ 6 mẫu / 13 bản vào catalog cục bộ. Tổng deck cục bộ cùng Bộ binh: 13 mẫu / 27 bản.

| Tên | ID | Loại | Sao | Bản sao | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| Nỏ Sắt | EQUIP_ARCH_ATK_001 | Công | 1 | 2 | Đã thêm: +1 lần đánh trong một commit, gồm đòn thường/skill Attack |
| Bom Khói | EQUIP_ARCH_DEF_001 | Thủ | 2 | 2 | Đã thêm: hủy một đòn, gồm sát thương và hiệu ứng lên người được bảo vệ; vẫn so sánh sao |
| Áo Choàng Phép Thuật | EQUIP_ARCH_DEF_002 | Thủ | 2 | 2 | Đã thêm: chuyển đòn sang một đơn vị khác còn sống cùng phe ở bất kỳ đâu; không đổi vị trí; mở lại phản ứng phòng thủ hợp lệ |
| Dao Găm | EQUIP_ARCH_DEF_003 | Thủ | 2 | 3 | Đã thêm: trả chính kẻ tấn công sau khi nhận đòn bằng chỉ số cơ bản, không buff/trang bị; chết vẫn trả, đối phương không được phòng thủ |
| Tên Xuyên Phá | EQUIP_ARCH_ATK_002 | Công | 1 | 2 | Đã thêm: +1 sát thương trong một commit, không tự thêm hiệu ứng xuyên |
| Cung Thép | EQUIP_ARCH_ATK_003 | Công | 1 | 2 | Đã thêm: +1 ô tầm đánh trong một commit |

Mỗi mẫu có asset art/frame/icon riêng. Card công tăng chỉ số hiệu lực trong một commit; không tự thêm hiệu ứng xuyên cho Tên Xuyên Phá. Sao phòng thủ vẫn được so sánh theo Core.

Áo Choàng chỉ chuyển mục tiêu, không đổi vị trí và không kiểm tra tầm của kẻ tấn công đối với mục tiêu mới. Không được chọn chính người dùng, quân chết hoặc địch. Hủy bước chọn không tiêu hao card. Người nhận đòn thay có thể Guard, dùng skill thủ hoặc trang bị nếu hợp lệ theo sao, trạng thái và ngân sách của rule_mode. Trong Duel, dùng Áo Choàng đã tiêu hao một card thủ; không tự cấp thêm ngân sách card cho mục tiêu mới.

Dao Găm trả đòn sau xử lý đòn đang nhận, kể cả cung thủ chết. Dùng sát thương cơ bản (hiện là 1) và tầm/pattern cơ bản của chủng hiện tại, không dùng buff hay trang bị. Chỉ đánh chính kẻ tấn công còn sống và trong tầm cơ bản. Không mở phản ứng phòng thủ và không tiêu hao quyền Attack. Đây là ngoại lệ được người chơi chốt riêng cho card Dao Găm; không thay đổi điều kiện Lucy phải còn sống để dùng Bắn Trả. Đòn trả bắt buộc hoàn tất trước kiểm tra kết quả trận; hai Hero cùng chết sẽ hòa.

Được phát hành trong v1.44.0 theo yêu cầu cập nhật GitHub của người chơi.
