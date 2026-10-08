# Đấu tập — MODE_TRAINING_001

Chọn ĐẤU TẬP ở màn hình mode. Một người điều khiển cả hai phe; không Bot, không đồng hồ và không thắng/thua. Map giống Duel, mỗi hex một đơn vị sống.

- Thêm quân: chọn phe và một trong 12 Hero hoặc các loại lính, rồi click hex trống trên map. Có thể đặt cả hai phe ở bất kỳ hex hợp lệ nào và thêm quân sau khi đã bắt đầu thử.
- Thêm trang bị: chọn phe và card. Những mẫu đã chọn được tự bổ sung một bản vào tay khi dùng hết; không giới hạn ngân sách công/thủ theo lượt.
- Skill dùng lại liên tục; không ghi dấu đã dùng. Sau khi toàn bộ commit/phản ứng hoàn tất, quyền Attack được mở lại để thử tiếp. Không làm mới giữa các đòn trong chuỗi hoặc trong phản ứng đang xử lý.
- Các yêu cầu mục tiêu, tầm, số sao, trạng thái, HP và phản ứng vẫn do Core xử lý. Triệu hồi của Neuro vẫn cần có lính đồng đội chết; Sao Chép vẫn cần skill địch đã dùng.
- Đổi lượt: đổi phe công/thủ để tự thử cả hai bên. Làm mới lượt: làm mới quyền di chuyển và các buff theo quy trình reset lượt của Core; không hồi HP hoặc xóa lịch sử trận.
- Thoát trận: có thể thoát kể cả đang xử lý phản ứng; xóa trận thử và trở lại màn hình mode.

Kiểm tra trình duyệt: triển khai hai phe bằng thao tác chuột, lính đã di chuyển dùng Búa Chiến, tự bổ sung card, thực hiện cùng skill hai lần, Hero chết không kết thúc trận, đổi lượt và thoát trận. Phát hành cùng v1.45.0 trên GitHub Pages.
