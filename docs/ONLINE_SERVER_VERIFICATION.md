# Online stability — kiểm chứng v1.70.1

- Regression server: 25/25 PASS với PostgreSQL 17, không bỏ qua test; có kiểm tra retry lệnh chia bài/xúc xắc không làm thay đổi RNG.
- Trình duyệt: flow hai người chơi và restart server; bộ network qua 7 tình huống với trễ, giới hạn băng thông, phản hồi bị mất, reconnect và reload.
- Đo tải riêng với PostgreSQL: 5/10/20/50 phòng, 60 giây mỗi mức; không lệnh lỗi hay thiếu cập nhật. [Kết quả và giới hạn](ONLINE_LOAD_RESULTS.md).
- CI mới: Node 22, PostgreSQL, Chromium, build production và bài tải nhỏ. [Hướng dẫn và phạm vi](ONLINE_STABILITY.md).

Đây là kiểm tra cục bộ. Chưa triển khai hay đo trên Oracle. Phần dưới giữ lại biên bản v1.70.0.

# Online Duel MVP — kiểm chứng v1.70.0

Kiểm tra thực hiện trong workspace ngày 2026-10-22. Chưa triển khai trên Oracle.

| Kiểm tra | Kết quả |
| --- | --- |
| Build production và các gate offline trong `npm run build` | PASS trong Docker Node 22 |
| Server regression, có PostgreSQL 17 thật | 23/23 PASS, không bỏ qua bài nào |
| Hai phiên Chromium độc lập | PASS: tạo/vào phòng, chọn đội, xếp quân, kỹ năng, phòng thủ, đổi lượt, tải lại và di chuyển |
| Khởi động lại server trong lúc chờ phòng thủ | PASS: khôi phục ghế và đòn đang chờ, HP xử lý đúng |
| Docker image production | Build thành công; chạy với user `node`, filesystem chỉ đọc |
| Compose Node + PostgreSQL + Caddy | PASS qua reverse proxy HTTP trên localhost |
| Tắt/bật cả app và PostgreSQL, giữ volume | PASS: khôi phục phản ứng và receipt, retry lệnh không đánh lần hai |
| `backup.sh` và `restore.sh` | PASS: backup, xóa dữ liệu **database kiểm tra**, restore, đối chiếu toàn bộ room document giống hệt |
| Asset production | PASS: 12 Hero, 12 màu lính, version/bundle đúng |
| Gameplay manifest Duel | Giữ `fnv1a32:5873bec7` |

Image Node 22 và Caddy đã được kiểm tra manifest có ARM64. Image ứng dụng trong workspace được build/chạy trên kiến trúc của workspace; chưa chạy thực tế trên VM ARM của Oracle.

Bài kiểm tra gồm quyền sở hữu ghế, giấu bài, idempotency, stale revision, rollback một phần và vị trí RNG, lỗi database/ghi thành công nhưng mất phản hồi, retry tạo/vào phòng, deadline server, guard không gia hạn thời gian, phản sát thương sau khi chết, đổi mục tiêu và quyền phòng thủ mới, Đánh Cắp chỉ lộ lựa chọn sau thanh toán, replay sau restart và chặn khác bản luật. Đây là bộ kiểm tra MVP, không phải kiểm chứng mọi tổ hợp kỹ năng/trang bị.

Còn phải làm khi có Oracle: tạo tài khoản/VM Always Free, gắn DNS, kiểm tra HTTPS/cổng mạng trên Internet thật, backup ra ngoài VM và đo tải theo cấu hình thực tế. Chưa có tài khoản, xếp hạng online, tự ghép trận hoặc nhiều app replica.

Hướng dẫn chạy: `deploy/README.md`. Kiến trúc và giới hạn: `server/README.md`.
