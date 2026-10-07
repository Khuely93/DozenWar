# v1.43.0 — Trang bị Bộ binh đã chốt

Thêm 7 mẫu / 14 bản vào deck Duel: Búa Chiến 2, Khiên Ma Thuật 2, Song Kiếm 2, Giày Nhanh Nhẹn 3, Trường Thương 3, Lao Móc 1, Chùy Xích 1. Card dùng được cho lính và Hero hệ Bộ binh, kể cả Grim đang Giả Dạng Bộ binh nếu đủ điều kiện. Mỗi mẫu có ba asset riêng (art/frame/icon), chưa gắn artwork.

Sát thương, tầm, lần đánh tồn tại trong một commit; không ghi thành buff lâu dài. Song Kiếm mở từng đòn/phản ứng riêng và được chọn lại mục tiêu giữa các lần. Giày Nhanh Nhẹn dùng độc lập trước Attack, cộng một ô cho tối đa hai Bộ binh bất kỳ cùng phe chưa commit, kể cả đã di chuyển; hiệu lực đến hết lượt công. Lao Móc tiêu hao quyền Attack và một card; gây sát thương trước, kéo mục tiêu sống, tầm tối đa ba ô trên đường thẳng trống, hex trước mặt trống, không Guard Bộ binh. Khiên Ma Thuật phản sát thương sau giảm sát thương dù người nhận chết; không phản đòn né/hủy/zero damage. Có bước chọn trang bị cho Bộ binh Guard đồng đội.

Ngân sách trang bị vẫn theo rule_mode Duel hiện tại: một card công và một card thủ mỗi bên mỗi lượt tương ứng. Chia tối đa 5 card ban đầu từ deck độc lập của mỗi Player. Không thêm ngoại lệ vào luật Hero chết/thắng-thua.

Kiểm chứng: npm run build, 20 kiểm thử cơ chế trang bị, 47 tình huống trình duyệt Hero/trang bị, thao tác UI thực tế cho skill Est và Giày Nhanh Nhẹn. Kiểm tra asset IDs riêng, số lượng deck, buff cho đòn thường/skill, kéo quân lính, cản đường, phản chí tử, Guard + Khiên Ma Thuật và hủy đòn.
