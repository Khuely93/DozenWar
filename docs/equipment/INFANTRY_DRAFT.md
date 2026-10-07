# Trang bị Bộ binh — đã chốt và triển khai v1.43.0

Áp dụng cho lính và Hero có hệ Bộ binh hợp lệ tại thời điểm dùng. Đã thêm vào catalog và bộ chia bài.

| Tên | ID | Loại | Sao | Bản sao | Hiệu ứng người chơi cung cấp |
| --- | --- | --- | --- | --- | --- |
| Búa Chiến | EQUIP_INF_ATK_001 | Công | 1 | 2 | +1 sát thương cho 1 Bộ binh |
| Khiên Ma Thuật | EQUIP_INF_DEF_001 | Thủ | 4 | 2 | Phản toàn bộ sát thương vừa nhận khi bị đánh trực tiếp hoặc đỡ cho đồng đội; vẫn mất HP |
| Song Kiếm | EQUIP_INF_ATK_002 | Công | 1 | 2 | +1 lần đánh cho Bộ binh |
| Giày Nhanh Nhẹn | EQUIP_INF_ATK_003 | Công | 1 | 3 | +1 ô di chuyển cho 2 Bộ binh |
| Trường Thương | EQUIP_INF_ATK_004 | Công | 1 | 3 | +1 ô tầm đánh |
| Lao Móc | EQUIP_INF_ATK_005 | Công | 3 | 1 | Kéo 1 địch cách 3 ô theo đường thẳng, gây 1 sát thương, không Guard Bộ binh; đường giữa trống quân/vật cản |
| Chùy Xích | EQUIP_INF_ATK_006 | Công | 1 | 1 | +1 ô tầm đánh và +1 sát thương |

Tổng: 12 bản công, 2 bản thủ, 14 bản. Tên nhập “Trường Thuong” được chuẩn hóa thành “Trường Thương”, theo tên chuẩn hóa.

Mỗi ID được dành ba asset riêng: IMG_<ID>_ART, IMG_<ID>_FRAME, ICON_<ID>_ICON. Chưa có hình do người chơi cung cấp.

Đã chốt: buff sát thương/tầm/lần đánh chỉ dùng trong một commit, áp dụng cho cả đòn thường và skill Attack. Song Kiếm xử lý các lần đánh lần lượt, mỗi lần mở phản ứng phòng thủ riêng. Giày Nhanh Nhẹn dùng độc lập, chọn tối đa hai Bộ binh cùng phe ở bất kỳ đâu chưa Attack, cộng thêm một ô kể cả đã di chuyển, hết lượt công thì hết hiệu lực. Lao Móc là Attack ba sao, tầm tối đa ba ô, cần đường và hex trước mặt trống; sát thương trước rồi kéo mục tiêu sống; không Guard Bộ binh nhưng vẫn có phản ứng phòng thủ hợp lệ khác. Khiên Ma Thuật phản sát thương sau giảm sát thương, vẫn nhận HP damage và vẫn phản khi chết; né/hủy/zero damage không phản.
