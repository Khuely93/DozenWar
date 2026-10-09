# Flow phòng thủ trực tiếp (workspace, chưa phát hành)

Mỗi đòn có thanh thông tin cố định: đòn hiện tại/tổng số, người công, người nhận, sát thương và sao. Map highlight người nhận và Bộ binh Guard hợp lệ. Có Guard: hiện “Chọn Bộ binh để đỡ đòn, bỏ qua nếu không muốn Bộ binh đỡ đòn” và Bỏ qua; bỏ qua chỉ từ chối Guard, vẫn được dùng skill/card. Click Bộ binh chốt Guard và cập nhật phản ứng cho người nhận mới, không tự nhận sát thương khi không có card.

Skill/card chọn ở thanh dưới, không mở popup phòng thủ hay dialog card thông thường. Card cần mục tiêu/hex giữ lựa chọn trên map và chỉ tiêu hao sau chọn hợp lệ. Không có phản ứng vẫn chờ Nhận đòn hoặc timeout. Nhiều card: quyền lấy từ equipmentRules.allowMultiple của rule_mode, chọn/bỏ chọn từng card ở dock và nhấn Phòng thủ. Mỗi đòn liên tiếp mở một lựa chọn mới.

Khiên Ma Thuật sau sát thương: card ở dock, Không phản để hoàn tất, kể cả người nhận chết. Hồi Sức + Bình Máu giữ cửa sổ chọn kết hợp để kiểm tra sống/max HP. Phân Bóng giữ chọn số. Dây Chuyền vẫn xử lý trước hiệu ứng card với lựa chọn hủy/cho qua.

Kiểm tra: node tools/test-direct-defense-flow.cjs và npm run test:browser-heroes. Bố cục Duel áp dụng theo mapId của rule_mode, gồm Đấu tập.

# Flow công trực tiếp (workspace, chưa phát hành)

Chọn quân: hiện tầm di chuyển và địch trong tầm, không mở menu. Click hex để đi, click địch để đánh thường. Có thể đánh trước khi đi. Chọn card dưới thanh UI gắn ngay vào hành động, cập nhật tầm; không mở dialog xác nhận. Chọn nhiều card hợp lệ trong Đấu tập. Card độc lập/skill: chọn mục tiêu hoặc hex trực tiếp, một mục tiêu thực hiện ngay, nhiều mục tiêu xác nhận. Skill Attack được chọn card từ thanh dưới trước hoặc sau khi chọn skill. Đổi quân/bỏ chọn hủy card đang chờ, giữ quyền hành động và không tiêu hao. Chọn card khi chưa có người dùng: highlight quân hợp lệ để chọn trên map. Click địch/hex không hợp lệ giữ lựa chọn và cảnh báo đỏ nhấp nháy. Click nền ngoài map/Escape bỏ chọn.

Flow phòng thủ, Guard, phản ứng trang bị, Khiên Ma Thuật và ngoại lệ hồi máu giữ nguyên.

Kiểm tra trực tiếp: `node tools/test-direct-board-flow.cjs`.

## Flow trước đây (tham khảo)

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
