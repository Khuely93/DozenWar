# DozenWar UI reference — 390×844

Đo từ bản game v1.71.1 đang chạy, Chromium, viewport 390×844, deviceScaleFactor 1, zoom trình duyệt 100%.

- 72 trạng thái; 3041 frame được đo.
- Mỗi trạng thái: screen.png (gốc), measured.png (ghi kích thước), wireframe.png / wireframe.svg (khung dây), measurements.json (tọa độ và kiểu chữ/viền/padding).
- measurements.csv dùng UTF-8 BOM để mở bằng Excel.
- Kích thước W/H là border-box CSS sau transform; số thập phân được giữ đến 0.01 px. Không ước lượng theo mắt.
- layoutWidth/layoutHeight là kích thước layout làm tròn trước transform. visibleRect là phần không bị cắt bởi vùng cuộn/viewport.
- Ảnh ghi kích thước có vùng chú giải rộng 720 px ngoài canvas gốc. Phần game bên trái giữ nguyên tỷ lệ 1:1.
- SVG khung dây không chứa artwork; có thể mở trong Figma/Inkscape/Illustrator.
- Mỗi trạng thái được dựng bằng dữ liệu trận mẫu trong môi trường cục bộ. Không phải dữ liệu người chơi thật.
- Frame cũ có nhãn 'Khung cũ' là template còn trong mã, không phải flow mặc định.
- Menu matchmaking/ranked trong Play Hub là prototype; phòng online thật nằm trong nhóm Online.
- Các kích thước chỉ chính xác ở viewport này; thiết kế responsive cần đo riêng ở viewport khác.
- Popup cảnh báo native của trình duyệt (alert/confirm) không có frame HTML của game để đo; không phải cửa sổ UI tùy biến.

Chạy lại: node tools/export-ui-reference.cjs --width 390 --height 844
