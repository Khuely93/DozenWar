# Dozen War — 3 Hero cung thủ đã chốt

Đặc tả theo xác nhận của người dùng trong cuộc trò chuyện. Thay thế các bản đọc ảnh và diễn giải trước cho Raen, Xacnas, Lucy. Được triển khai trong v1.41.0.

## Quy ước

- Cả ba Hero thuộc cung thủ, HP tối đa 3.
- Một turn là lượt của một bên; buff công dưới đây hết khi kết thúc lượt công hiện tại.
- Kích hoạt buff không tính là đòn đánh. Skill Attack có nắm đấm, tính là đòn đánh.
- Attack là commit; các lần đánh thêm được xử lý trong cùng commit, từng lần mở phản ứng phòng thủ riêng trừ ngoại lệ Bắn Trả đã chốt.

## Raen

### Viễn Tiễn — 1 sao, công, buff, không phải Attack

+1 ô tầm đánh cho 1 cung thủ đồng đội trong phạm vi 3 ô, gồm lính, Hero cung thủ hoặc Raen. Tăng tầm áp dụng cả đòn thường và skill Attack. Hiệu lực trong lượt công hiện tại. Đơn vị đã Attack không được nhận buff.

### Tên Lưới — 2 sao, thủ, không phải Attack

Khi Raen hoặc một đơn vị đồng đội bị tấn công, skill trở nên khả dụng và giữ khả dụng đến hết lượt công hiện tại của đối phương. Có thể dùng ngay hoặc chờ một mục tiêu địch vào tầm.

Chọn 1 kẻ địch bất kỳ trong tầm bắn Raen, không bắt buộc là kẻ đã tấn công. Đẩy lùi tối đa 4 ô trên đường thẳng từ Raen qua mục tiêu. Gặp quân, vật cản hoặc mép map thì dừng tại ô hợp lệ cuối cùng. Mục tiêu vẫn bị trói dù không đẩy đủ 4 ô.

Trói kéo dài trong lượt công hiện tại của đối phương: cấm di chuyển, tấn công và skill công; vẫn dùng được bài trang bị.

### Hàn Tiễn — 3 sao, công, Attack

Chọn tối đa 1 kẻ địch trên đường thẳng trong phạm vi 4 ô. Có xuyên qua quân và vật cản. Gây 1 sát thương và đóng băng mục tiêu. Bộ binh không được dùng Guard để đỡ đòn này.

Đóng băng cấm skill phòng thủ, di chuyển và tấn công; hết cuối lượt hiện tại (lượt thủ hiện tại của bên bị đánh), không kéo sang lượt công kế tiếp.

Hiệu ứng áp dụng sau khi mục tiêu dính đòn. Không cần mất ít nhất 1 HP: giảm sát thương về 0 hoặc dùng trang bị hồi máu để không mất máu vẫn bị hiệu ứng. Né/hủy đòn bằng bài phòng thủ thì tránh được đóng băng.

Bài phòng thủ có sao >= 3 sao Hàn Tiễn vẫn được sử dụng. Không cấm skill thủ trước khi đòn trúng; khi đòn trúng thì áp dụng khóa skill thủ. Trang bị được tăng sát thương, tầm, số mục tiêu và số lần bắn.

## Xacnas

### Lời Chào Của Quỷ — 1 sao, công, buff, không phải Attack

+1 sát thương cho 1 cung thủ đồng đội trong phạm vi 3 ô, gồm lính, Hero cung thủ hoặc Xacnas. Áp dụng đòn thường và skill Attack, hiệu lực trong lượt công hiện tại. Đơn vị đã Attack không được nhận buff.

### Bão Phi Đao — 1 sao, công, Attack

Chọn tối đa 2 kẻ địch trong tầm đánh hiện tại của Xacnas, không cần cùng đường thẳng. Gây 1 sát thương mỗi mục tiêu. Tầm đánh gồm buff/trang bị. Trang bị được tăng sát thương, số mục tiêu và số lần đánh.

### Phân Bóng — 3 sao, thủ, không phải Attack

Chỉ bảo vệ Xacnas, hiệu lực toàn bộ lượt thủ. Người chơi tự chọn 2 số khác nhau trên xúc xắc, giữ nguyên cả lượt thủ. Mỗi lần đánh vào Xacnas, kẻ tấn công roll riêng; chỉ roll trúng một trong hai số mới được tiếp tục gây sát thương.

Roll thất bại: hủy đòn đánh vào Xacnas cùng hiệu ứng đi kèm. Roll thành công: Xacnas vẫn được kết hợp skill thủ khác, Guard và trang bị phòng thủ nếu hợp lệ. Quy tắc này là xác nhận cuối, thay thế mô tả trước từng cấm Guard.

Skill không tự phản sát thương. Khi kết hợp trang bị phản, sát thương phản tính theo sát thương nhận vào và quy tắc của trang bị; chưa tự định nghĩa thêm công thức phản.

## Lucy

### Phân Ảnh — 1 sao, thủ, không phải Attack

Hủy sát thương và hiệu ứng của 1 đòn đánh nhắm vào Lucy. Nếu đòn có nhiều mục tiêu, chỉ hủy phần tác động lên Lucy. Không dùng bảo vệ đồng đội.

### Bắn Trả — 1 sao, thủ, không phải Attack

Khi địch tấn công Lucy hoặc đồng đội thuộc bất kỳ hệ nào, gồm Hero và lính, Lucy bắn trả tối đa 2 đơn vị địch trong tầm bắn cơ bản của Lucy. Đây là tối đa 2 đơn vị, không phải 2 lần bắn vào cùng một đơn vị.

Dùng sát thương và tầm đánh cơ bản, không bao gồm buff/trang bị. Bắn trả diễn ra sau sát thương đòn kích hoạt. Lucy vẫn chịu sát thương nếu không được bảo vệ bằng skill hoặc bài phòng thủ. Đối phương đang lượt công không được mở phản ứng phòng thủ với Bắn Trả.

Nếu Lucy chết trước lúc bắn trả, không thực hiện Bắn Trả. Không có ngoại lệ cho Hero đã chết.

### Điên Cuồng — 1 sao, công, Attack

Lucy bắn 2 lần trong cùng một commit, mỗi lần có thể chọn mục tiêu khác nhau. Mỗi lần gây 2 sát thương cơ bản của skill, được cộng buff/trang bị. Dùng tầm đánh hiện tại gồm buff/trang bị. Mỗi lần bắn mở phản ứng phòng thủ riêng. Trang bị được tăng số lần bắn và số mục tiêu mỗi lần.
