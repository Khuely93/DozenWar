# Flow UI công / thủ (workspace, chưa phát hành)

- Chọn Trang bị trong popup công/thủ sẽ đóng popup và mở dialog ở giữa màn hình. Dialog chỉ hiển thị card hợp lệ cho đơn vị, lượt, số sao và ngân sách hiện tại.
- Card công gắn vào đòn: chọn và xác nhận → đóng dialog → highlight mục tiêu → click mục tiêu để gửi đòn. Xác nhận lựa chọn chưa tiêu hao bài; Core tiêu hao bài khi thực hiện đòn.
- Card độc lập: xác nhận card → chọn mục tiêu/hex/tùy chọn cần thiết → thực hiện bằng Core.
- Card thủ: chọn và xác nhận → dùng cho đơn vị nhận đòn. Card chuyển hướng/dịch chuyển vẫn yêu cầu chọn đồng đội/hex.
- Skill công: chọn skill → dialog trang bị (Xác nhận hoặc Không dùng) → highlight mục tiêu. Một mục tiêu: click để commit. Nhiều mục tiêu: chọn các mục tiêu, nhấn Tấn công. Skill cần chọn loại lính, skill sao chép hoặc thông số giữ bước chọn cần thiết.
- Skill thủ tự dùng: kích hoạt ngay nếu không cần lựa chọn. Phi Thân, Phong Bộ, Phân Bóng và các skill cần mục tiêu/thông số giữ lựa chọn của người chơi. Skill thủ không kết hợp card thủ trong cùng một đòn, ngoại trừ Hồi Sức + Bình Máu: tổng HP sau hồi phải ≤ HP tối đa và > sát thương đang nhận. Hồi Sức mở dialog chỉ có Bình Máu hợp lệ để Player chọn hoặc Không dùng. Các skill thủ khác không dùng số sao card để nâng skill. Đòn sau là một phản ứng mới.
- Mỗi lần đánh mở phản ứng riêng. Không còn skill thủ hợp lệ: tự mở dialog card thủ. Không có card phù hợp: hiện trạng thái trống và Bỏ qua để nhận đòn.
- Quay lại/Escape hủy lựa chọn chưa thực hiện, không tiêu hao bài. Hết thời gian công/thủ đóng dialog và tiếp tục quy tắc timeout của mode.
- Khiên Ma Thuật là ngoại lệ: chỉ mở sau khi thực sự nhận sát thương, kể cả đơn vị vừa chết hoặc đã dùng skill thủ. Player chọn khiên hoặc Bỏ qua; sau đó game mới hoàn tất đòn và xét thắng/thua. Không nhận sát thương thì không mở cửa sổ khiên. Ngân sách card và so sánh sao vẫn áp dụng.
- Ô thông tin dưới chỉ hiện Hero. Lính dùng menu trên map. Card không tự chọn đơn vị hợp lệ: Player chọn người dùng. Nút nổi trên map vẫn được giữ.
- Hiển thị người dùng, skill/card, số mục tiêu đã chọn/tối đa và số đòn/người nhận đòn. Có Đổi trang bị/Hủy trước commit.
- Guard, Dây Chuyền, giới hạn sử dụng skill/card, quyền Attack và số sao vẫn do Core/mode hiện tại quyết định.

Kiểm tra: `npm run test:browser-heroes` bao gồm 128 kịch bản Core và các thao tác chuột theo flow mới, cửa sổ desktop/mobile, đòn liên tiếp, sao chép, triệu hồi, hủy card, cancel và timeout. `npm run build` kiểm tra toàn bộ bộ test và bundle production.

Ngoại lệ Đấu tập: cửa sổ cho chọn nhiều card công/thủ hợp lệ. Core kiểm tra từng card, dùng MAX số sao, cộng hiệu ứng và mở phản ứng hủy cho từng card. Card độc lập cần hành động/mục tiêu riêng vẫn theo flow Core. Chi tiết: [training.md](modes/training.md).
