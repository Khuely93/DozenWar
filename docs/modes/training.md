# Đấu tập — MODE_TRAINING_001

Chọn ĐẤU TẬP ở màn hình mode. Một người điều khiển cả hai phe; không Bot, không đồng hồ và không thắng/thua. Map giống Duel, mỗi hex một đơn vị sống.

- Thêm quân: chọn phe và một trong 12 Hero hoặc các loại lính, rồi click hex trống trên map. Có thể đặt cả hai phe ở bất kỳ hex hợp lệ nào và thêm quân sau khi đã bắt đầu thử.
- Thêm trang bị: chọn phe và card. Những mẫu đã chọn được tự bổ sung lại số bản đã thêm vào tay sau khi sử dụng; không giới hạn ngân sách công/thủ theo lượt.
- Skill dùng lại liên tục; không ghi dấu đã dùng. Sau khi toàn bộ commit/phản ứng hoàn tất, quyền Attack được mở lại để thử tiếp. Không làm mới giữa các đòn trong chuỗi hoặc trong phản ứng đang xử lý.
- Các yêu cầu mục tiêu, tầm, số sao, trạng thái, HP và phản ứng vẫn do Core xử lý. Triệu hồi của Neuro vẫn cần có lính đồng đội chết; Sao Chép vẫn cần skill địch đã dùng.
- Đổi lượt: đổi phe công/thủ để tự thử cả hai bên. Làm mới lượt: làm mới quyền di chuyển và các buff theo quy trình reset lượt của Core; không hồi HP hoặc xóa lịch sử trận.
- Thoát trận: có thể thoát kể cả đang xử lý phản ứng; xóa trận thử và trở lại màn hình mode.

Kiểm tra trình duyệt: triển khai hai phe bằng thao tác chuột, lính đã di chuyển dùng Búa Chiến, tự bổ sung card, thực hiện cùng skill hai lần, Hero chết không kết thúc trận, đổi lượt và thoát trận. Phát hành cùng v1.45.0 trên GitHub Pages.

## Nhiều trang bị trong một hành động

Đấu tập cho chọn nhiều card trong cửa sổ trang bị công, trang bị cho skill Attack, thủ và phản sát thương sau đòn. Nhấn lại để bỏ chọn. Mỗi bản card có UID riêng; dùng Thêm trang bị nhiều lần để tạo nhiều bản cùng mẫu. Card chỉ tiêu hao khi commit.

Core cộng hiệu ứng sát thương/tầm/số lần đánh từ các card thực sự được dùng; số sao là MAX, không cộng sao. Mỗi card thủ phải tự đủ sao và đúng hệ/ngữ cảnh. Skill thủ không ghép với card thủ ngoài các ngoại lệ đã chốt.

Mỗi card có cửa sổ Dây Chuyền riêng. Hủy một lá không xóa các lá còn lại; mất tầm sẽ yêu cầu chọn lại mục tiêu. Card độc lập cần lựa chọn/hành động khác nhau vẫn thực hiện riêng theo Core; Lao Móc được ghép với các card tăng chỉ số Attack.

Đổi mục tiêu bằng Áo Choàng phải kiểm tra lại các card còn lại theo người nhận mới. Nhiều Bình Máu không được hồi vượt HP tối đa và phải đủ sống qua đòn. Nhiều Khiên Ma Thuật chỉ dùng sau khi đã nhận sát thương. Duel vẫn giữ giới hạn một card.
