# DozenWar UI reference — v1.71.1

- Desktop: 1920 × 1080 CSS px, DPR 1.
- Mobile: 390 × 844 CSS px, DPR 1; layout được đo lại riêng.
- 72 trạng thái mỗi bộ, 6073 lượt frame đo, 196 frame rời.
- PNG gốc / PNG đo / PNG khung dây / SVG / CSV / JSON.
- Mở index.html hoặc thư mục theo độ phân giải. Các ZIP chia nhóm hoạt động độc lập khi giải nén.
- Kích thước là border-box CSS, làm tròn 0.01 px. Canvas ảnh đo thêm 720 px chú giải ở ngoài. Ảnh gốc và frame SVG rời không có lề này.
- Font và layout được đo trong Chromium/Linux. Dùng ảnh ở 100%, không suy kích thước từ thumbnail.
- Màn dài có đường đánh dấu viewport đầu tiên; phần dưới phải cuộn. visibleRect trong JSON cho biết vùng thực sự không bị cắt.
- Các panel còn trong mã nhưng đã thay flow có nhãn Khung cũ. Alert/confirm/tooltip native của trình duyệt không có frame HTML của game để đo.

Tái tạo từng bộ:

node tools/export-ui-reference.cjs --width 1920 --height 1080
node tools/export-ui-reference.cjs --width 390 --height 844
node tools/ui-reference/package.cjs visual-previews/ui-reference-v1.71.1/1920x1080
node tools/ui-reference/package.cjs visual-previews/ui-reference-v1.71.1/390x844
node tools/ui-reference/verify.cjs
python tools/ui-reference/zip.py visual-previews/ui-reference-v1.71.1/1920x1080
python tools/ui-reference/zip.py visual-previews/ui-reference-v1.71.1/390x844
node tools/ui-reference/finalize.cjs
