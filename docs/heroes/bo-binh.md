# Dozen War — 3 Hero bộ binh đã chốt

Đây là đặc tả được người dùng xác nhận trong cuộc trò chuyện, thay thế bản đọc ảnh cho Est, Kazu và Rodoc. Được triển khai trong v1.41.0.

## Quy ước

- Cả ba Hero thuộc bộ binh, HP tối đa 3.
- Một turn là lượt của một bên. Buff công dưới đây hết khi bên sử dụng kết thúc lượt công.
- Skill có nắm đấm là skill Attack, được tính như đòn đánh. Skill buff không tiêu hao quyền đánh khi kích hoạt.
- Số sao giữ nguyên theo bảng; không tự suy diễn thêm chi phí hoặc giới hạn sử dụng.

## Est

### Phi Thân — 1 sao, lượt thủ, không phải Attack

Khi Est bị tấn công, đổi vị trí với một lính đồng đội trong phạm vi 3 ô. Có thể chọn mọi loại lính. Lính thay thế nhận sát thương thay Est và được sử dụng phản ứng phòng thủ.

### Phục Thù — 1 sao, lượt thủ, không phải Attack

Gây 1 sát thương cho mỗi mục tiêu, tối đa 2 kẻ địch đã tấn công đồng đội trong toàn bộ lượt công hiện tại của đối phương. Đồng đội bao gồm Est. Phạm vi 3 ô xung quanh Est áp dụng cho đơn vị đồng đội bị đánh. Có thể dùng sau khi đòn đánh kết thúc, kể cả đồng đội bị đánh đã chết.

### Ác Mộng Phía Đông — 1 sao, lượt công, Attack Buff

Kích hoạt buff không tính là đòn đánh và không tiêu hao quyền tấn công. Est được +2 ô di chuyển và +3 mục tiêu so với 1 mục tiêu cơ bản, thành tối đa 4 mục tiêu trong tầm đánh. Đòn đánh sau đó mới tiêu hao quyền tấn công. Dùng sát thương cơ bản của Est (mô tả là 1 sát thương mỗi mục tiêu), được kết hợp trang bị tăng chỉ số và hiệu ứng; trang bị tăng mục tiêu được nâng giới hạn vượt 4. Buff kéo dài trong turn hiện tại.

## Kazu

### Khiên Rồng — 1 sao, lượt thủ, không phải Attack

Hủy tác động của một đòn đánh lên Kazu hoặc một lính đồng đội trong phạm vi 1 ô quanh Kazu. Nếu đòn đánh tác động nhiều đơn vị, chỉ hủy phần tác động lên đơn vị được bảo vệ.

### Khóa Xích — 2 sao, lượt công, Attack

Tấn công 1 kẻ địch trên đường thẳng trong phạm vi 3 ô, gây 2 sát thương và stun. Stun kéo dài đến hết lượt công kế tiếp của bên có đơn vị bị stun. Đơn vị bị stun không được di chuyển, đánh hoặc thực hiện hành động; bị cấm Guard, phản ứng phòng thủ và skill thủ.

### Xích Quỷ Kazu — 3 sao, lượt công, Attack

Chọn 1 kẻ địch trên đường thẳng trong phạm vi 4 ô. Đường kéo phải không có quân hoặc vật cản chắn giữa Kazu và mục tiêu; hex trước mặt Kazu dùng làm đích kéo phải trống. Không được dùng Guard của bộ binh để đỡ skill này.

Gây 1 sát thương trước khi kéo. Nếu mục tiêu chết, mục tiêu biến mất và không kéo xác. Nếu mục tiêu sống, kéo về hex trước mặt Kazu.

Trang bị có thể tăng số lần kéo, không tăng số mục tiêu của mỗi lần kéo. Lần tiếp theo có thể chọn mục tiêu khác nếu đáp ứng đủ điều kiện. Nếu mục tiêu sống từ lần kéo trước còn chiếm hex trước mặt Kazu, không được kéo tiếp: phải tiêu diệt mục tiêu đó trước rồi mới được kéo mục tiêu khác. Không tự cấp thêm hành động để tiêu diệt mục tiêu.

## Rodoc

### Hồi Sức — 3 sao, lượt thủ, không phải Attack

Hồi 1 HP cho 1 đơn vị bộ binh còn sống, đang thiếu HP, trong phạm vi 3 ô. Mục tiêu có thể là lính bộ binh, Hero bộ binh hoặc Rodoc.

Skill khả dụng trong lượt thủ khi thỏa điều kiện, kể cả ngoài lúc xử lý đòn đánh; không bắt buộc phải đợi bị tấn công. Không hồi sinh mục tiêu đã về 0 HP.

Khi đang xử lý đòn đánh, xét tổng hồi máu hợp lệ từ skill và trang bị, giới hạn bởi HP tối đa. Chỉ được hồi nếu HP sau hồi lớn hơn sát thương sẽ nhận, để mục tiêu còn sống sau đòn đánh. Không chỉ so sát thương với HP tối đa. Xét phối hợp hồi trước khi kết thúc xử lý sát thương.

Ví dụ mục tiêu còn 1/3 HP:
- Hồi +1, nhận 2 sát thương: không được, vì vẫn về 0 HP.
- Hồi tổng +2 từ trang bị và skill, nhận 2 sát thương: được, lên 3/3 rồi còn 1 HP.
- Hồi tổng +2, nhận 3 sát thương: không được, vì vẫn về 0 HP.

### Tiếng Thét Xung Trận — 1 sao, lượt công, không phải Attack

Chọn tối đa 2 đơn vị bộ binh trong phạm vi 3 ô, gồm Hero bộ binh hoặc Rodoc. Mỗi đơn vị được +2 ô di chuyển trong turn hiện tại. Đơn vị đã di chuyển được di chuyển thêm 2 ô ngay trong lượt đó. Đơn vị đã Attack/commit không được nhận buff.

### Chiến Thần — 1 sao, lượt công, Attack

Chọn tối đa 4 kẻ địch trên một đường thẳng trong phạm vi 4 ô tính từ Rodoc, gây 1 sát thương cho mỗi mục tiêu. Có thể chọn nhiều địch dù có quân đứng giữa. Đây là cơ chế chọn mục tiêu gây sát thương, không tự mang hiệu ứng xuyên.

Trang bị có thể tăng sát thương, số mục tiêu, số lần đánh và thêm hiệu ứng xuyên. Chưa có xác nhận riêng về vật cản địa hình; không tự suy diễn rằng chọn được xuyên mọi vật cản.

## Các chi tiết triển khai không tự suy diễn

- Tính năng chọn nhiều mục tiêu qua quân của Chiến Thần không đồng nghĩa có hiệu ứng xuyên.
- Quy tắc trang bị cụ thể, số lần dùng skill và chi phí sao cần tuân theo đặc tả chung được chốt riêng.
- Với phạm vi liên quan lịch sử đòn đánh của Phục Thù, thời điểm đo vị trí chưa được định nghĩa riêng.
