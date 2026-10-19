-- Nạp 5 tin du lịch mới (soạn ngày 19/10/2026), CHỈ NỘI DUNG, chưa có ảnh.
-- Nguồn: lamdongtourism.com.vn (Trung tâm Xúc tiến Đầu tư, Thương mại và Du lịch tỉnh Lâm Đồng).
-- Nội dung đã viết lại ngắn gọn, đường dẫn bài gốc ở cột lien_ket (nút "Xem nguồn tin").
-- Ảnh: vào Quản trị > Tin tức, sự kiện, ưu đãi > Sửa từng tin > Thêm ảnh.
-- Chạy lại nhiều lần không bị trùng (bỏ qua tin đã có cùng tiêu đề).

INSERT INTO tin_tuc (loai, tieu_de, tieu_de_en, noi_dung, noi_dung_en, tu_ngay, den_ngay, dia_diem_id, hien, noi_bat, lien_ket, thu_tu)
SELECT * FROM (
  SELECT 'thong-bao' AS loai,
    'Chín tháng năm 2026, Lâm Đồng đón gần 18,5 triệu lượt khách' AS tieu_de,
    'Lam Dong welcomed nearly 18.5 million visitors in the first nine months of 2026' AS tieu_de_en,
    'Theo Cục Thống kê tỉnh, 9 tháng năm 2026 du lịch Lâm Đồng ước đón gần 18,5 triệu lượt khách, trong đó gần 1,1 triệu lượt khách quốc tế. Doanh thu du lịch đạt trên 51.263 tỷ đồng. Riêng tháng 9 đón gần 2,2 triệu lượt khách, tăng gần 31% so với cùng kỳ năm trước. Từ nay đến cuối năm còn nhiều sự kiện như Lễ hội Katê, Lễ hội Dinh Thầy Thím và Festival Hoa Đà Lạt lần thứ XI.' AS noi_dung,
    'According to the provincial statistics office, Lam Dong welcomed nearly 18.5 million visitors in the first nine months of 2026, including almost 1.1 million international visitors, with tourism revenue above 51,263 billion VND. September alone saw nearly 2.2 million visitors, up about 31% year on year.' AS noi_dung_en,
    NULL AS tu_ngay, NULL AS den_ngay, NULL AS dia_diem_id, TRUE AS hien, FALSE AS noi_bat,
    'https://lamdongtourism.com.vn/article/view/trong-9-thang-lam-dong-don-tren-185-trieu-luot-khach-14234.html' AS lien_ket, 40 AS thu_tu
  UNION ALL SELECT 'thong-bao',
    'Khai mạc Lễ hội Katê năm 2026 tại tháp Pô Sah Inư',
    'Kate Festival 2026 opens at Po Sah Inu towers',
    'Sáng 10/10/2026 (1/7 Chăm lịch), Lễ hội Katê của đồng bào Chăm theo đạo Bàlamôn khai mạc tại di tích tháp Pô Sah Inư, phường Phú Thủy. Lễ hội tưởng nhớ các vị vua, tiền nhân, cầu mưa thuận gió hòa, mùa màng bội thu. Nghi thức quan trọng nhất là lễ rước y trang Nữ thần Pô Sah Inư từ sân lễ lên tháp chính, cùng các tiết mục múa quạt, vũ điệu Katê thu hút đông người dân và du khách.',
    'On 10 October 2026, the Kate Festival of the Brahmanist Cham community opened at the Po Sah Inu towers in Phu Thuy ward. The highlight is the procession of the costume of Goddess Po Sah Inu to the main tower, with fan dances and traditional Kate performances.',
    NULL, NULL, 'thap-po-sah-inu', TRUE, FALSE,
    'https://lamdongtourism.com.vn/article/view/nhung-sac-mau-truyen-thong-trong-le-hoi-kate-nam-2026-14238.html', 41
  UNION ALL SELECT 'thong-bao',
    'Hội thi trang trí lễ vật dâng cúng Nữ thần Pô Sah Inư',
    'Offering decoration contest for Goddess Po Sah Inu',
    'Chiều 9/10/2026, tại khuôn viên tháp Pô Sah Inư diễn ra Hội thi trang trí lễ vật trên Thônla và Cổ bồng dâng cúng Nữ thần Pô Sah Inư, nằm trong Lễ hội Katê. 9 đội từ các xã có đông đồng bào Chăm khu vực Đông Lâm Đồng tham gia, mỗi đội có 45 phút để hoàn thành. Đội xã Hàm Thuận đoạt giải nhất. Hội thi góp phần giới thiệu và trao truyền nghi thức truyền thống cho thế hệ sau.',
    'On 9 October 2026, nine teams from Cham communities competed in decorating ritual offerings on Thonla and Co bong trays for Goddess Po Sah Inu, as part of the Kate Festival. Ham Thuan commune won first prize.',
    NULL, NULL, 'thap-po-sah-inu', TRUE, FALSE,
    'https://lamdongtourism.com.vn/article/view/hoi-thi-trang-tri-le-vat-dang-cung-nu-than-po-sah-inu-14237.html', 42
  UNION ALL SELECT 'thong-bao',
    'Lâm Đồng kết nối đầu tư, thương mại, du lịch với Hàn Quốc',
    'Lam Dong connects investment, trade and tourism with Korea',
    'Từ ngày 6 đến 9/10/2026, đoàn công tác Hàn Quốc gồm 16 đại biểu của tỉnh Gyeonggi-do, thành phố Goyang, Anyang và Hiệp hội doanh nhân và đầu tư Việt Nam - Hàn Quốc đã khảo sát các điểm du lịch, vùng thanh long và khu công nghiệp ở Đông Lâm Đồng, làm việc tại Đà Lạt. Hai bên bàn hướng xây dựng sản phẩm du lịch dành cho khách Hàn Quốc theo chuỗi Đà Lạt - Mũi Né, du lịch golf, nghỉ dưỡng, MICE và từng bước khôi phục đường bay trực tiếp Hàn Quốc - Liên Khương.',
    'From 6 to 9 October 2026, a 16-member delegation from Gyeonggi-do, Goyang, Anyang and the Vietnam-Korea business association visited Lam Dong. Both sides discussed Da Lat - Mui Ne products for Korean visitors, golf, resorts, MICE and restoring direct flights between Korea and Lien Khuong airport.',
    NULL, NULL, NULL, TRUE, FALSE,
    'https://lamdongtourism.com.vn/article/view/ket-noi-giao-thuong-thuc-day-dau-tu-thuong-mai-du-lich-giua-tinh-lam-dong-va-han-quoc-14236.html', 43
  UNION ALL SELECT 'thong-bao',
    'Lâm Đồng giới thiệu "Hành trình của Biển, Hoa và Đại ngàn" tại Hà Nội',
    'Lam Dong presents "A journey of Sea, Flowers and Forests" in Hanoi',
    'Chiều 11/8/2026, tỉnh Lâm Đồng tổ chức Hội nghị quảng bá, xúc tiến du lịch tại Hà Nội với hơn 300 đại biểu. Hội nghị giới thiệu hình ảnh Lâm Đồng mới với ba thế mạnh: biển đảo, hoa và cao nguyên, đại ngàn. Cùng với đó là các chương trình kích cầu, Festival Hoa Đà Lạt lần thứ XI và việc Cảng hàng không quốc tế Liên Khương hoạt động trở lại từ ngày 19/8/2026.',
    'On 11 August 2026, Lam Dong held a tourism promotion conference in Hanoi with over 300 delegates, presenting the new province as a journey of sea, flowers and forests, along with stimulus programmes, the 11th Da Lat Flower Festival and the reopening of Lien Khuong international airport on 19 August.',
    NULL, NULL, NULL, TRUE, FALSE,
    'https://lamdongtourism.com.vn/article/view/lam-dong-gioi-thieu-hanh-trinh-bien-hoa-va-dai-ngan-tai-ha-noi-14202.html', 44
) AS moi
WHERE NOT EXISTS (SELECT 1 FROM tin_tuc t WHERE t.tieu_de = moi.tieu_de);
