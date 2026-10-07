# Dozen War — 3 Hero kỵ binh đã chốt

Đặc tả theo các xác nhận của người dùng trong cuộc trò chuyện. Thay thế bản đọc ảnh của Mask, Soul, Siri. Được triển khai trong v1.41.0.

## Quy ước chung

- Mask, Soul, Siri: kỵ binh, HP tối đa 3.
- Lính không có sao; sao trong đặc tả này là sao skill.
- Một turn là lượt của một bên. Buff công dưới đây hết khi kết thúc lượt công hiện tại.
- Attack là commit: đơn vị không được thực hiện hành động khác sau commit. Nhiều lần đánh đã được cấp sẽ xử lý trong cùng một commit, từng lần mở phản ứng phòng thủ riêng.
- Skill Attack có nắm đấm, tính là đòn đánh; kích hoạt buff không tính là đòn đánh.

## Mask

### Ma Kích — 1 sao, công, Attack

Chọn tối đa 2 kẻ địch trên cùng một đường thẳng trong phạm vi 3 ô tính từ Mask. Gây 1 sát thương mỗi mục tiêu. Được chọn mục tiêu phía sau quân đứng giữa. Chỉ mục tiêu được chọn nhận sát thương, không có sát thương lan mặc định.

### Phán Quyết — 1 sao, công, buff, không phải Attack

Cộng thêm 1 lần đánh cho 1 đơn vị kỵ binh đồng đội trong phạm vi 3 ô, gồm lính, Hero kỵ binh hoặc Mask. Không tăng tầm đánh. Đơn vị đã Attack không được nhận buff. Hiệu ứng trong lượt công hiện tại. Với 1 lần đánh cơ bản, đơn vị đánh 2 lần trong cùng một commit; xử lý lần lượt, mỗi lần mở phản ứng phòng thủ riêng.

### Cán Cân Công Lý — 4 sao, công, Attack

Chọn 1 Hero địch trên đường thẳng trong phạm vi tối đa 3 ô. Không yêu cầu đường thẳng không bị chắn. Roll Dice:
- Chẵn: mục tiêu nhận 2 sát thương, Mask hồi 2 HP.
- Lẻ: mục tiêu nhận 1 sát thương, Mask hồi 1 HP.

Mất máu của mục tiêu được xử lý như đòn đánh, chịu tác động trang bị tăng/giảm sát thương. Cho phép phản ứng phòng thủ nhưng cấm Guard bộ binh. Mask hồi theo kết quả xúc xắc ngay cả khi mục tiêu chết hoặc đối phương né/hủy đòn. Không tự tăng lượng hồi theo sát thương trang bị.

## Soul

### Ám Kỵ — 1 sao, công, buff, không phải Attack

Soul được +1 sát thương và +1 ô di chuyển trong lượt công hiện tại. Sát thương tăng áp dụng cho đòn thường và skill Attack. Nếu đã di chuyển nhưng chưa Attack, Soul được di chuyển thêm 1 ô ngay. Soul đã Attack không được dùng buff hoặc di chuyển thêm vì đã commit.

### Triệu Gọi Ám Hồn — 1 sao, công, không phải Attack

Soul trả 1 HP, tạo mới độc lập 1 lính kỵ binh bình thường vào hex trống liền kề Soul. Lính không có sao, không lấy từ đội hình/dự bị. Lính được di chuyển và đánh ngay sau xuất hiện, tồn tại cho tới khi bị đánh chết. Nếu không có hex trống liền kề, không được kích hoạt.

Soul còn 1 HP vẫn được sử dụng: Soul chết và lính vẫn được tạo ra. Trong Duel, sau đó trận kết thúc vì Hero chết; lính mới không được hành động. Không có ngoại lệ với điều kiện thua.

### Thây Độc — 3 sao, thủ, không phải Attack

Khi Soul bị tấn công, đổi vị trí với 1 lính cùng phe trong phạm vi 3 ô. Soul không mất máu; lính thế mạng nhận đòn và được dùng phản ứng phòng thủ.

Kẻ tấn công mất trực tiếp 1 HP cho đòn đang xử lý. Vẫn mất HP khi lính thế mạng né/hủy đòn hoặc giảm sát thương về 0. Đây không phải điều kiện bắt buộc phải gây sát thương thực tế lên lính. Hiệu ứng chỉ áp dụng cho đòn đang xử lý.

## Siri

### Săn Người — 1 sao, công, buff, không phải Attack

Buff riêng Siri trong lượt công hiện tại. Đòn đánh của Siri không được đỡ bằng Guard bộ binh. Chỉ cấm Guard bộ binh, không cấm các phản ứng phòng thủ khác. Áp dụng cả skill Attack được sao chép hoặc nhận thêm sau này.

### Phong Bộ — 1 sao, thủ, không phải Attack

Khi bị tấn công, Siri được di chuyển tối đa 3 ô để tránh sát thương và hủy cả hiệu ứng đi kèm đòn đánh. Tuân theo đường đi và địa hình, nhưng được đi xuyên qua lính và Hero. Phải kết thúc ở ô khác vị trí ban đầu. Nếu không có ô đích hợp lệ, không được dùng skill để tránh sát thương.

Mode/map hiện tại: 1 hex chỉ chứa 1 đơn vị, nên ô đích phải trống. Luật chứa quân phải phụ thuộc mode/map. Người dùng dự kiến mode/map khác cho phép 1 hex chứa 1 Hero và 5 lính; chưa triển khai hoặc tự áp dụng quy tắc này vào mode hiện tại, cũng chưa suy diễn các điều kiện chứa quân còn thiếu của mode tương lai.

### Ám Phong — 1 sao, công, buff, không phải Attack

Cho 1 đơn vị đồng đội bất kỳ trong phạm vi 3 ô +3 ô di chuyển trong lượt công hiện tại; có thể chọn Siri. Đơn vị đã di chuyển được di chuyển thêm 3 ô ngay nếu chưa Attack. Đơn vị đã Attack bị loại khỏi mục tiêu nhận buff.
