# Kiểm tra mạng và tự động hóa — v1.70.1

## Khôi phục khi kết nối không ổn định

Trình duyệt lưu lệnh chưa nhận xác nhận trước khi gửi. Khi phản hồi bị mất, nó tự thử lại với **cùng command ID**, không tạo hành động mới. Server trả receipt đã lưu nếu lệnh đã thực hiện. Sau reconnect, giao diện chờ xác thực lại ghế và đồng bộ; phản hồi từ kết nối cũ không được dùng để hoàn tất yêu cầu của kết nối mới.

Những thay đổi chính:

- Phân biệt socket mất kết nối và hết thời gian chờ phản hồi; cả hai đều có đường khôi phục tự động.
- Retry có khoảng nghỉ tăng dần, tối đa 5 giây giữa lần thử; vẫn giữ kiểm tra lượt/revision và thông báo khi lựa chọn đã cũ.
- Server cho phép lặp lại resume trên cùng socket với đúng token/phòng. Token khác không được đổi ghế của socket đã xác thực.
- Lỗi API tạm thời khi khởi tạo trang được thử lại. Lệnh đã xác nhận nhưng chưa nhận được trạng thái mới tiếp tục được đồng bộ.
- Đồng hồ server tiếp tục chạy khi người chơi rớt mạng.

Chạy:

```sh
npm ci
npx playwright install --with-deps chromium
npm run test:online-browser
npm run test:online-network
```

Có thể đặt `CHROMIUM_PATH` để dùng Chromium đã cài. Hai script dùng Playwright được khóa phiên bản trong package-lock, không dựa vào dependency cài toàn hệ thống. `work/online-network/report.json` ghi kết quả và ảnh ở cùng thư mục.

Bộ network điều khiển trình duyệt thật qua relay WebSocket cục bộ:

1. Mất phản hồi resume: tự thử lại trên socket hiện tại; khóa nút trong khi chưa xác thực xong.
2. API trả HTTP 503 tạm thời lúc mở trang: tự khôi phục.
3. RTT khoảng 350–450 ms có jitter; mất xác nhận sau khi đã dùng trang bị: tự retry, chỉ trả một lá bài.
4. Cắt kết nối sau khi dùng bài hủy, tải lại trang: giữ ghế, tiếp tục đòn chờ phòng thủ, không trừ bài hai lần.
5. Nhận lại frame trạng thái cũ: không lùi revision hoặc khôi phục bài đã dùng.
6. Người phòng thủ mất mạng: server tự hết hạn và giải quyết sát thương một lần. Bài test tăng đồng hồ server thêm 35 giây để kiểm tra deadline, không giả vờ đã đợi 35 giây thực.
7. Lệnh chưa tới server bị mất: sau reconnect vẫn gửi được lệnh đó với cùng ID, trong cấu hình RTT xấp xỉ 1 giây và băng thông 128 kbps lên / 512 kbps xuống.

Relay giữ thứ tự frame khi mô phỏng độ trễ/băng thông. Việc chủ động bỏ phản hồi hoặc đóng socket kiểm tra khôi phục ở tầng ứng dụng; đây không phải mô phỏng trực tiếp mọi cơ chế mất gói/retransmission TCP. Không có cam kết rằng mọi mạng di động hoặc mọi mức nghẽn đều đã được kiểm tra.

## GitHub Actions

`.github/workflows/online-ci.yml` chạy khi push vào `main`/`codex/**`, mở PR hoặc dispatch khi workflow có trên default branch:

- Node 22, `npm ci`, build và các gate offline.
- Regression server với PostgreSQL 17 thật, bao gồm kiểm tra RNG/receipt/reconnect.
- Chromium: hai người chơi, restart server và các tình huống mạng ở trên.
- Build image production, đo nhỏ 4 phòng trong 12 giây qua stack PostgreSQL riêng, app 1 CPU/768 MiB.
- Giữ ảnh và báo cáo kiểm tra 7 ngày để xem lỗi. Các lần chạy cũ của cùng nhánh được hủy khi có push mới.

Workflow không deploy lên Oracle, không publish image và không cần secret cloud. Job chỉ được quyền đọc repository.

`.github/workflows/online-load.yml` cung cấp bài đo dài theo yêu cầu; không có lịch tự chạy. GitHub chỉ cung cấp nút workflow_dispatch khi file workflow đã có trên default branch. Kết quả đo tay được giữ 14 ngày. Xem `ONLINE_LOAD_RESULTS.md` về ngưỡng, số đo và giới hạn.
