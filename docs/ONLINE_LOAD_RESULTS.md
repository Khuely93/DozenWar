# Kết quả đo tải online cục bộ

Đo ngày 2026-10-22, trên workspace x64 dùng Intel Xeon Platinum 8573C, Node 22.23.4 và PostgreSQL 17. **Không phải kết quả chạy trên Oracle ARM.** Dữ liệu chi tiết: [online-load-results.json](online-load-results.json).

App chạy trong container riêng giới hạn 1 CPU logic và 768 MiB RAM; PostgreSQL riêng 0,5 CPU/512 MiB. Bộ phát lệnh chạy ngoài container app. Mỗi mức tải dùng database kiểm tra mới, 2 client cho mỗi phòng, 60 giây đo sau khi hoàn tất setup. Các giới hạn CPU/RAM được đối chiếu bằng Docker inspect trước khi đo.

| Trận | Người chơi | Lệnh đã xác nhận | Xác nhận lệnh p95 | CPU app trung bình | RSS app cao nhất | Lệnh lỗi / thiếu cập nhật |
| --- | --- | --- | --- | --- | --- | --- |
| 5 | 10 | 300 | 7.0 ms | 6.7% | 93.6 MiB | 0 / 0 |
| 10 | 20 | 600 | 20.3 ms | 18.2% | 103.9 MiB | 0 / 0 |
| 20 | 40 | 1200 | 59.4 ms | 33.9% | 112.5 MiB | 0 / 0 |
| 50 | 100 | 2955 | 688.0 ms | 71.2% | 163.3 MiB | 0 / 0 |

p95 là thời gian 95% lệnh nhận xác nhận sau khi lưu, tính từ client qua WebSocket cục bộ; chưa cộng đường Internet đến người chơi. RSS là bộ nhớ tiến trình Node, khác với số bộ nhớ Docker tính phí vào cgroup. Các bài có cả di chuyển, tấn công/trang bị, phòng thủ, cửa sổ hủy/phản sát thương khi xuất hiện, đổi lượt, đấu lại và setup lại. Xem `actions` trong JSON để biết số lệnh của từng loại; không phải mọi kỹ năng đều được dùng.

Bộ phát lệnh gửi tối đa một hành động mỗi giây cho từng phòng, chờ xác nhận và đồng bộ rồi mới gửi tiếp. Ở tải cao, tốc độ thực có thể thấp hơn tốc độ đặt; đây là mô hình đóng vòng, không phải phép thử bắn lệnh vô hạn. Không tắt rate limit: các client mô phỏng dùng IP riêng qua chế độ trusted proxy, còn cổng backend kiểm tra chỉ mở trên localhost.

Mọi mức tải đạt ngưỡng regression của công cụ: không lệnh lỗi, không mất kết nối bất ngờ, cả hai ghế nhận cập nhật, ít nhất 70% tốc độ đặt và xác nhận p95 không quá 1.500 ms. **Đạt regression không có nghĩa là mức tải nên dùng khi ra mắt.** Ở 50 trận, p95 tăng mạnh và dư địa CPU giảm.

## Cấu hình khởi đầu

Đặt `MAX_ROOMS=20` cho bản thử; giá trị mặc định đã được cập nhật. Đây là số phòng giữ trong bộ nhớ, gồm phòng đã kết thúc còn thời gian reconnect/đấu lại, không chỉ trận đang đánh. Bắt đầu nhóm nhỏ, xác minh lại trên VM Oracle thật trước khi tăng. Không lấy 50 trận cục bộ làm cam kết 100 người trên Always Free.

Mỗi mức chỉ đo một phút. Bài này chưa xác nhận trận kéo dài hàng giờ, journal gần giới hạn 2.000 lệnh, tải mở trang/tải ảnh hàng loạt, nghẽn Internet, HTTPS, ổ đĩa Oracle hoặc CPU ARM. Khi có VM, cần đo lại cả độ trễ và CPU/RAM với loại máy/ổ đĩa được cấp.

## Chạy lại

```sh
npm ci
npm run benchmark:online -- --rooms 5,10,20,50 --seconds 60
```

Cần Docker Engine + Compose trên Linux và Node 22+. Lệnh build image production, tạo stack kiểm tra riêng, đo, ghi báo cáo vào `work/online-load/report.json` rồi dọn các container/volume của chính bài thử. Không dùng stack/volume production. `--skip-build` dùng lại image `dozenwar-online:benchmark` đã build; chỉ dùng khi image khớp mã cần kiểm tra.

CI chỉ chạy mức nhỏ 4 phòng/12 giây để phát hiện regression. Workflow `online-load.yml` dành cho chạy tay, không chạy định kỳ; nút dispatch được GitHub cung cấp khi workflow có trên default branch.
