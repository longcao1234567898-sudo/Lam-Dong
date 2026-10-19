-- Nạp 13 địa điểm mới kèm bài giới thiệu chi tiết (soạn ngày 19/10/2026), chạy SAU du_lich_lam_dong.sql.
--
-- Danh sách lấy từ hai bài cẩm nang mia.vn và Traveloka, chỉ lấy TÊN điểm. Không lấy ảnh
-- (ảnh của họ có bản quyền), không lấy giá vé, giờ mở cửa (dễ cũ, cán bộ bổ sung từ nguồn
-- chính thức). Mô tả viết lại, chỉ nêu điều chắc chắn.
-- Toạ độ: OpenStreetMap (Nominatim), xem cột nguon. Tà Năng là cả một vùng nên lấy tâm xã.
--
-- Tất cả ở trạng thái chờ cán bộ kiểm tra (da_kiem_tra = 0). Chưa có ảnh: giao diện hiện
-- bìa màu vùng cho tới khi cán bộ tải ảnh lên ở mục Địa điểm.
-- Vùng: 6 điểm quanh Đà Lạt gán Cao nguyên. 5 điểm ở Bảo Lộc, Bảo Lâm, Di Linh, Đạ Huoai, Cát Tiên
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
   'Một trong những thác cao và hùng vĩ nhất Lâm Đồng, nước đổ từ độ cao hàng chục mét giữa rừng, gần Bảo Lộc.',
   'One of the tallest and most impressive waterfalls in Lam Dong, dropping tens of metres through the forest near Bao Loc.',
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

-- Bài giới thiệu chi tiết (cùng khuôn với 15 điểm cũ): Giới thiệu, Lịch sử hình thành,
-- Có gì để xem, Kinh nghiệm. Bản tổng hợp chờ cán bộ đối chiếu. Mốc năm chưa chắc ghi
-- "cán bộ bổ sung". Chỉ điền khi còn trống, chạy lại không đè bài cán bộ đã sửa.
UPDATE dia_diem SET chi_tiet = '## Giới thiệu
Vườn quốc gia Bidoup – Núi Bà nằm trên cao nguyên Lâm Viên, phía bắc Đà Lạt, là vùng lõi của Khu dự trữ sinh quyển thế giới Langbiang. Đây là nơi có đỉnh Bidoup, mốc đỉnh ghi độ cao 2.280 m, một trong những đỉnh núi cao nhất Tây Nguyên.

Rừng ở đây gồm rừng thông, rừng lá rộng thường xanh và rừng hỗn giao, với nhiều loài thực vật quý như pơ mu, thông hai lá dẹt cùng nhiều loài chim, thú đặc hữu. Vùng núi này cũng là nơi sinh sống lâu đời của đồng bào K''Ho.

## Lịch sử hình thành
- 2004: Thành lập Vườn quốc gia Bidoup – Núi Bà.
- 2015: UNESCO công nhận Khu dự trữ sinh quyển thế giới Langbiang, trong đó vườn quốc gia là vùng lõi.
- Ngày nay: Vườn có trung tâm du khách và các tuyến đi bộ xuyên rừng, leo núi do vườn quản lý.

## Có gì để xem
- Trung tâm du khách giới thiệu thiên nhiên và văn hoá bản địa của vùng.
- Các tuyến đi bộ xuyên rừng nguyên sinh, ngắm thông hai lá dẹt và rừng rêu.
- Tuyến leo đỉnh Bidoup cho người có sức khoẻ tốt.

## Kinh nghiệm
- Các tuyến xuyên rừng và leo đỉnh cần đăng ký với vườn quốc gia và đi cùng người dẫn đường.
- Trên núi lạnh và hay mưa bất chợt: mang áo ấm, áo mưa, giày leo núi.
- Không bẻ cây, không mang động vật, thực vật ra khỏi rừng.', chi_tiet_en = '## About
Bidoup – Nui Ba National Park lies on the Lam Vien Plateau north of Da Lat and forms the core of the Langbiang World Biosphere Reserve. It is home to Bidoup peak, marked at 2,280 m on the summit marker and one of the tallest summits in the Central Highlands.

Its pine, evergreen broadleaf and mixed forests shelter rare plants such as Fujian cypress and the flat-needle Krempf pine, along with many endemic birds and mammals. The mountains have long been home to the K''Ho people.

## Timeline
- 2004: Bidoup – Nui Ba National Park is established.
- 2015: UNESCO recognises the Langbiang World Biosphere Reserve, with the park as its core.
- Today: A visitor centre and park-managed forest hiking and climbing trails.

## What to see
- The visitor centre, on the area''s nature and indigenous culture.
- Hikes through old-growth forest, Krempf pines and mossy woods.
- The climb to Bidoup peak for fit hikers.

## Tips
- Forest treks and the summit climb must be registered with the park and done with a guide.
- It is cold and showers come suddenly: bring a jacket, rain gear and hiking shoes.
- Do not cut plants or take any plant or animal out of the forest.' WHERE id = 'vqg-bidoup-nui-ba' AND chi_tiet IS NULL;
UPDATE dia_diem SET chi_tiet = '## Giới thiệu
Làng Cù Lần là khu du lịch sinh thái dưới chân núi Langbiang, cách trung tâm Đà Lạt khoảng 20 km. Khu này dựng theo nếp làng của người K''Ho với những ngôi nhà gỗ giữa rừng thông, có suối, hồ và đồng cỏ.

Không khí yên tĩnh, hợp với ai muốn đi dạo, dã ngoại hay nghỉ một đêm giữa rừng, cách xa phố thị.

## Lịch sử hình thành
- Ngày nay: Khu du lịch sinh thái trong vùng rừng thông dưới chân Langbiang. (Năm mở cửa và đơn vị quản lý: cán bộ bổ sung.)

## Có gì để xem
- Nhà gỗ, cầu treo, con suối và rừng thông.
- Đi bộ trong rừng, chèo thuyền trên hồ, dã ngoại trên đồng cỏ.
- Ẩm thực kiểu núi rừng của đồng bào bản địa.

## Kinh nghiệm
- Đường vào có đoạn đèo dốc, đi xe máy cần cẩn thận khi trời mưa.
- Buổi tối trong rừng rất lạnh, nên mang áo ấm nếu nghỉ lại.', chi_tiet_en = '## About
Cu Lan Village is an eco-tourism area at the foot of Langbiang mountain, about 20 km from central Da Lat. It is laid out like a K''Ho village, with wooden houses among pine forest, streams, a lake and meadows.

It is quiet, good for walks, picnics or a night in the forest away from the city.

## Timeline
- Today: An eco-tourism area in the pine forest below Langbiang. (Opening year and operator: to be added by staff.)

## What to see
- Wooden houses, a suspension bridge, the stream and the pines.
- Forest walks, boating on the lake, picnics on the meadow.
- Mountain-style food of the local people.

## Tips
- The road in has steep stretches, so ride carefully in the rain.
- Nights in the forest are cold: bring warm clothes if staying over.' WHERE id = 'lang-cu-lan' AND chi_tiet IS NULL;
UPDATE dia_diem SET chi_tiet = '## Giới thiệu
Nhà thờ Chánh tòa Đà Lạt nằm trên đường Trần Phú, ngay trung tâm thành phố. Người dân quen gọi là Nhà thờ Con Gà vì trên đỉnh tháp chuông có tượng con gà trống.

Công trình mang phong cách kiến trúc phương Tây thời Pháp, tường sơn màu hồng, bên trong có nhiều ô cửa kính màu. Đây là nhà thờ lớn nhất Đà Lạt và vẫn là nơi sinh hoạt tôn giáo thường xuyên.

## Lịch sử hình thành
- 1931: Khởi công xây dựng.
- 1942: Hoàn thành công trình.
- Ngày nay: Nhà thờ chính tòa của Giáo phận Đà Lạt, một biểu tượng kiến trúc của thành phố.

## Có gì để xem
- Tháp chuông với tượng con gà trên đỉnh.
- Các ô cửa kính màu bên trong thánh đường.
- Mặt tiền màu hồng, đẹp khi chụp từ đường Trần Phú.

## Kinh nghiệm
- Đây là nơi thờ tự: ăn mặc kín đáo, giữ yên lặng, không vào trong giờ lễ nếu không dự lễ.
- Có thể ghép với hồ Xuân Hương và chợ Đà Lạt trong một buổi.', chi_tiet_en = '## About
Da Lat Cathedral stands on Tran Phu street in the city centre. Locals call it the Chicken Church after the rooster on top of its bell tower.

It is a French-era Western-style building with pink walls and many stained-glass windows inside. It is the largest church in Da Lat and still holds regular services.

## Timeline
- 1931: Construction begins.
- 1942: The building is completed.
- Today: Cathedral of the Diocese of Da Lat and an architectural symbol of the city.

## What to see
- The bell tower with the rooster on top.
- The stained-glass windows inside the nave.
- The pink facade, best photographed from Tran Phu street.

## Tips
- It is a place of worship: dress modestly, keep quiet and do not go in during mass unless attending.
- Easy to combine with Xuan Huong Lake and Da Lat market.' WHERE id = 'nha-tho-chanh-toa-da-lat' AND chi_tiet IS NULL;
UPDATE dia_diem SET chi_tiet = '## Giới thiệu
Đồi chè Cầu Đất trải dài trên các sườn đồi ở độ cao khoảng 1.600 m, phía đông nam trung tâm Đà Lạt chừng 20 km. Chè được người Pháp đưa về trồng ở vùng này từ đầu thế kỷ XX và đến nay vẫn được chăm sóc, thu hái.

Buổi sớm, mây và sương thường phủ kín các triền đồi, nắng lên lộ ra những luống chè xanh nối tiếp nhau.

## Lịch sử hình thành
- Thập niên 1920: Người Pháp mở đồn điền và nhà máy chè ở Cầu Đất.
- Ngày nay: Vùng chè vẫn hoạt động, đồng thời là điểm tham quan, ngắm bình minh, săn mây. (Mốc năm cụ thể: cán bộ bổ sung.)

## Có gì để xem
- Đồi chè xanh trải dài, đẹp nhất lúc bình minh.
- Biển mây vào sáng sớm những ngày trời quang.
- Tìm hiểu cách trồng, hái và chế biến chè.

## Kinh nghiệm
- Muốn săn mây nên đến trước 6 giờ sáng và mang áo ấm.
- Đi giữa các luống chè, không giẫm lên cây, không hái chè khi chưa được phép.', chi_tiet_en = '## About
The Cau Dat tea hills roll across slopes about 1,600 m high, some 20 km south-east of central Da Lat. The French brought tea to the area in the early 20th century, and it is still grown and picked today.

Early in the morning cloud and mist often fill the valleys, then the sun reveals row after row of green tea.

## Timeline
- 1920s: The French open a tea plantation and factory at Cau Dat.
- Today: The tea area still works and is also a place for sunrise and cloud-watching. (Exact dates: to be added by staff.)

## What to see
- Endless green tea rows, best at sunrise.
- A sea of clouds on clear early mornings.
- How tea is grown, picked and processed.

## Tips
- For the clouds, arrive before 6 a.m. and bring a jacket.
- Walk between the rows, do not step on the bushes or pick tea without permission.' WHERE id = 'doi-che-cau-dat' AND chi_tiet IS NULL;
UPDATE dia_diem SET chi_tiet = '## Giới thiệu
Tà Năng là vùng đồi cỏ xen rừng thông ở xã Tà Năng, điểm đầu của cung đi bộ Tà Năng – Phan Dũng, một trong những cung trekking nổi tiếng của Việt Nam. Cung đường đi qua nhiều đồi cỏ, rừng thông và suối, nối vùng cao nguyên với vùng phía đông của tỉnh, thường đi trong 2 đến 3 ngày.

## Lịch sử hình thành
- Xưa: Lối mòn qua núi nối vùng cao với vùng biển.
- Ngày nay: Cung trekking được nhiều đoàn lựa chọn, có quy định về đơn vị tổ chức và người dẫn đường. (Văn bản quản lý cụ thể: cán bộ bổ sung.)

## Có gì để xem
- Những đồi cỏ trải dài, đẹp nhất vào mùa khô.
- Rừng thông, suối và cảnh hoàng hôn trên đồi.
- Cắm trại qua đêm giữa núi đồi.

## Kinh nghiệm
- Chỉ đi cùng đơn vị tổ chức có giấy phép và người dẫn đường địa phương, không tự đi.
- Tránh mùa mưa: đường trơn, suối dâng nhanh, dễ lạc.
- Mang đủ nước, đồ ăn, áo ấm, đèn pin và báo lộ trình cho người thân.', chi_tiet_en = '## About
Ta Nang is an area of grassy hills and pine forest in Ta Nang commune, the start of the Ta Nang – Phan Dung trek, one of the best-known treks in Vietnam. The route crosses grassy ridges, pine forest and streams from the highlands towards the east of the province, usually over 2 to 3 days.

## Timeline
- Long ago: A mountain path linking the highlands and the coast.
- Today: A popular trekking route, with rules on organisers and guides. (Specific regulations: to be added by staff.)

## What to see
- Rolling grassy hills, best in the dry season.
- Pine forest, streams and sunsets over the hills.
- Camping overnight in the mountains.

## Tips
- Only go with a licensed organiser and a local guide, never alone.
- Avoid the rainy season: trails get slippery, streams rise fast and it is easy to get lost.
- Carry enough water, food, warm clothes and a torch, and tell someone your route.' WHERE id = 'ta-nang' AND chi_tiet IS NULL;
UPDATE dia_diem SET chi_tiet = '## Giới thiệu
Thác Bảo Đại nằm giữa rừng ở xã Tà Hine, dòng nước đổ qua nhiều tầng đá giữa cây cối rậm rạp. Thác mang tên vua Bảo Đại.

## Lịch sử hình thành
- Ngày nay: Điểm tham quan thiên nhiên giữa rừng. (Nguồn gốc tên gọi, năm mở cửa và đơn vị quản lý: cán bộ bổ sung.)

## Có gì để xem
- Dòng thác nhiều tầng giữa rừng.
- Lối đi bộ dưới tán rừng xuống chân thác.

## Kinh nghiệm
- Đường xuống thác dốc và trơn, mang giày đế bám.
- Mùa mưa nước chảy mạnh: không tắm, không leo lên các tảng đá.', chi_tiet_en = '## About
Bao Dai Waterfall lies in the forest of Ta Hine commune, cascading over several rock tiers among dense trees. It bears the name of Emperor Bao Dai.

## Timeline
- Today: A nature spot in the forest. (Origin of the name, opening year and operator: to be added by staff.)

## What to see
- The multi-tiered falls in the forest.
- The forest path down to the foot of the falls.

## Tips
- The path down is steep and slippery: wear shoes with good grip.
- In the rainy season the current is strong: do not swim or climb on the rocks.' WHERE id = 'thac-bao-dai' AND chi_tiet IS NULL;
UPDATE dia_diem SET chi_tiet = '## Giới thiệu
Thác Dambri nằm cách trung tâm Bảo Lộc khoảng 18 km, là một trong những thác cao và hùng vĩ nhất Lâm Đồng, nước đổ từ độ cao hàng chục mét xuống giữa rừng (các nguồn ghi từ khoảng 60 m đến 90 m, cán bộ đối chiếu số chính thức). Mùa mưa, thác tung bọt trắng xoá, hơi nước bay xa cả một vùng.

## Lịch sử hình thành
- Ngày nay: Khu du lịch có lối đi bộ và các điểm ngắm thác. (Năm mở cửa và đơn vị quản lý: cán bộ bổ sung.)

## Có gì để xem
- Toàn cảnh thác từ trên cao và từ chân thác.
- Rừng nguyên sinh quanh khu thác.

## Kinh nghiệm
- Lối xuống chân thác có nhiều bậc, ướt và trơn: mang giày đế bám.
- Không tắm ở vùng nước dưới chân thác.
- Từ Bảo Lộc có thể ghép với đồi chè và các cơ sở chè, tơ lụa trong một ngày.', chi_tiet_en = '## About
Dambri Waterfall lies about 18 km from central Bao Loc and is one of the tallest waterfalls in Lam Dong, dropping tens of metres into the forest (sources give 60 to 90 m, to be confirmed by staff). In the rainy season it churns white and spray drifts far around.

## Timeline
- Today: A tourist area with walking paths and viewpoints. (Opening year and operator: to be added by staff.)

## What to see
- The falls from above and from the foot.
- The old-growth forest around the falls.

## Tips
- The steps down are wet and slippery: wear shoes with good grip.
- Do not swim in the pool below the falls.
- From Bao Loc, combine with the tea hills and tea or silk workshops in one day.' WHERE id = 'thac-dambri' AND chi_tiet IS NULL;
UPDATE dia_diem SET chi_tiet = '## Giới thiệu
Chùa Linh Quy Pháp Ấn nằm trên một ngọn đồi ở Bảo Lâm, nổi tiếng với khoảnh sân trước chùa nhìn ra thung lũng. Vào sáng sớm những ngày trời đẹp, mây phủ kín thung lũng tạo thành biển mây ngay dưới chân.

## Lịch sử hình thành
- Ngày nay: Ngôi chùa trên đồi, vừa là nơi tu tập vừa là điểm ngắm bình minh, biển mây. (Năm xây dựng: cán bộ bổ sung.)

## Có gì để xem
- Biển mây và bình minh nhìn từ sân chùa.
- Kiến trúc chùa giữa đồi chè và rừng.

## Kinh nghiệm
- Muốn ngắm biển mây nên có mặt trước 6 giờ sáng.
- Đây là nơi thờ tự: ăn mặc kín đáo, giữ yên lặng, không làm ồn khi chụp ảnh.', chi_tiet_en = '## About
Linh Quy Phap An Pagoda sits on a hill in Bao Lam and is known for the courtyard overlooking the valley. On clear early mornings cloud fills the valley, forming a sea of clouds right below.

## Timeline
- Today: A hilltop pagoda, both a place of practice and a spot for sunrise and clouds. (Year built: to be added by staff.)

## What to see
- Sunrise and the sea of clouds from the courtyard.
- The pagoda among tea hills and forest.

## Tips
- For the clouds, be there before 6 a.m.
- It is a place of worship: dress modestly, keep quiet and be considerate when taking photos.' WHERE id = 'chua-linh-quy-phap-an' AND chi_tiet IS NULL;
UPDATE dia_diem SET chi_tiet = '## Giới thiệu
Thác Bobla nằm ở Di Linh, gần Quốc lộ 20, nước đổ từ vách đá cao khoảng 30 m. Đây là một trong những thác lớn của vùng Di Linh, dễ ghé trên đường giữa Bảo Lộc và Đà Lạt.

## Lịch sử hình thành
- Ngày nay: Điểm tham quan thiên nhiên. (Năm mở cửa và đơn vị quản lý: cán bộ bổ sung.)

## Có gì để xem
- Dòng thác đổ từ vách đá cao.
- Cảnh rừng và đồi quanh khu thác.

## Kinh nghiệm
- Mùa mưa thác đẹp nhưng nước mạnh: không tắm, không lại gần mép đá trơn.
- Tiện ghé khi đi Quốc lộ 20 giữa Bảo Lộc và Đà Lạt.', chi_tiet_en = '## About
Bobla Waterfall is in Di Linh near National Road 20, falling about 30 m from a rock cliff. It is one of the larger falls around Di Linh and an easy stop between Bao Loc and Da Lat.

## Timeline
- Today: A nature spot. (Opening year and operator: to be added by staff.)

## What to see
- The falls dropping from the high cliff.
- The forest and hills around them.

## Tips
- The falls are fullest in the rainy season, but the current is strong: do not swim or go near slippery edges.
- An easy stop on National Road 20 between Bao Loc and Da Lat.' WHERE id = 'thac-bobla' AND chi_tiet IS NULL;
UPDATE dia_diem SET chi_tiet = '## Giới thiệu
Khu du lịch Madagui nằm ở Đạ Huoai, ngay bên Quốc lộ 20 trên đường từ Thành phố Hồ Chí Minh lên Đà Lạt. Khu có rừng, hồ, suối và nhiều khoảng đất rộng để dã ngoại, cắm trại, là điểm dừng chân quen thuộc của các đoàn lên cao nguyên.

## Lịch sử hình thành
- Ngày nay: Khu du lịch sinh thái rừng. (Năm mở cửa và đơn vị quản lý: cán bộ bổ sung.)

## Có gì để xem
- Rừng và hồ nước trong khu.
- Các hoạt động dã ngoại, cắm trại, vui chơi ngoài trời.

## Kinh nghiệm
- Tiện dừng nghỉ giữa chặng đường Thành phố Hồ Chí Minh – Đà Lạt.
- Vùng thấp nên nóng hơn Đà Lạt nhiều: mang nước và mũ.', chi_tiet_en = '## About
Madagui Tourist Area is in Da Huoai, right beside National Road 20 on the way from Ho Chi Minh City up to Da Lat. It has forest, a lake, streams and open spaces for picnics and camping, and is a familiar stop for groups heading to the highlands.

## Timeline
- Today: A forest eco-tourism area. (Opening year and operator: to be added by staff.)

## What to see
- The forest and lake.
- Picnics, camping and outdoor activities.

## Tips
- A handy break on the Ho Chi Minh City – Da Lat road.
- It is low and much hotter than Da Lat: bring water and a hat.' WHERE id = 'madagui' AND chi_tiet IS NULL;

-- Vườn quốc gia Cát Tiên: nằm trên ba tỉnh cũ (Đồng Nai, Lâm Đồng, Bình Phước), cổng chính
-- và trung tâm du khách ở phía Đồng Nai, toạ độ là tâm vườn theo OpenStreetMap.
INSERT IGNORE INTO dia_diem (id, ten, ten_en, loai, mo_ta, mo_ta_en, dia_chi, lat, lng, vung, noi_bat, hien, da_kiem_tra, nguon) VALUES
  ('vqg-cat-tien', 'Vườn quốc gia Cát Tiên', 'Cat Tien National Park', 'thien-nhien',
   'Vườn quốc gia ở vùng giáp ranh Lâm Đồng và Đồng Nai, một trong những khu rừng nhiệt đới đất thấp lớn nhất còn lại ở phía Nam. Hợp đi bộ xuyên rừng, đạp xe, ngắm chim và thú hoang dã. Cổng chính ở phía Đồng Nai.',
   'National park on the border of Lam Dong and Dong Nai, one of the largest remaining lowland tropical forests in the south. Good for forest hikes, cycling and watching birds and wildlife. The main gate is on the Dong Nai side.',
   'Vùng giáp ranh Lâm Đồng – Đồng Nai (cổng chính: xã Đak Lua, Đồng Nai)', 11.4547262, 107.3197806, NULL, FALSE, TRUE, FALSE, 'Toạ độ: OpenStreetMap relation 7090891 (tâm vườn). Tên điểm: mia.vn, Traveloka.');
UPDATE dia_diem SET chi_tiet = '## Giới thiệu
Vườn quốc gia Cát Tiên trải trên vùng giáp ranh Đồng Nai, Lâm Đồng và Bình Phước cũ, là một trong những khu rừng nhiệt đới đất thấp lớn nhất còn lại ở phía Nam. Rừng có nhiều loài thú lớn, chim và cây gỗ quý, cùng hệ thống bàu nước ngập theo mùa.

Phần thuộc Lâm Đồng là khu Cát Lộc. Cổng chính, trung tâm du khách và nơi lưu trú của vườn nằm ở phía Đồng Nai, đi phà qua sông Đồng Nai.

## Lịch sử hình thành
- 1992: Thành lập Vườn quốc gia Cát Tiên trên cơ sở hợp nhất các khu Nam Cát Tiên, Tây Cát Tiên và Cát Lộc.
- 2001: UNESCO công nhận Khu dự trữ sinh quyển thế giới Đồng Nai, trong đó có Cát Tiên (lúc đầu mang tên Cát Tiên).
- 2005: Vùng đất ngập nước Bàu Sấu được công nhận là khu Ramsar.
- Ngày nay: Điểm du lịch sinh thái, nghiên cứu và bảo tồn động vật hoang dã.

## Có gì để xem
- Đi bộ xuyên rừng, ngắm những cây cổ thụ lớn.
- Bàu Sấu, vùng đất ngập nước nổi tiếng với cá sấu và chim nước.
- Đạp xe trong rừng, xem thú hoang dã vào ban đêm theo tour của vườn.

## Kinh nghiệm
- Đăng ký tour và người dẫn đường với vườn quốc gia, nhất là tuyến Bàu Sấu.
- Mang quần áo dài, thuốc chống côn trùng và đề phòng vắt vào mùa mưa.
- Không cho thú ăn, không mang động vật, thực vật ra khỏi rừng.', chi_tiet_en = '## About
Cat Tien National Park spans the border of the former Dong Nai, Lam Dong and Binh Phuoc provinces and is one of the largest remaining lowland tropical forests in the south. It shelters large mammals, birds and valuable trees, along with seasonally flooded wetlands.

The Lam Dong part is the Cat Loc sector. The main gate, visitor centre and lodging are on the Dong Nai side, reached by ferry across the Dong Nai river.

## Timeline
- 1992: Cat Tien National Park is formed by merging the Nam Cat Tien, Tay Cat Tien and Cat Loc areas.
- 2001: UNESCO recognises the Dong Nai World Biosphere Reserve, which includes Cat Tien (first named after it).
- 2005: The Bau Sau wetland is designated a Ramsar site.
- Today: A centre for eco-tourism, research and wildlife conservation.

## What to see
- Forest hikes among giant old trees.
- Bau Sau (Crocodile Lake), a wetland known for crocodiles and waterbirds.
- Cycling in the forest and night wildlife tours run by the park.

## Tips
- Book tours and a guide with the park, especially for Bau Sau.
- Wear long clothes, bring insect repellent and watch for leeches in the rainy season.
- Do not feed animals or take plants or animals out of the forest.' WHERE id = 'vqg-cat-tien' AND chi_tiet IS NULL;

-- Bổ sung 2 điểm ở Đà Lạt (để gắn ảnh quảng trường và máng trượt).
INSERT IGNORE INTO dia_diem (id, ten, ten_en, loai, mo_ta, mo_ta_en, dia_chi, lat, lng, vung, noi_bat, hien, da_kiem_tra, nguon) VALUES
  ('quang-truong-lam-vien', 'Quảng trường Lâm Viên', 'Lam Vien Square', 'vui-choi',
   'Quảng trường lớn bên hồ Xuân Hương, nổi bật với khối kính hình nụ hoa atiso và bông hoa dã quỳ khổng lồ. Nơi diễn ra nhiều sự kiện lớn của Đà Lạt, trong đó có lễ khai mạc Festival Hoa.',
   'A large square by Xuan Huong Lake, known for its giant glass artichoke bud and wild sunflower structures. Many of Da Lat''s big events are held here, including the Flower Festival opening.',
   'Đường Trần Quốc Toản, phường Xuân Hương – Đà Lạt, tỉnh Lâm Đồng', 11.9388409, 108.4450134, 'cao-nguyen', FALSE, TRUE, FALSE, 'Toạ độ: OpenStreetMap way 1303837487.'),
  ('thac-datanla', 'Thác Datanla', 'Datanla Waterfall', 'vui-choi',
   'Thác nước trong rừng thông cách trung tâm Đà Lạt khoảng 5 km theo hướng đèo Prenn. Có máng trượt xuyên rừng đưa khách xuống chân thác cùng nhiều hoạt động phiêu lưu ngoài trời.',
   'A waterfall in the pine forest about 5 km from central Da Lat towards Prenn Pass. A forest alpine coaster takes visitors down to the falls, with other outdoor adventure activities.',
   'Quốc lộ 20, đèo Prenn, phường Xuân Hương – Đà Lạt, tỉnh Lâm Đồng', 11.9011774, 108.4488444, 'cao-nguyen', FALSE, TRUE, FALSE, 'Toạ độ: OpenStreetMap node 4502225092.');
UPDATE dia_diem SET chi_tiet = '## Giới thiệu
Quảng trường Lâm Viên nằm bên bờ hồ Xuân Hương, ngay trung tâm Đà Lạt. Điểm nhấn là hai công trình kính màu: khối hình nụ hoa atiso và bông hoa dã quỳ khổng lồ, hai biểu tượng gắn với Đà Lạt.

Quảng trường rộng, thoáng, nhìn ra mặt hồ, là nơi tổ chức nhiều sự kiện lớn của thành phố như lễ khai mạc Festival Hoa, chương trình chào năm mới và các đêm nhạc.

## Lịch sử hình thành
- Thập niên 2010: Quảng trường được xây dựng và đưa vào sử dụng. (Năm khánh thành cụ thể: cán bộ bổ sung.)
- Ngày nay: Không gian sinh hoạt cộng đồng và tổ chức sự kiện của Đà Lạt.

## Có gì để xem
- Khối kính nụ hoa atiso và bông hoa dã quỳ, đẹp khi lên đèn buổi tối.
- Toàn cảnh hồ Xuân Hương nhìn từ quảng trường.
- Các sự kiện, lễ hội diễn ra thường xuyên, nhất là dịp Festival Hoa.

## Kinh nghiệm
- Buổi tối gió từ hồ thổi vào rất lạnh, nên mang áo ấm.
- Dịp lễ hội rất đông, nên đi bộ từ khu trung tâm thay vì đi xe.
- Có thể ghép với hồ Xuân Hương và chợ Đà Lạt trong một buổi.', chi_tiet_en = '## About
Lam Vien Square sits on the shore of Xuan Huong Lake in the heart of Da Lat. Its landmarks are two coloured-glass structures: a giant artichoke bud and a giant wild sunflower, both symbols of Da Lat.

The wide, open square faces the lake and hosts many of the city''s big events, such as the Flower Festival opening, New Year celebrations and concerts.

## Timeline
- 2010s: The square is built and opened. (Exact opening year: to be added by staff.)
- Today: Da Lat''s main public space for gatherings and events.

## What to see
- The glass artichoke and wild sunflower, best when lit at night.
- The view over Xuan Huong Lake.
- Frequent events and festivals, especially during the Flower Festival.

## Tips
- Evenings are cold with wind off the lake: bring a jacket.
- Festivals get very crowded, so walk in from the centre rather than drive.
- Easy to combine with Xuan Huong Lake and Da Lat market.' WHERE id = 'quang-truong-lam-vien' AND chi_tiet IS NULL;
UPDATE dia_diem SET chi_tiet = '## Giới thiệu
Thác Datanla nằm trong rừng thông bên đèo Prenn, cách trung tâm Đà Lạt khoảng 5 km. Tên thác được cho là bắt nguồn từ tiếng K''Ho, gắn với dòng nước chảy dưới tán lá rừng.

Khu thác nổi tiếng với máng trượt xuyên rừng đưa khách từ trên đồi xuống chân thác, cùng nhiều hoạt động phiêu lưu ngoài trời.

## Lịch sử hình thành
- Xưa: Vùng suối thác của đồng bào K''Ho, gắn với truyền thuyết địa phương.
- Ngày nay: Khu du lịch có máng trượt, cáp treo và các trò chơi mạo hiểm. (Năm đưa máng trượt vào hoạt động: cán bộ bổ sung.)

## Có gì để xem
- Đi máng trượt xuyên rừng thông xuống chân thác.
- Dòng thác chảy qua các tầng đá giữa rừng.
- Các hoạt động phiêu lưu như vượt thác, đu dây (theo dịch vụ của khu du lịch).

## Kinh nghiệm
- Ngồi máng trượt theo đúng hướng dẫn, giữ khoảng cách với xe phía trước.
- Trẻ nhỏ, người có bệnh tim mạch nên hỏi nhân viên trước khi chơi.
- Đường đi bộ xuống thác có nhiều bậc, mang giày đế bám.', chi_tiet_en = '## About
Datanla Waterfall lies in the pine forest by Prenn Pass, about 5 km from central Da Lat. Its name is said to come from the K''Ho language, referring to water flowing under the forest leaves.

The area is known for its forest alpine coaster that carries visitors from the hilltop down to the falls, along with other outdoor adventures.

## Timeline
- Long ago: A stream and waterfall of the K''Ho people, tied to local legend.
- Today: A tourist area with an alpine coaster, cable car and adventure activities. (Year the coaster opened: to be added by staff.)

## What to see
- The alpine coaster ride through the pines to the falls.
- The water cascading over rock tiers in the forest.
- Adventure activities such as canyoning and ziplines (run by the tourist area).

## Tips
- Ride the coaster as instructed and keep your distance from the car ahead.
- Young children and people with heart conditions should check with staff first.
- The walking path to the falls has many steps: wear shoes with good grip.' WHERE id = 'thac-datanla' AND chi_tiet IS NULL;
