# Dozen War — 3 Hero giả kim thuật sư đã chốt

Đặc tả theo các xác nhận cuối của người dùng. Thay thế bản đọc ảnh và diễn giải trước cho Grim, Neuro, Ranus. Được triển khai trong v1.41.0.

## Quy ước

- Cả ba thuộc hệ Giả kim thuật sư, HP tối đa 3.
- Một turn là lượt của một bên. Buff công hết cuối lượt công hiện tại.
- Kích hoạt skill không phải Attack không tiêu hao quyền đánh/commit. Sao Chép kế thừa tính Attack của skill được sao chép.
- Đơn vị đã Attack/commit không thực hiện hành động khác. Các lần đánh thêm được xử lý trong cùng commit, từng lần mở phản ứng phòng thủ riêng.
- Chủng lính hợp lệ, điều kiện chứa quân trên hex và giới hạn sử dụng skill phụ thuộc rule_mode/map.

## Grim

### Giả Dạng — 1 sao, công và thủ, không phải Attack

Grim biến bản thân thành một chủng lính được rule_mode cho phép (hiện tại: bộ binh, kỵ binh, cung thủ). Nhận các thuộc tính của chủng đó: di chuyển, tầm đánh, sát thương, Guard và khả năng riêng.

Giữ danh tính Hero, HP hiện tại và HP tối đa 3. Grim chết vẫn thua theo luật Duel. Không hồi máu khi biến hình. Hình dạng giữ nguyên tới lần biến hình tiếp theo, không tự hết theo lượt.

Chỉ sử dụng được trang bị hợp lệ với chủng hiện tại. Trang bị đang mang không hợp chủng mới bị gỡ và trả về hand của Player, không giữ trên Grim ở trạng thái vô hiệu. Các skill còn lại vẫn dùng được nếu hợp lệ theo rule_mode.

### Cải Tạo Nhanh — 1 sao, công và thủ, không phải Attack

Chọn 1 lính đồng đội trong phạm vi 3 ô, đổi thành chủng lính khác được rule_mode cho phép. Không chọn Hero. Đổi vĩnh viễn. Đặt đầy HP theo chủng mới, không giữ lượng máu đã mất. Ví dụ bộ binh còn 1/2 HP -> cung thủ 1/1 HP -> bộ binh 2/2 HP.

Giữ trang bị và trạng thái đã di chuyển/Attack theo mô tả người dùng; không reset commit bằng đổi chủng. Khi dùng để bảo vệ lính đang bị đánh, đổi chủng trước sát thương; lính được dùng phản ứng phòng thủ hợp lệ theo chủng mới, gồm bài phòng thủ của chủng mới.

### Sao Chép — 3 sao, công và thủ, tính Attack theo skill gốc

Chỉ chọn skill Hero địch đã sử dụng trong cả trận; không giới hạn phạm vi, được chọn skill của Hero địch đã chết. Được sao chép mọi mức sao, kể cả trên 3 sao. Sao hiệu lực = min(sao skill gốc, 3). Ví dụ skill 1 sao -> 1 sao; 3 sao -> 3 sao; 4 sao -> 3 sao. Quy tắc này thay thế diễn giải trước từng cấm sao chép skill 4 sao.

Kế thừa hiệu ứng, sát thương, tính Attack và các thuộc tính skill gốc, ngoại trừ sao bị giới hạn như trên. Skill công chỉ dùng lượt công, skill thủ chỉ dùng lượt thủ. Sao chép skill Attack tính là đòn đánh và commit. Tính chỉ số, hệ, vị trí từ Grim, không từ Hero gốc.

## Neuro

### Thuốc Câm — 4 sao, công, không phải Attack, không commit

Chọn 1 Hero địch trong phạm vi 3 ô, không cần đường thẳng hoặc đường không bị chắn. Không gây sát thương. Cấm skill thủ đến hết lượt thủ hiện tại của đối phương; không cấm Guard và trang bị.

Mở phản ứng phòng thủ để đối phương né/hủy hiệu ứng trước khi khóa. Bài phòng thủ cần >= 4 sao, theo cơ chế so sánh sao của Core. Né/hủy thành công thì tránh hiệu ứng. Sau khi khóa được áp dụng, chỉ skill thủ bị cấm; Guard/trang bị vẫn dùng được nếu hợp lệ.

### Triệu Gọi — 1 sao, công và thủ, không phải Attack

Khi đã có ít nhất 1 lính đồng đội chết, điều kiện triệu gọi được giữ cho cả trận. Không tính lính địch chết. Không tiêu thụ xác/lượt chết. Skill khả dụng theo điều kiện và giới hạn rule_mode, người chơi tự chọn sử dụng, không tự tạo lính.

Tạo mới hoàn toàn 1 lính thuộc chủng được rule_mode cho phép tại ô hợp lệ xung quanh Neuro. Không hồi sinh một đơn vị cũ. Lính đầy HP, không có trang bị cũ. Trong lượt công được di chuyển và đánh ngay; trong lượt thủ được phản ứng phòng thủ ngay nếu hợp lệ. Không có ô đích hợp lệ thì không được kích hoạt.

Giới hạn sử dụng do rule_mode: mode 1vs1 dùng 1 lần cả trận; mode khác có thể cho dùng lại sau 1 round, theo định nghĩa mode đó, không tự áp dụng vào Duel.

### Thuốc Cấm — 1 sao, công, buff, không phải Attack

Chọn tối đa 2 đơn vị đồng đội bất kỳ trong phạm vi 3 ô, gồm Neuro. Mỗi đơn vị được +2 ô di chuyển trong lượt công hiện tại. Đơn vị đã di chuyển được đi thêm 2 ô ngay. Đơn vị đã Attack không được nhận buff.

## Ranus

### Dịch Chuyển — 1 sao, công và thủ, không phải Attack

Ranus dịch chuyển tới ô khác trong phạm vi 4 ô. Bỏ qua quân, vật cản và đường đi; ô đích phải hợp lệ theo mode/map. Không có ô đích hợp lệ thì không được dùng.

Lượt thủ: kích hoạt khi bị tấn công, hủy sát thương và hiệu ứng đi kèm nhắm vào Ranus. Lượt công: được dùng sau khi đã di chuyển thường, trước Attack. Dùng skill không tiêu hao quyền di chuyển thường.

### Thuật Cường Hóa — 1 sao, công, buff, không phải Attack

Cho 1 đơn vị đồng đội bất kỳ trong phạm vi 2 ô +1 lần đánh và +1 ô di chuyển. Có thể chọn Ranus. Không tăng tầm đánh. Buff hết cuối lượt công hiện tại. Tăng lần đánh áp dụng cho đòn thường và skill Attack. Đơn vị đã di chuyển được đi thêm 1 ô ngay; đã Attack không được nhận buff.

### Bùng Cháy — 1 sao, công, Attack

Chọn tối đa 4 kẻ địch trong phạm vi 2 ô xung quanh Ranus, không cần cùng đường thẳng. Gây 1 sát thương mỗi mục tiêu. Được chọn qua quân và vật cản. Trang bị được tăng sát thương, tầm, số mục tiêu và số lần đánh. Mỗi lần đánh mở phản ứng phòng thủ riêng.
