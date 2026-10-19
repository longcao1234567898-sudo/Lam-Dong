-- Nạp 10 địa điểm mới (soạn ngày 19/10/2026), chạy SAU du_lich_lam_dong.sql.
--
-- Danh sách lấy từ hai bài cẩm nang mia.vn và Traveloka, chỉ lấy TÊN điểm. Không lấy ảnh
-- (ảnh của họ có bản quyền), không lấy giá vé, giờ mở cửa (dễ cũ, cán bộ bổ sung từ nguồn
-- chính thức). Mô tả viết lại, chỉ nêu điều chắc chắn.
-- Toạ độ: OpenStreetMap (Nominatim), xem cột nguon. Tà Năng là cả một vùng nên lấy tâm xã.
--
-- Tất cả ở trạng thái chờ cán bộ kiểm tra (da_kiem_tra = 0). Chưa có ảnh: giao diện hiện
-- bìa màu vùng cho tới khi cán bộ tải ảnh lên ở mục Địa điểm.
-- Vùng: 6 điểm quanh Đà Lạt gán Cao nguyên. 4 điểm ở Bảo Lộc, Bảo Lâm, Di Linh, Đạ Huoai
-- để trống (NULL) vì không thuộc "Cao nguyên Lâm Viên – Đà Lạt": cán bộ quyết định sau.
-- Chạy lại nhiều lần không bị trùng (INSERT IGNORE theo mã điểm).

INSERT IGNORE INTO dia_diem (id, ten, ten_en, loai, mo_ta, mo_ta_en, dia_chi, lat, lng, vung, noi_bat, hien, da_kiem_tra, nguon) VALUES
  ('vqg-bidoup-nui-ba', 'Vườn quốc gia Bidoup – Núi Bà', 'Bidoup – Nui Ba National Park', 'thien-nhien',
   'Vườn quốc gia trên cao nguyên Lâm Viên, phía bắc Đà Lạt, nằm trong Khu dự trữ sinh quyển thế giới Langbiang. Có đỉnh Bidoup cao hơn 2.200 m, rừng thông và rừng lá rộng nguyên sinh với nhiều loài đặc hữu. Có các cung đi bộ xuyên rừng.',
   'National park on the Lam Vien Plateau north of Da Lat, within the Langbiang World Biosphere Reserve. Home to Bidoup peak (over 2,200 m), pine and old-growth broadleaf forest with many endemic species, and forest hiking trails.',
   'Xã Lạc Dương, tỉnh Lâm Đồng', 12.1515938, 108.4726558, 'cao-nguyen', FALSE, TRUE, FALSE, 'Toạ độ: OpenStreetMap relation 7143312 (tâm vườn). Tên điểm: mia.vn.'),
  ('lang-cu-lan', 'Làng Cù Lần', 'Cu Lan Village', 'vui-choi',
   'Khu du lịch sinh thái dưới chân núi Langbiang, dựng theo nếp làng của người K''Ho với nhà gỗ, rừng thông và suối. Hợp đi dạo, dã ngoại giữa thiên nhiên.',
   'Eco-tourism area at the foot of Langbiang mountain, styled after a K''Ho village with wooden houses, pine forest and streams. Good for walks and picnics.',
   'Phường Lang Biang – Đà Lạt, tỉnh Lâm Đồng', 12.0265094, 108.3626621, 'cao-nguyen', FALSE, TRUE, FALSE, 'Toạ độ: OpenStreetMap way 1509937793. Tên điểm: mia.vn, Traveloka.'),
  ('nha-tho-chanh-toa-da-lat', 'Nhà thờ Chánh tòa Đà Lạt (Nhà thờ Con Gà)', 'Da Lat Cathedral (Chicken Church)', 'di-tich',
   'Nhà thờ trên đường Trần Phú, trung tâm Đà Lạt, quen gọi là Nhà thờ Con Gà vì tượng con gà trên đỉnh tháp chuông. Công trình kiến trúc thời Pháp, tường màu hồng, cửa kính màu.',
   'Cathedral on Tran Phu street in central Da Lat, known as the Chicken Church for the rooster on its bell tower. A French-era building with pink walls and stained-glass windows.',
   'Đường Trần Phú, phường Xuân Hương – Đà Lạt, tỉnh Lâm Đồng', 11.9362360, 108.4376880, 'cao-nguyen', FALSE, TRUE, FALSE, 'Toạ độ: OpenStreetMap (Nhà thờ Chánh Tòa, Trần Phú). Tên điểm: Traveloka.'),
  ('doi-che-cau-dat', 'Đồi chè Cầu Đất', 'Cau Dat Tea Hills', 'thien-nhien',
   'Những đồi chè trải dài trên sườn núi ở Cầu Đất, phía đông nam Đà Lạt, chè được trồng ở đây từ thời Pháp. Buổi sớm thường có mây sương phủ, là nơi ngắm bình minh và săn mây.',
   'Tea plantations rolling over the hills of Cau Dat, south-east of Da Lat, grown here since the French era. Early mornings are often misty, popular for sunrise and cloud-watching.',
   'Phường Xuân Trường – Đà Lạt, tỉnh Lâm Đồng', 11.8777526, 108.5603366, 'cao-nguyen', FALSE, TRUE, FALSE, 'Toạ độ: OpenStreetMap node 6546337786. Tên điểm: Traveloka.'),
  ('ta-nang', 'Tà Năng – cung đi bộ Tà Năng – Phan Dũng', 'Ta Nang – Ta Nang to Phan Dung trek', 'thien-nhien',
   'Vùng đồi cỏ và rừng thông ở xã Tà Năng, điểm đầu của cung đi bộ Tà Năng – Phan Dũng nối vùng cao nguyên với vùng biển phía đông, thường đi 2–3 ngày. Nên đi cùng đơn vị dẫn đường có giấy phép và tránh mùa mưa.',
   'Grassy hills and pine forest in Ta Nang commune, the start of the Ta Nang – Phan Dung trek from the highlands towards the eastern coast, usually 2–3 days. Go with a licensed guide and avoid the rainy season.',
   'Xã Tà Năng, tỉnh Lâm Đồng', 11.5942220, 108.4905530, 'cao-nguyen', FALSE, TRUE, FALSE, 'Toạ độ: tâm xã Tà Năng theo OpenStreetMap (vùng, không phải một điểm). Tên điểm: mia.vn.'),
  ('thac-bao-dai', 'Thác Bảo Đại', 'Bao Dai Waterfall', 'thien-nhien',
   'Thác nước giữa rừng ở xã Tà Hine, dòng nước đổ qua nhiều tầng đá.',
   'Forest waterfall in Ta Hine commune, cascading over several rock tiers.',
   'Xã Tà Hine, tỉnh Lâm Đồng', 11.6059710, 108.3503450, 'cao-nguyen', FALSE, TRUE, FALSE, 'Toạ độ: OpenStreetMap (Thác Bảo Đại, xã Tà Hine). Tên điểm: mia.vn.'),
  ('thac-dambri', 'Thác Dambri', 'Dambri Waterfall', 'thien-nhien',
   'Một trong những thác cao nhất Lâm Đồng, nước đổ từ độ cao khoảng 60 m giữa rừng, gần Bảo Lộc.',
   'One of the tallest waterfalls in Lam Dong, dropping about 60 m through the forest near Bao Loc.',
   'Bảo Lộc, tỉnh Lâm Đồng', 11.6419662, 107.7429168, NULL, FALSE, TRUE, FALSE, 'Toạ độ: OpenStreetMap node 3093994368. Tên điểm: mia.vn.'),
  ('chua-linh-quy-phap-an', 'Chùa Linh Quy Pháp Ấn', 'Linh Quy Phap An Pagoda', 'di-tich',
   'Ngôi chùa trên đồi ở Bảo Lâm, nổi tiếng với khoảnh sân nhìn ra biển mây lúc sáng sớm.',
   'Hilltop pagoda in Bao Lam, known for the terrace overlooking a sea of clouds in the early morning.',
   'Xã Bảo Lâm 3, tỉnh Lâm Đồng', 11.4514723, 107.8077703, NULL, FALSE, TRUE, FALSE, 'Toạ độ: OpenStreetMap node 4330925790. Tên điểm: mia.vn, Traveloka.'),
  ('thac-bobla', 'Thác Bobla', 'Bobla Waterfall', 'thien-nhien',
   'Thác nước ở Di Linh, nước đổ từ vách đá cao khoảng 30 m.',
   'Waterfall in Di Linh, falling about 30 m from a rock cliff.',
   'Xã Di Linh, tỉnh Lâm Đồng', 11.5741267, 108.0204695, NULL, FALSE, TRUE, FALSE, 'Toạ độ: OpenStreetMap node 5801773753. Tên điểm: mia.vn.'),
  ('madagui', 'Khu du lịch Madagui', 'Madagui Tourist Area', 'vui-choi',
   'Khu du lịch sinh thái rừng ở Đạ Huoai, bên Quốc lộ 20 trên đường Sài Gòn – Đà Lạt. Có rừng, hồ và các hoạt động dã ngoại, cắm trại.',
   'Forest eco-tourism area in Da Huoai beside National Road 20 on the Saigon – Da Lat route, with forest, a lake, picnics and camping.',
   'Xã Đạ Huoai, tỉnh Lâm Đồng', 11.3987096, 107.5496924, NULL, FALSE, TRUE, FALSE, 'Toạ độ: OpenStreetMap way 1424628178 (đập trong khu, gần đúng). Tên điểm: mia.vn.');
