-- Nạp tin, sự kiện sắp diễn ra (soạn ngày 19/10/2026).
-- Nguồn: lamdongtourism.com.vn (Trung tâm Xúc tiến Đầu tư, Thương mại và Du lịch tỉnh Lâm Đồng)
-- và VietnamPlus. Nội dung đã viết lại, có đường dẫn bài gốc ở cột lien_ket.
-- Ngày ghi "dự kiến" theo nguồn: đối chiếu thông báo chính thức trước khi đăng.
-- Chạy lại nhiều lần không bị trùng (bỏ qua tin đã có cùng tiêu đề).
-- Hết ngày ở den_ngay thì tin tự thôi hiện.

INSERT INTO tin_tuc (loai, tieu_de, tieu_de_en, noi_dung, noi_dung_en, tu_ngay, den_ngay, dia_diem_id, hien, noi_bat, lien_ket, thu_tu)
SELECT * FROM (
  SELECT 'su-kien' AS loai,
    'Lễ hội Văn hoá – Du lịch Dinh Thầy Thím 2026' AS tieu_de,
    'Dinh Thay Thim Culture and Tourism Festival 2026' AS tieu_de_en,
    'Từ 23 đến 25/10/2026 (14–16/9 âm lịch) tại di tích Dinh Thầy Thím, xã Tân Hải. Phần lễ gồm nghinh thần, rước sắc phong, dâng hương, dâng cỗ bánh, giỗ Tiền hiền và Chánh lễ. Phần hội (dự kiến) có triển lãm mô hình sự tích Thầy Thím, thi đấu thể thao, trò chơi dân gian miền biển, múa lân – sư – rồng và ca múa nhạc dân tộc. Gần đó có thể ghé ghềnh Tam Tân, Dốc Ông Bằng và biển Cam Bình.' AS noi_dung,
    'From 23 to 25 October 2026 (14–16 of the 9th lunar month) at the Dinh Thay Thim relic site, Tan Hai commune. Traditional rites, plus a planned programme of a story exhibition, sports, coastal folk games, lion and dragon dances and ethnic music. Nearby: Tam Tan rocks, Ong Bang slope and Cam Binh beach.' AS noi_dung_en,
    '2026-10-23' AS tu_ngay, '2026-10-25' AS den_ngay, NULL AS dia_diem_id, TRUE AS hien, TRUE AS noi_bat,
    'https://lamdongtourism.com.vn/article/view/le-hoi-van-hoa-du-lich-dinh-thay-thim-2026-dien-ra-tu-23-2510-14233.html' AS lien_ket, 10 AS thu_tu
  UNION ALL SELECT 'su-kien',
    'Festival Âm nhạc quốc tế Lang Biang 2026',
    'Lang Biang International Music Festival 2026',
    'Dự kiến từ 13 đến 15/11/2026 tại Quảng trường Lâm Viên, Đà Lạt Opera House và một số di tích ở trung tâm Đà Lạt. Âm nhạc đương đại kết hợp âm nhạc quốc tế, kèm hội thảo về các thành phố sáng tạo âm nhạc. Nằm trong chuỗi hoạt động hưởng ứng Ngày Văn hoá Việt Nam năm 2026.',
    'Planned for 13–15 November 2026 at Lam Vien Square, Da Lat Opera House and heritage sites in central Da Lat: contemporary and international music, with a conference on creative music cities.',
    '2026-11-13', '2026-11-15', NULL, TRUE, FALSE,
    'https://www.vietnamplus.vn/lam-dong-trien-khai-chuoi-hoat-dong-huong-ung-ngay-van-hoa-viet-nam-nam-2026-post1139480.vnp', 20
  UNION ALL SELECT 'su-kien',
    'Festival Hoa Đà Lạt lần thứ XI – "Đà Lạt – Bản giao hòa của sắc hoa và âm nhạc"',
    'The 11th Da Lat Flower Festival',
    'Dự kiến khai mạc tối 19/12/2026 tại Quảng trường Lâm Viên, bế mạc tối 31/12/2026 kết hợp chương trình chào năm mới 2027. Gồm 11 chương trình chính và 25 chương trình hưởng ứng, không gian hoa quanh hồ Xuân Hương. Năm nay có hoạt động ở cả ba khu vực của tỉnh, trong đó có Phan Thiết và Gia Nghĩa.',
    'Planned opening on the evening of 19 December 2026 at Lam Vien Square. Closing with the New Year 2027 celebration on 31 December. 11 main and 25 side programmes, with flower displays around Xuan Huong Lake and events across the province, including Phan Thiet and Gia Nghia.',
    '2026-12-19', '2026-12-31', 'ho-xuan-huong', TRUE, TRUE,
    'https://www.vietnamplus.vn/lam-dong-quang-ba-du-lich-thu-hut-du-khach-qua-festival-hoa-da-lat-2026-post1135871.vnp', 30
  UNION ALL SELECT 'thong-bao',
    'Người dân Lâm Đồng được giảm đến 40% vé tàu Đà Lạt – Trại Mát',
    'Up to 40% off the Da Lat – Trai Mat train for Lam Dong residents',
    'Chương trình "Người Lâm Đồng đi du lịch Lâm Đồng": người thường trú tại tỉnh Lâm Đồng (mới) được giảm đến 40% giá vé tàu Đà Lạt – Trại Mát (giá thường 113.000–124.000 đồng tuỳ loại ghế). Mua vé trực tiếp tại Ga Đà Lạt, số 1 Quang Trung, xuất trình CCCD hoặc VNeID. Áp dụng đến hết 31/10/2026.',
    'Residents of Lam Dong province get up to 40% off the Da Lat – Trai Mat heritage train (regular fare 113,000–124,000 VND). Buy at Da Lat Station, 1 Quang Trung, showing ID or VNeID. Until 31 October 2026.',
    '2026-09-25', '2026-10-31', 'ga-da-lat', TRUE, FALSE,
    'https://lamdongtourism.com.vn/article/view/doanh-nghiep-huong-ung-chuong-trinh-nguoi-lam-dong-du-lich-lam-dong-14232.html', 40
  UNION ALL SELECT 'thong-bao',
    'Lâu đài Rượu vang Phan Thiết: giá ưu đãi 120.000 đồng cho người dân Lâm Đồng',
    'Phan Thiet Wine Castle: 120,000 VND entry for Lam Dong residents',
    'Khách có địa chỉ tại Lâm Đồng, Bình Thuận hoặc Đắk Nông cũ tham quan Lâu đài Rượu vang (Sea Links City, đường Võ Nguyên Giáp, phường Phú Thuỷ) với giá 120.000 đồng/khách thay vì 145.000 đồng (đã gồm phí phục vụ và VAT). Xuất trình CCCD hoặc giấy tờ có địa chỉ khi mua vé. Áp dụng đến hết 31/12/2026.',
    'Visitors with an address in Lam Dong (including former Binh Thuan and Dak Nong) pay 120,000 VND instead of 145,000 VND at the Wine Castle, Sea Links City, Phu Thuy ward. Show ID with your address. Until 31 December 2026.',
    '2026-09-25', '2026-12-31', NULL, TRUE, FALSE,
    'https://lamdongtourism.com.vn/article/view/doanh-nghiep-huong-ung-chuong-trinh-nguoi-lam-dong-du-lich-lam-dong-14232.html', 50
) AS moi
WHERE NOT EXISTS (SELECT 1 FROM tin_tuc t WHERE t.tieu_de = moi.tieu_de);
