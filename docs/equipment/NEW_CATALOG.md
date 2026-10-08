# Bộ trang bị mới — workspace

Toàn bộ 9 card cũ đã được gỡ khỏi catalog và bộ chia bài. Workspace có 30 mẫu / 60 lá: Bộ binh 7/13, Cung thủ 6/13, Kỵ binh 6/11, Dùng chung 11/23. Mỗi Player có deck độc lập, chia tối đa 5 lá đầu trận theo Duel. Các bổ sung sau v1.43.0 được phát hành trong v1.44.0.

## Nhóm và ID

| Nhóm | ID nhóm | Prefix card công | Prefix card thủ |
| --- | --- | --- | --- |
| Bộ binh | EQUIPMENT_GROUP_INF | EQUIP_INF_ATK_ | EQUIP_INF_DEF_ |
| Cung thủ | EQUIPMENT_GROUP_ARCH | EQUIP_ARCH_ATK_ | EQUIP_ARCH_DEF_ |
| Kỵ binh | EQUIPMENT_GROUP_CAV | EQUIP_CAV_ATK_ | EQUIP_CAV_DEF_ |
| Dùng chung | EQUIPMENT_GROUP_COMMON | EQUIP_COMMON_ATK_ | EQUIP_COMMON_DEF_ |

Card dùng chung sử dụng class NEU và hợp lệ cho cả Hero giả kim thuật sư. Danh mục công/thủ có ID EQUIPMENT_CATEGORY_ATTACK / EQUIPMENT_CATEGORY_DEFENSE / EQUIPMENT_CATEGORY_BOTH. ID mẫu card không thay đổi khi đổi tên hoặc visual. Mỗi bản sao trong tay bài có instanceId riêng.

## Cấu trúc

Thêm mẫu card đã được chốt vào `NEW_EQUIPMENT_CATALOG.cards` trong `src/content/content-runtime.js`:

```js
{
  id: 'EQUIP_INF_ATK_001',
  group: 'INF',              // INF | ARCH | CAV | COMMON
  category: 'ATTACK',        // ATTACK | DEFENSE | BOTH
  name: 'Tên đã chốt',
  text: 'Mô tả hiệu ứng đã chốt',
  star: 1,                  // số nguyên >= 1
  effects: ['EFFECT_ID'],    // phải đăng ký và được Core xử lý
  count: 2,                 // số bản sao trong bộ chia bài của mỗi Player; 0 để không chia
  visual: {
    art: './assets/equipment/inf/001/art.webp',
    frame: './assets/equipment/inf/001/frame.webp',
    icon: './assets/equipment/inf/001/icon.webp'
  }
}
```

Đây là mẫu cấu trúc, không phải một card đã được thêm vào game. Không dùng lại ID CARD_ của bộ cũ.

Mỗi mẫu tự đăng ký ba asset riêng: `IMG_<cardId>_ART`, `IMG_<cardId>_FRAME`, `ICON_<cardId>_ICON`. Có thể bỏ đường dẫn khi chưa có hình; card vẫn hiển thị tên, hệ, công/thủ, sao và mô tả. Đổi visual không đổi hiệu ứng, ID hay số lượng. Asset nhóm và công/thủ cũng có ID riêng.

`count` tạo số bản sao khác nhau trong deck; không còn lặp mặc định 3 lần. Deck mỗi Player độc lập theo Duel hiện tại. `startingHand` của rule_mode vẫn là giới hạn chia ban đầu; nếu deck ít hơn giới hạn, chia số bài có thật. Catalog hiện tại có tổng 60 lá theo số lượng người chơi đã chốt.

Hiệu ứng mới phải được triển khai trong Core trước khi thêm ID vào `effects`; chỉ ghi mô tả không đủ để tạo cơ chế. Trận lưu/replay cũ phải sử dụng snapshot/historical content tương ứng, không chuyển card cũ thành card mới.

## Thông tin cần chốt cho từng card

Tên — nhóm — công/thủ — số sao — hiệu ứng chi tiết — số lượng bản sao trong deck. Khi hiệu ứng có tăng tầm, mục tiêu, lần đánh hoặc di chuyển cần chốt thời hạn, điều kiện chọn mục tiêu và cách kết hợp skill.

## Thích Khách — EQUIP_COMMON_ATK_006

Dùng chung, Công, 4 sao, 2 lá. Chọn một Hero địch còn sống trên toàn bản đồ; gây 1 sát thương qua luồng phòng thủ, cho phép Guard bộ binh. Không tiêu hao quyền Attack; sát thương không lấy buff của người dùng. Asset art/frame/icon riêng theo ID card. Giày Nhanh Nhẹn: 2 lá; Lọ Phép Thuật: 1 lá.
