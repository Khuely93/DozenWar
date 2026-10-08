# v1.44.0 — Bộ trang bị hoàn chỉnh

Catalog có 29 mẫu / 60 lá cho mỗi deck: Bộ binh 7/14, Cung thủ 6/13, Kỵ binh 6/11, Dùng chung 10/22. Giáo Thép 1 lá, Khiên Gỗ 2 lá, Lọ Phép Thuật 2 lá và Nhẫn Dịch Chuyển 2 lá. Duel chia 5 lá đầu trận cho mỗi Player.

Mỗi mẫu có ID thiết kế và ba asset riêng (art/frame/icon). Card Công và Thủ dùng category BOTH. Nội dung được tách khỏi cơ chế Core và UI.

Thêm trang bị Cung thủ, Kỵ binh và Dùng chung theo luật đã chốt, gồm chuyển hướng, đánh trả sau sát thương kể cả khi chết, lan sau khi hạ mục tiêu chính, khóa chân, triệu hồi, hồi máu, di chuyển, đánh cắp và hủy card.

Dây Chuyền May Mắn mở phản ứng trước hiệu ứng card; card bị hủy vẫn tiêu hao ngân sách. Đòn/skill gốc tiếp tục; nếu mất tăng tầm làm mục tiêu không hợp lệ, người chơi chọn mục tiêu hợp lệ khác hoặc bỏ qua. Đánh Cắp chuyển đúng instance vào tay người lấy và vẫn tuân thủ ngân sách mode.

Nhẫn Dịch Chuyển chỉ dùng cho Hero còn sống. Lượt công phải chưa Attack; dịch chuyển không tiêu hao di chuyển thường. Lượt thủ chỉ khi Hero đang nhận đòn và Nhẫn đủ sao để hủy sát thương/hiệu ứng. Đích khác vị trí hiện tại, tối đa 4 ô, bỏ qua đường đi nhưng tuân thủ occupancy của mode/map.

Validation: npm run build; 101 kiểm thử trang bị; 128 kịch bản Chromium cùng thao tác chuột cho chọn mục tiêu, hủy card, đánh cắp và Nhẫn Dịch Chuyển. Bản này chưa thay đổi bố cục thanh Hero / Skill / Trang bị phía dưới; đó là công việc tiếp theo.
