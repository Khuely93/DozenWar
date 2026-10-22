# DozenWar online 1v1 — chuẩn bị trước khi có Oracle

Bản này chạy được trên máy phát triển mà không cần tài khoản Oracle, Home Region hay dịch vụ trả phí. Khi có máy Ubuntu ARM64 Always Free, dùng cùng mã nguồn và Docker Compose này, điền địa chỉ HTTPS và mật khẩu rồi chạy. Chưa có tài nguyên Oracle nào được tạo bởi thay đổi này.

## Chơi thử trên máy của bạn

Cần Node.js 22 trở lên:

```sh
npm ci
npm run build
npm run server
```

Mở `http://localhost:3030/online/` ở hai hồ sơ trình duyệt riêng (ví dụ cửa sổ thường và ẩn danh). Tạo phòng ở cửa sổ thứ nhất, nhập mã ở cửa sổ thứ hai, cùng bấm Sẵn sàng. Chọn 1 Hero + 5 lính, xếp quân rồi chơi. Đây là hai người thật; server không thay người còn thiếu bằng Bot. Chế độ offline cũ vẫn ở `/`.

Chế độ phát triển lưu trận trong `work/online-data/`. Đừng xóa thư mục này khi cần thử khôi phục trận. Dữ liệu phát triển dùng file; production bắt buộc PostgreSQL.

Kiểm tra:

```sh
npm run test:server
npm run test:online-browser
```

Bài kiểm tra trình duyệt cần Playwright và Chromium; đặt `CHROMIUM_PATH` nếu Chromium không ở `/usr/bin/chromium`. Nó dùng hai phiên riêng, đánh bằng kỹ năng, tắt/bật server giữa lúc chờ phòng thủ, tải lại trang, kiểm tra HP và di chuyển. Ảnh kiểm tra nằm ở `work/online-browser/`.

Bài kiểm tra PostgreSQL chạy khi có `POSTGRES_TEST_URL` trỏ vào **database dùng để kiểm tra**; không có biến này thì bài đó được ghi rõ là bỏ qua. Không dùng database production để chạy test.

## Khi đã có Oracle VM

1. Tạo VM Ubuntu **được console xác nhận thuộc Always Free**, có đủ RAM cho PostgreSQL + Node + Caddy (khuyến nghị từ 4 GB cho bản thử). Kiểm tra giá/nhãn miễn phí của cấu hình, boot volume và mạng tại thời điểm tạo. Khả năng cấp máy tùy vùng; repo không tự đăng ký tài khoản hoặc bảo đảm quota/công suất.
2. Cài Docker Engine và Compose plugin theo hướng dẫn chính thức của Docker. Clone repo vào VM. Image Node, PostgreSQL và Caddy sử dụng đều có ARM64; Docker tự chọn kiến trúc máy. Kiểm tra ARM64 thực tế sau khi tạo VM.
3. Có hostname trỏ A record về public IP của VM; có thể dùng tên miền con DNS miễn phí. Nếu dùng Cloudflare proxy, để DNS only trong lần cấu hình đầu. Hostname và DNS là việc còn cần cấu hình khi có IP.
4. Cho phép TCP 80/443 trong Oracle Security List/NSG và firewall Ubuntu; SSH 22 chỉ cho IP quản trị. UDP 443 là tùy chọn cho HTTP/3. Không mở PostgreSQL 5432 hoặc app 3030 ra Internet.
5. Từ thư mục repo:

```sh
cp deploy/.env.example deploy/.env
openssl rand -hex 32
# Sửa deploy/.env: hostname, HTTPS origin, mật khẩu vừa tạo; không commit file thật.
docker compose --env-file deploy/.env -f deploy/compose.yml up -d --build
docker compose --env-file deploy/.env -f deploy/compose.yml ps
```

`PUBLIC_HOST` là hostname thuần, ví dụ `play.example.com`. `PUBLIC_URL=https://play.example.com`, không có `/online` ở cuối. `ALLOWED_ORIGINS` liệt kê origin được phép, cách nhau bằng dấu phẩy. `PUBLIC_URL` luôn được cho phép, kể cả khi đặt thêm các origin khác. Không dùng `*`.

Mở `https://PUBLIC_HOST/api/health`, sau đó `https://PUBLIC_HOST/online/`. Caddy tự cấp/gia hạn chứng chỉ khi DNS và cổng 80/443 đúng. Frontend, WebSocket và API cùng hostname nên **không cần chỉnh mã game theo Home Region**.

Nếu vẫn muốn dùng GitHub Pages làm frontend, đặt `online/config.js` thành `globalThis.DOZEN_ONLINE_SERVER='https://PUBLIC_HOST';`, build và xuất bản lại frontend. Thêm origin GitHub Pages vào `ALLOWED_ORIGINS` (ví dụ `https://khuely93.github.io`, không thêm `/DozenWar`). GitHub Pages chỉ phục vụ giao diện, không chạy Node/PostgreSQL. Phương án đơn giản nhất là dùng luôn `/online/` do VM phục vụ.

## Vận hành và dữ liệu

Chỉ chạy **một app server**. Queue, room engine và socket nằm trong một tiến trình; PostgreSQL lưu bền. Bản này chưa hỗ trợ nhiều replica/load balancing hay tự chuyển sang máy khác khi VM hỏng.

- Client gửi ý định; server kiểm tra lượt, ô đi, mục tiêu, kỹ năng, quyền sở hữu bài và thực hiện luật. Xúc xắc/chia bài chạy ở server.
- Mỗi người có token phiên riêng, chỉ hash token được lưu database. Trình duyệt giữ token và lệnh chưa nhận xác nhận trong localStorage. Tải lại/kết nối lại dùng token để trở về đúng ghế. Đây là phòng chơi khách mời, chưa phải hệ thống tài khoản.
- Bài đối thủ được giấu; chỉ số lượng được gửi. Khi dùng Đánh Cắp, phải trả bài và qua cửa sổ hủy trước khi được xem lựa chọn.
- Thời gian lượt 180 giây; phòng thủ/hủy trang bị/phản sát thương 30 giây. Phản ứng tạm dừng thời gian lượt, không làm mới lượt. Chuẩn bị mỗi bước có hạn 5 phút. Mất mạng không dừng thời gian server.
- Server lưu lệnh, timestamp, seed và xác nhận trong một lần ghi PostgreSQL trước khi báo thành công. Retry cùng command ID không thực hiện lại. Khi phản hồi ghi database bị mất, server đọc lại bản đã lưu trước khi xử lý tiếp.
- Khôi phục bằng replay xác định, kể cả chuỗi phản ứng đang dở; không serialize callback JavaScript. Việc tắt app và PostgreSQL cùng lúc vẫn cần volume/backup còn nguyên.
- Mặc định tối đa 50 phòng lưu trong bộ nhớ với Compose; trận kết thúc được giữ tối đa 24 giờ cho reconnect/đấu lại. Mỗi phòng giới hạn 2.000 lệnh (đầu hàng vẫn được chấp nhận); có giới hạn tốc độ và kích thước thông điệp. Đây là giới hạn bảo vệ bản thử, không phải số người đồng thời đã được chứng minh bằng kiểm tra tải.
- Có health check PostgreSQL và container, log được xoay vòng. Chưa có hệ thống cảnh báo gửi tới quản trị viên, xếp hạng online, matchmaking tự động hoặc chống DDoS chuyên dụng.

## Cập nhật và tương thích trận đang chơi

Mỗi trận gắn với hash mã luật, bộ sinh số xác định và adapter server. **Chờ các trận kết thúc trước khi nâng phiên bản.** Nếu luật thay đổi, server mới trả `BUILD_MISMATCH` cho trận cũ thay vì đoán trạng thái. Muốn cứu trận đó phải chạy lại đúng image cũ và dữ liệu tương ứng. Giữ image được gắn tag theo commit (`APP_TAG`) và backup trước mỗi lần cập nhật; không tự xóa phòng cũ để lách kiểm tra này.

```sh
./deploy/backup.sh
# Sau khi không còn trận đang chơi, cập nhật source, đặt APP_TAG theo commit rồi:
docker compose --env-file deploy/.env -f deploy/compose.yml up -d --build
```

Đừng dùng `docker compose down -v` với dữ liệu thật: tùy chọn `-v` xóa volume.

Backup dạng `pg_dump -Fc`, quyền file chỉ dành cho chủ sở hữu:

```sh
./deploy/backup.sh
```

Sao chép backup ra **ngoài VM** và thử khôi phục ở môi trường kiểm tra. Volume trên cùng một VM không bảo vệ khỏi mất VM/boot volume. Script khôi phục dưới đây **thay thế dữ liệu hiện có**, dừng app trong lúc khôi phục, chỉ dùng khi đã xác định đúng backup:

```sh
./deploy/restore.sh --replace-database backups/dozenwar-YYYYMMDDTHHMMSSZ.dump
```

## Phạm vi kiểm chứng

Xem `server/README.md` về kiến trúc adapter và các kiểm tra. Docker Compose cần được kiểm tra lại với DNS, HTTPS, firewall và hai mạng Internet thật trên VM Oracle sau khi có tài khoản. Chưa có Home Region không cản trở phát triển/kiểm tra cục bộ; những bước hạ tầng này vẫn là phần phải làm sau.
