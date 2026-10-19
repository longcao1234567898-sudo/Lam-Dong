-- Nâng cấp cho trang Ưu đãi và Lịch sự kiện (19/10/2026). Chạy lại nhiều lần không sao.
-- 1. Thêm cột vung cho tin tức: cán bộ gắn ưu đãi, sự kiện với một vùng (không bắt buộc),
--    để người dân lọc theo vùng. Tin có gắn địa điểm thì lấy luôn vùng của địa điểm.
-- 2. Loại tin mới 'uu-dai' (cột loai là chữ, không cần đổi kiểu cột).
-- 3. Chuyển 2 ưu đãi đã nạp trong tệp nap-tin-thang-10-2026.sql sang loại ưu đãi.
SET @co := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tin_tuc' AND COLUMN_NAME = 'vung');
SET @lenh := IF(@co = 0, 'ALTER TABLE tin_tuc ADD COLUMN vung ENUM(''cao-nguyen'',''bien-dao'',''dai-ngan'') NULL COMMENT ''Vùng của ưu đãi, sự kiện (không bắt buộc)'' AFTER dia_diem_id', 'DO 0');
PREPARE lenh FROM @lenh; EXECUTE lenh; DEALLOCATE PREPARE lenh;

UPDATE tin_tuc SET loai = 'uu-dai'
WHERE loai = 'thong-bao' AND tieu_de IN (
  'Người dân Lâm Đồng được giảm đến 40% vé tàu Đà Lạt – Trại Mát',
  'Lâu đài Rượu vang Phan Thiết: giá ưu đãi 120.000 đồng cho người dân Lâm Đồng');
UPDATE tin_tuc SET vung = 'bien-dao' WHERE vung IS NULL AND tieu_de = 'Lâu đài Rượu vang Phan Thiết: giá ưu đãi 120.000 đồng cho người dân Lâm Đồng';
UPDATE tin_tuc SET vung = 'bien-dao' WHERE vung IS NULL AND tieu_de = 'Lễ hội Văn hoá – Du lịch Dinh Thầy Thím 2026';
