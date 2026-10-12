-- ============================================================================
-- DU LỊCH LÂM ĐỒNG — TOÀN BỘ CƠ SỞ DỮ LIỆU
-- ============================================================================
--
-- Tỉnh Lâm Đồng từ ngày 1/7/2025 gồm tỉnh Lâm Đồng, tỉnh Đắk Nông và tỉnh
-- Bình Thuận cũ hợp nhất lại: cao nguyên Đà Lạt, vùng biển Phan Thiết - Mũi
-- Né, đảo Phú Quý và đại ngàn Đắk Nông.
--
-- Ba bảng staff, refresh_tokens, staff_activity_logs giữ ĐÚNG cấu trúc của
-- Điểm Chạm An Ninh, để dùng lại nguyên phần đăng nhập cán bộ đã kiểm chứng
-- (bcrypt, JWT, đếm sai, khoá tạm, xác minh Turnstile).
--
-- CHẠY: HeidiSQL -> bấm chọn cơ sở dữ liệu (Aiven: defaultdb) ở cột bên trái
--       -> Tệp -> Chạy tệp SQL... -> chọn tệp này. KHÔNG dán vào ô truy vấn.
--       Không chạy tay cũng được: máy chủ Render tự tạo bảng khi khởi động.
--       Tạo tài khoản cán bộ bằng cong-cu/tao-tai-khoan.html (xem README),
--       KHÔNG có tài khoản mặc định.
--
-- CHẠY LẠI ĐƯỢC NHIỀU LẦN: mọi lệnh đều "nếu chưa có thì tạo", nên khi kho mã
-- có phiên bản mới, cứ chạy lại tệp này là cơ sở dữ liệu được nâng cấp tại
-- chỗ — KHÔNG mất số liệu đã nhập.
-- ============================================================================

/* Khai bộ mã ngay đầu tệp: HeidiSQL tự dùng utf8mb4, nhưng nạp bằng công cụ
   dòng lệnh (mysql < tệp.sql) thì mặc định latin1 -> chữ tiếng Việt vỡ thành
   "thÃ¡ng" ngay trong cơ sở dữ liệu. */
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

/* Không có lệnh CREATE DATABASE / USE: tệp chạy trong cơ sở dữ liệu đang chọn
   (Aiven: defaultdb), đúng cơ sở máy chủ dùng ở biến DB_NAME. */

-- ---------------------------------------------------------------- CÁN BỘ
CREATE TABLE IF NOT EXISTS staff (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  full_name       VARCHAR(100) NOT NULL,
  username        VARCHAR(50)  NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  email           VARCHAR(100),
  phone           VARCHAR(20),
  role            ENUM('admin','manager','handler') NOT NULL DEFAULT 'handler'
                  COMMENT 'admin: quản trị · manager: chỉ huy · handler: cán bộ nhập liệu',
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  failed_attempts INT NOT NULL DEFAULT 0 COMMENT 'Số lần nhập sai liên tiếp — từ 3 bắt xác minh',
  locked_until    DATETIME NULL       COMMENT 'Tạm khoá do nhập sai nhiều lần',
  last_login      DATETIME NULL,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  staff_id    INT NOT NULL,
  token_hash  CHAR(64) NOT NULL UNIQUE COMMENT 'SHA-256 của refresh token, không lưu token thô',
  revoked     BOOLEAN DEFAULT FALSE,
  expires_at  DATETIME NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
  INDEX idx_token_hash (token_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- staff_id cho phép rỗng (khác bản gốc) để ghi được cả lần đăng nhập sai,
-- khi chưa biết là cán bộ nào.
CREATE TABLE IF NOT EXISTS staff_activity_logs (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  staff_id    INT NULL,
  action      VARCHAR(64) NOT NULL,
  target_type VARCHAR(50),
  target_id   VARCHAR(80),
  details     JSON,
  ip_address  VARCHAR(45),
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL,
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------- ĐỊA ĐIỂM
CREATE TABLE IF NOT EXISTS dia_diem (
  id           VARCHAR(80) PRIMARY KEY COMMENT 'Mã không dấu, ví dụ ho-xuan-huong',
  ten          VARCHAR(120) NOT NULL,
  loai         ENUM('thien-nhien','di-tich','vui-choi','luu-tru','am-thuc','dac-san') NOT NULL DEFAULT 'thien-nhien',
  mo_ta        TEXT,
  dia_chi      VARCHAR(200),
  lat          DECIMAL(10,7) NOT NULL,
  lng          DECIMAL(10,7) NOT NULL,
  sdt          VARCHAR(20),
  web          VARCHAR(200),
  gio_mo       VARCHAR(80),
  noi_bat      BOOLEAN NOT NULL DEFAULT FALSE,
  hien         BOOLEAN NOT NULL DEFAULT TRUE  COMMENT 'Ẩn thay vì xoá, để còn tra lại',
  da_kiem_tra  BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Cán bộ đã đối chiếu nguồn chính thức',
  nguon        VARCHAR(200),
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_hien (hien, loai)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------- LƯỢT KHÁCH
CREATE TABLE IF NOT EXISTS luot_khach (
  id           BIGINT PRIMARY KEY AUTO_INCREMENT,
  dia_diem_id  VARCHAR(80) NOT NULL,
  thang        CHAR(7) NOT NULL COMMENT 'YYYY-MM',
  noi_dia      INT UNSIGNED NOT NULL DEFAULT 0,
  quoc_te      INT UNSIGNED NOT NULL DEFAULT 0,
  nguoi_nhap   INT NULL,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_diem_thang (dia_diem_id, thang) COMMENT 'Nhập lại cùng tháng thì ghi đè',
  FOREIGN KEY (dia_diem_id) REFERENCES dia_diem(id) ON DELETE CASCADE,
  FOREIGN KEY (nguoi_nhap) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------- ĐÁNH GIÁ
-- Mỗi thiết bị một đánh giá cho mỗi địa điểm (gửi lại thì sửa đánh giá cũ).
-- Không lưu mã thiết bị và địa chỉ IP thô — chỉ lưu bản băm có HASH_PEPPER.
CREATE TABLE IF NOT EXISTS danh_gia (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  dia_diem_id   VARCHAR(80) NOT NULL,
  ma_thiet_bi   CHAR(64) NOT NULL,
  ip_bam        CHAR(64),
  sao           TINYINT UNSIGNED NOT NULL,
  canh_quan     TINYINT UNSIGNED NULL,
  dich_vu       TINYINT UNSIGNED NULL,
  ve_sinh       TINYINT UNSIGNED NULL,
  gia_ca        TINYINT UNSIGNED NULL,
  di_cung       ENUM('gia-dinh','ban-be','cap-doi','mot-minh') NULL,
  thoi_diem     CHAR(7) NULL COMMENT 'Tháng đi, YYYY-MM',
  nhan_xet      VARCHAR(500),
  ten_hien_thi  VARCHAR(40),
  bi_an         BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Cán bộ ẩn đánh giá vi phạm',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_thiet_bi (dia_diem_id, ma_thiet_bi),
  FOREIGN KEY (dia_diem_id) REFERENCES dia_diem(id) ON DELETE CASCADE,
  CHECK (sao BETWEEN 1 AND 5),
  INDEX idx_hien (dia_diem_id, bi_an)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------- 15 ĐIỂM ĐẾN
-- Toạ độ ước lượng theo bản đồ, mô tả tổng hợp: đang ở trạng thái chờ cán bộ
-- kiểm tra (da_kiem_tra = 0). KHÔNG có số điện thoại, giờ mở cửa, giá vé: cán
-- bộ bổ sung từ nguồn chính thức thay vì để thông tin đoán mò.
INSERT IGNORE INTO dia_diem (id, ten, loai, mo_ta, dia_chi, lat, lng, noi_bat, hien, da_kiem_tra, nguon) VALUES
  ('ho-xuan-huong', 'Hồ Xuân Hương', 'thien-nhien', 'Hồ nước hình trăng lưỡi liềm ngay giữa trung tâm Đà Lạt, chu vi khoảng 5 km. Quanh hồ có đường dạo, vườn hoa, đồi cỏ và nhiều quán cà phê, là biểu tượng của thành phố ngàn hoa.', 'Trung tâm Đà Lạt, tỉnh Lâm Đồng', 11.9423, 108.4425, 1, 1, 0, 'Toạ độ: ước lượng, cán bộ chỉnh lại cho đúng cổng vào. Mô tả: tổng hợp, chờ cán bộ xác nhận.'),
  ('ga-da-lat', 'Ga Đà Lạt', 'di-tich', 'Nhà ga xây thời Pháp với ba mái nhọn gợi hình đỉnh núi Langbiang, từng là ga cuối của tuyến đường sắt răng cưa Tháp Chàm - Đà Lạt. Nay có tàu du lịch chạy tới ga Trại Mát.', 'Đường Quang Trung, Đà Lạt, tỉnh Lâm Đồng', 11.9418, 108.4555, 0, 1, 0, 'Toạ độ: ước lượng, cán bộ chỉnh lại cho đúng cổng vào. Mô tả: tổng hợp, chờ cán bộ xác nhận.'),
  ('thien-vien-truc-lam', 'Thiền viện Trúc Lâm và hồ Tuyền Lâm', 'di-tich', 'Thiền viện lớn trên núi Phụng Hoàng, nhìn xuống mặt hồ Tuyền Lâm xanh giữa rừng thông. Có thể đi cáp treo từ đồi Robin xuống, rồi đi thuyền trên hồ.', 'Núi Phụng Hoàng, bên hồ Tuyền Lâm, Đà Lạt, tỉnh Lâm Đồng', 11.9026, 108.4363, 0, 1, 0, 'Toạ độ: ước lượng, cán bộ chỉnh lại cho đúng cổng vào. Mô tả: tổng hợp, chờ cán bộ xác nhận.'),
  ('dinh-bao-dai', 'Dinh Bảo Đại (Dinh III)', 'di-tich', 'Biệt điện nghỉ mát của vua Bảo Đại trên đồi thông, xây trong thập niên 1930. Bên trong còn giữ phòng làm việc, phòng khách, phòng ngủ và nhiều đồ dùng của gia đình nhà vua.', 'Đường Triệu Việt Vương, Đà Lạt, tỉnh Lâm Đồng', 11.9306, 108.4296, 0, 1, 0, 'Toạ độ: ước lượng, cán bộ chỉnh lại cho đúng cổng vào. Mô tả: tổng hợp, chờ cán bộ xác nhận.'),
  ('nui-langbiang', 'Núi Langbiang', 'thien-nhien', 'Ngọn núi cao bậc nhất cao nguyên Lâm Viên, gắn với truyền thuyết tình yêu chàng K''Lang và nàng H''Biang. Leo bộ lên đỉnh hoặc đi xe lên đồi Radar ngắm toàn cảnh Đà Lạt.', 'Phía bắc Đà Lạt (vùng Lạc Dương cũ), tỉnh Lâm Đồng', 12.03, 108.436, 1, 1, 0, 'Toạ độ: ước lượng, cán bộ chỉnh lại cho đúng cổng vào. Mô tả: tổng hợp, chờ cán bộ xác nhận.'),
  ('thac-pongour', 'Thác Pongour', 'thien-nhien', 'Thác nước trải rộng qua nhiều bậc đá, được mệnh danh "Nam thiên đệ nhất thác". Đẹp nhất vào mùa mưa khi nước đổ trắng xoá cả vách đá.', 'Vùng Đức Trọng cũ, cách trung tâm Đà Lạt khoảng 50 km, tỉnh Lâm Đồng', 11.6866, 108.2627, 0, 1, 0, 'Toạ độ: ước lượng, cán bộ chỉnh lại cho đúng cổng vào. Mô tả: tổng hợp, chờ cán bộ xác nhận.'),
  ('doi-cat-mui-ne', 'Đồi cát Mũi Né', 'thien-nhien', 'Đồi cát đỏ ven biển Mũi Né, gió thổi làm đồi đổi hình nên còn gọi là đồi cát bay. Du khách trượt cát, ngắm bình minh và hoàng hôn trên cát.', 'Phường Mũi Né, tỉnh Lâm Đồng', 10.9483, 108.3005, 1, 1, 0, 'Toạ độ: ước lượng, cán bộ chỉnh lại cho đúng cổng vào. Mô tả: tổng hợp, chờ cán bộ xác nhận.'),
  ('bau-trang', 'Bàu Trắng', 'thien-nhien', 'Đồi cát trắng mênh mông bao quanh những hồ nước ngọt, thường được ví là tiểu sa mạc. Có thể đi xe địa hình trên cát và ngắm sen nở trên hồ.', 'Xã Hòa Thắng, tỉnh Lâm Đồng', 11.068, 108.426, 0, 1, 0, 'Toạ độ: ước lượng, cán bộ chỉnh lại cho đúng cổng vào. Mô tả: tổng hợp, chờ cán bộ xác nhận.'),
  ('thap-po-sah-inu', 'Tháp Po Sah Inư', 'di-tich', 'Cụm tháp Chăm cổ trên đồi Bà Nài, dựng khoảng cuối thế kỷ VIII đầu thế kỷ IX. Từ đồi tháp nhìn ra biển và trung tâm Phan Thiết.', 'Đồi Bà Nài, phường Phú Thủy, tỉnh Lâm Đồng', 10.9336, 108.1347, 0, 1, 0, 'Toạ độ: ước lượng, cán bộ chỉnh lại cho đúng cổng vào. Mô tả: tổng hợp, chờ cán bộ xác nhận.'),
  ('hai-dang-ke-ga', 'Hải đăng Kê Gà', 'di-tich', 'Ngọn hải đăng bằng đá do người Pháp xây cuối thế kỷ XIX trên mũi Kê Gà, một trong những hải đăng cổ nhất Việt Nam. Leo bậc thang xoắn lên đỉnh ngắm biển.', 'Mũi Kê Gà, xã Tân Thành, tỉnh Lâm Đồng', 10.696, 107.9944, 0, 1, 0, 'Toạ độ: ước lượng, cán bộ chỉnh lại cho đúng cổng vào. Mô tả: tổng hợp, chờ cán bộ xác nhận.'),
  ('nui-ta-cu', 'Núi Tà Cú', 'thien-nhien', 'Ngọn núi có chùa Linh Sơn Trường Thọ và tượng Phật nằm dài 49 m. Đi cáp treo hoặc leo bộ qua rừng lên chùa.', 'Gần quốc lộ 1, vùng Hàm Thuận Nam cũ, tỉnh Lâm Đồng', 10.816, 107.884, 0, 1, 0, 'Toạ độ: ước lượng, cán bộ chỉnh lại cho đúng cổng vào. Mô tả: tổng hợp, chờ cán bộ xác nhận.'),
  ('dao-phu-quy', 'Đảo Phú Quý', 'thien-nhien', 'Hòn đảo giữa biển khơi, cách Phan Thiết khoảng 120 km, nước biển trong xanh và nhiều rạn san hô. Có lăng Ông Nam Hải thờ cá voi, gành đá và những bãi tắm còn hoang sơ.', 'Đặc khu Phú Quý, tỉnh Lâm Đồng', 10.52, 108.935, 1, 1, 0, 'Toạ độ: ước lượng, cán bộ chỉnh lại cho đúng cổng vào. Mô tả: tổng hợp, chờ cán bộ xác nhận.'),
  ('ho-ta-dung', 'Hồ Tà Đùng', 'thien-nhien', 'Lòng hồ thuỷ điện giữa đại ngàn với hàng chục đảo nhỏ phủ rừng, được ví là vịnh Hạ Long của Tây Nguyên. Đẹp nhất lúc bình minh khi sương phủ mặt hồ.', 'Vùng Đắk Glong cũ, tỉnh Lâm Đồng', 11.867, 107.983, 1, 1, 0, 'Toạ độ: ước lượng, cán bộ chỉnh lại cho đúng cổng vào. Mô tả: tổng hợp, chờ cán bộ xác nhận.'),
  ('thac-dray-sap', 'Thác Dray Sáp', 'thien-nhien', 'Thác nước lớn trên sông Sêrêpốk, tên Dray Sáp nghĩa là thác khói vì bụi nước bay mù mịt. Nằm trong vùng công viên địa chất toàn cầu UNESCO.', 'Trên sông Sêrêpốk, vùng Krông Nô cũ, tỉnh Lâm Đồng', 12.5408, 107.8814, 0, 1, 0, 'Toạ độ: ước lượng, cán bộ chỉnh lại cho đúng cổng vào. Mô tả: tổng hợp, chờ cán bộ xác nhận.'),
  ('hang-dong-nui-lua-krong-no', 'Hang động núi lửa Krông Nô', 'thien-nhien', 'Hệ thống hang động hình thành từ dòng dung nham núi lửa, thuộc loại dài nhất Đông Nam Á. Là điểm nhấn của công viên địa chất toàn cầu UNESCO.', 'Vùng Krông Nô cũ, tỉnh Lâm Đồng', 12.432, 107.835, 0, 1, 0, 'Toạ độ: ước lượng, cán bộ chỉnh lại cho đúng cổng vào. Mô tả: tổng hợp, chờ cán bộ xác nhận.');


-- ============================================================================
-- GIAI ĐOẠN 1 — PHỤ LỤC THỐNG KÊ: XÃ/PHƯỜNG, KỲ BÁO CÁO, NỘP VÀ DUYỆT
-- ============================================================================
-- Phụ lục thống kê báo cáo theo XÃ/PHƯỜNG và theo KỲ (cả năm, 6 tháng...),
-- không theo từng địa điểm. MỘT QUYỀN DUY NHẤT: cán bộ nào có tài khoản cũng
-- nhập, sửa, chốt được số liệu của mọi xã/phường — mọi thao tác đều ghi nhật
-- ký và lịch sử sửa nên vẫn truy được ai làm gì.
--
-- Thêm cột vào bảng đã có bằng "câu lệnh chuẩn bị sẵn" có kiểm tra trước:
-- MySQL 8 không có ADD COLUMN IF NOT EXISTS, làm thế này thì chạy lại tệp bao
-- nhiêu lần cũng không báo lỗi trùng cột.

CREATE TABLE IF NOT EXISTS xa_phuong (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  ten         VARCHAR(80) NOT NULL COMMENT 'Tên không kèm chữ Xã/Phường, ví dụ: Mũi Né',
  loai        ENUM('xa','phuong','dac-khu') NOT NULL DEFAULT 'xa',
  hien        BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Thôi theo dõi thì ẩn chứ không xoá — số liệu cũ vẫn còn',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_ten (loai, ten)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @co := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dia_diem' AND COLUMN_NAME = 'xa_phuong_id');
SET @lenh := IF(@co = 0, 'ALTER TABLE dia_diem ADD COLUMN xa_phuong_id INT NULL AFTER dia_chi, ADD CONSTRAINT fk_dia_diem_xa FOREIGN KEY (xa_phuong_id) REFERENCES xa_phuong(id) ON DELETE SET NULL', 'DO 0');
PREPARE lenh FROM @lenh; EXECUTE lenh; DEALLOCATE PREPARE lenh;

/* routes/auth.js ghi tên đăng nhập đã thử vào cột này mỗi lần đăng nhập sai,
   nhưng bảng chưa từng có cột -> lệnh ghi lỗi và bị bỏ qua, nhật ký mất hết
   dấu vết dò mật khẩu. Thêm cột để ghi được. */
SET @co := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'staff_activity_logs' AND COLUMN_NAME = 'attempted_username');
SET @lenh := IF(@co = 0, 'ALTER TABLE staff_activity_logs ADD COLUMN attempted_username VARCHAR(50) NULL AFTER details', 'DO 0');
PREPARE lenh FROM @lenh; EXECUTE lenh; DEALLOCATE PREPARE lenh;

/* Nạp sẵn các xã/phường có trong phụ lục thống kê và có địa điểm du lịch.
   Danh sách đầy đủ các đơn vị hành chính của tỉnh, cán bộ tự thêm trên web
   (mục Xã/phường) theo văn bản sắp xếp đơn vị hành chính chính thức. */
INSERT IGNORE INTO xa_phuong (ten, loai) VALUES
  ('Hòa Thắng', 'xa'), ('La Gi', 'phuong'), ('Liên Hương', 'xa'), ('Mũi Né', 'phuong'), ('Phan Rí Cửa', 'xa'), ('Phan Thiết', 'phuong'), ('Phú Quý', 'dac-khu'), ('Phước Hội', 'phuong'), ('Sơn Mỹ', 'xa'), ('Tân Hải', 'xa'), ('Tân Thành', 'xa'), ('Tiến Thành', 'phuong'), ('Vĩnh Hảo', 'xa'), ('Phú Thủy', 'phuong');

/* Gắn địa điểm với xã/phường theo địa chỉ. Các điểm chưa chắc tên đơn vị hành
   chính mới (Hồ Xuân Hương, Ga Đà Lạt, Thiền viện Trúc Lâm và hồ Tuyền Lâm, Dinh Bảo Đại (Dinh III), Núi Langbiang, Thác Pongour, Núi Tà Cú, Hồ Tà Đùng, Thác Dray Sáp, Hang động núi lửa Krông Nô) để trống chờ cán bộ chọn. */
UPDATE dia_diem d JOIN xa_phuong x ON
     (x.loai = 'phuong' AND x.ten = 'Mũi Né' AND d.id = 'doi-cat-mui-ne')
  OR (x.loai = 'xa' AND x.ten = 'Hòa Thắng' AND d.id = 'bau-trang')
  OR (x.loai = 'phuong' AND x.ten = 'Phú Thủy' AND d.id = 'thap-po-sah-inu')
  OR (x.loai = 'xa' AND x.ten = 'Tân Thành' AND d.id = 'hai-dang-ke-ga')
  OR (x.loai = 'dac-khu' AND x.ten = 'Phú Quý' AND d.id = 'dao-phu-quy')
SET d.xa_phuong_id = x.id WHERE d.xa_phuong_id IS NULL;

CREATE TABLE IF NOT EXISTS ky_bao_cao (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  ten         VARCHAR(80) NOT NULL COMMENT 'Ví dụ: 6 tháng đầu năm 2026',
  tu_ngay     DATE NOT NULL,
  den_ngay    DATE NOT NULL,
  han_nop     DATE NULL,
  khoa        BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Đã khoá thì không ai sửa được số liệu của kỳ',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_khoang (tu_ngay, den_ngay),
  CHECK (den_ngay >= tu_ngay)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO ky_bao_cao (ten, tu_ngay, den_ngay) VALUES
  ('Năm 2025', '2025-01-01', '2025-12-31'),
  ('6 tháng đầu năm 2026', '2026-01-01', '2026-06-30');

/* Mỗi xã/phường có MỘT báo cáo cho mỗi kỳ: dang-nhap -> da-chot.
   Đã chốt thì không ai sửa được số liệu kỳ đó của xã, muốn sửa phải "mở lại"
   và ghi lý do — để bảng theo dõi biết chắc xã nào đã xong. */
CREATE TABLE IF NOT EXISTS nop_bao_cao (
  ky_id          INT NOT NULL,
  xa_phuong_id   INT NOT NULL,
  trang_thai     ENUM('dang-nhap','da-chot') NOT NULL DEFAULT 'dang-nhap',
  nguoi_chot     INT NULL,
  chot_luc       DATETIME NULL,
  ly_do_mo_lai   VARCHAR(500) NULL COMMENT 'Lý do lần mở lại gần nhất',
  updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (ky_id, xa_phuong_id),
  FOREIGN KEY (ky_id) REFERENCES ky_bao_cao(id) ON DELETE CASCADE,
  FOREIGN KEY (xa_phuong_id) REFERENCES xa_phuong(id) ON DELETE CASCADE,
  FOREIGN KEY (nguoi_chot) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* "Kỳ này không phát sinh" — phân biệt rõ với "chưa nhập". Bản phụ lục giấy
   dùng lẫn "0", "Không" và ô trống cho cùng một ý, đọc không biết xã nào đã
   báo cáo, xã nào bỏ sót. */
CREATE TABLE IF NOT EXISTS khong_phat_sinh (
  ky_id           INT NOT NULL,
  xa_phuong_id    INT NOT NULL,
  bang            VARCHAR(40) NOT NULL,
  nguoi_danh_dau  INT NULL,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (ky_id, xa_phuong_id, bang),
  FOREIGN KEY (ky_id) REFERENCES ky_bao_cao(id) ON DELETE CASCADE,
  FOREIGN KEY (xa_phuong_id) REFERENCES xa_phuong(id) ON DELETE CASCADE,
  FOREIGN KEY (nguoi_danh_dau) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* Lịch sử sửa của mọi bảng phụ lục: ai, lúc nào, giá trị cũ, giá trị mới.
   Xoá cũng chỉ đánh dấu (cột xoa_luc ở từng bảng), khôi phục được. */
CREATE TABLE IF NOT EXISTS lich_su_sua (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  bang          VARCHAR(40) NOT NULL,
  ban_ghi_id    INT NOT NULL,
  xa_phuong_id  INT NULL,
  ky_id         INT NULL,
  staff_id      INT NULL,
  hanh_dong     ENUM('them','sua','xoa','khoi-phuc','nhap-excel') NOT NULL,
  cu            JSON NULL,
  moi           JSON NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ban_ghi (bang, ban_ghi_id),
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------- BẢNG 1: HIỆN TRẠNG KHÁCH DU LỊCH
-- Tổng số khách KHÔNG lưu: luôn tính bằng quốc tế + nội địa, nên không bao
-- giờ lệch (bản phụ lục giấy đã có dòng cộng sai).
CREATE TABLE IF NOT EXISTS bc_khach (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  ky_id         INT NOT NULL,
  xa_phuong_id  INT NOT NULL,
  quoc_te       INT UNSIGNED NOT NULL DEFAULT 0,
  noi_dia       INT UNSIGNED NOT NULL DEFAULT 0,
  nguoi_sua     INT NULL,
  xoa_luc       DATETIME NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_ky_xa (ky_id, xa_phuong_id),
  FOREIGN KEY (ky_id) REFERENCES ky_bao_cao(id) ON DELETE CASCADE,
  FOREIGN KEY (xa_phuong_id) REFERENCES xa_phuong(id) ON DELETE CASCADE,
  FOREIGN KEY (nguoi_sua) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------- BẢNG 2: DỰ ÁN ĐẦU TƯ DU LỊCH
-- Vốn lưu bằng SỐ, đơn vị tỷ đồng — bản giấy ghi lẫn "40 tỉ", "1.854,4 tỷ
-- đồng", "359.9 tỷ" nên không cộng được tổng vốn.
CREATE TABLE IF NOT EXISTS bc_du_an (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  xa_phuong_id  INT NOT NULL,
  ten           VARCHAR(255) NOT NULL,
  dia_chi       VARCHAR(255) NULL,
  nha_dau_tu    VARCHAR(255) NULL,
  quoc_gia      VARCHAR(60) NULL,
  von_ty        DECIMAL(15,3) NULL COMMENT 'Tỷ đồng',
  dien_tich_ha  DECIMAL(12,4) NULL,
  trang_thai    VARCHAR(30) NULL,
  ghi_chu       VARCHAR(500) NULL,
  nguoi_sua     INT NULL,
  xoa_luc       DATETIME NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_xa (xa_phuong_id, xoa_luc),
  FOREIGN KEY (xa_phuong_id) REFERENCES xa_phuong(id),
  FOREIGN KEY (nguoi_sua) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------- BẢNG 3: RESORT, KHU NGHỈ DƯỠNG
CREATE TABLE IF NOT EXISTS bc_luu_tru (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  xa_phuong_id  INT NOT NULL,
  ten           VARCHAR(255) NOT NULL,
  dia_chi       VARCHAR(255) NULL,
  chu_co_so     VARCHAR(120) NULL COMMENT 'Không bao giờ hiện cho người dân',
  hang_sao      TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0 = chưa xếp hạng',
  cong_khai     BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Hiện tên, địa chỉ, hạng sao trên trang người dân',
  nguoi_sua     INT NULL,
  xoa_luc       DATETIME NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_xa (xa_phuong_id, xoa_luc),
  CHECK (hang_sao <= 5),
  FOREIGN KEY (xa_phuong_id) REFERENCES xa_phuong(id),
  FOREIGN KEY (nguoi_sua) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- GIAI ĐOẠN 2 — BẢNG 4 ĐẾN 10 CỦA PHỤ LỤC, XÁC THỰC HAI LỚP
-- ============================================================================
-- Các bảng 4, 7, 8, 9, 10 là thông tin nhạy cảm (vụ việc an ninh, quân số,
-- tôn giáo, vi phạm của người nước ngoài): KHÔNG có đường dẫn công khai nào
-- đọc tới, mỗi lần cán bộ xem hay xuất đều ghi nhật ký.

-- ------------------------------------------- BẢNG 4: VỤ VIỆC PHỨC TẠP VỀ ANTT
CREATE TABLE IF NOT EXISTS bc_vu_viec (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  xa_phuong_id  INT NOT NULL,
  ten           VARCHAR(255) NOT NULL,
  nam           SMALLINT NULL COMMENT 'Năm phát sinh',
  dien_bien     TEXT NULL,
  huong_xu_ly   TEXT NULL,
  ket_qua       VARCHAR(30) NULL COMMENT 'da-xu-ly | dang-xu-ly | phuc-tap',
  ghi_chu       VARCHAR(500) NULL,
  nguoi_sua     INT NULL,
  xoa_luc       DATETIME NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_xa (xa_phuong_id, xoa_luc),
  FOREIGN KEY (xa_phuong_id) REFERENCES xa_phuong(id),
  FOREIGN KEY (nguoi_sua) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------- BẢNG 5: VĂN BẢN PHỐI HỢP LỰC LƯỢNG
CREATE TABLE IF NOT EXISTS bc_phoi_hop (
  id             INT PRIMARY KEY AUTO_INCREMENT,
  xa_phuong_id   INT NOT NULL,
  ten_van_ban    VARCHAR(500) NOT NULL,
  ngay_ban_hanh  DATE NULL,
  tinh_trang     VARCHAR(30) NULL COMMENT 'da-ban-hanh | dang-trinh',
  cac_ben        TEXT NULL,
  noi_dung       TEXT NULL,
  nguoi_sua      INT NULL,
  xoa_luc        DATETIME NULL,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_xa (xa_phuong_id, xoa_luc),
  FOREIGN KEY (xa_phuong_id) REFERENCES xa_phuong(id),
  FOREIGN KEY (nguoi_sua) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------- BẢNG 6: VẬN ĐỘNG QUẦN CHÚNG, MÔ HÌNH
CREATE TABLE IF NOT EXISTS bc_van_dong (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  ky_id         INT NOT NULL,
  xa_phuong_id  INT NOT NULL,
  ten_mo_hinh   VARCHAR(255) NOT NULL COMMENT 'Mô hình hoặc nội dung vận động',
  so_luot       INT UNSIGNED NULL,
  so_nguoi      INT UNSIGNED NULL,
  so_luong      INT UNSIGNED NULL COMMENT 'Số lượng mô hình',
  nguoi_sua     INT NULL,
  xoa_luc       DATETIME NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ky_xa (ky_id, xa_phuong_id, xoa_luc),
  FOREIGN KEY (ky_id) REFERENCES ky_bao_cao(id) ON DELETE CASCADE,
  FOREIGN KEY (xa_phuong_id) REFERENCES xa_phuong(id) ON DELETE CASCADE,
  FOREIGN KEY (nguoi_sua) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------- BẢNG 7: ĐỘI NGŨ CÁN BỘ CÔNG AN XÃ
-- Mỗi tổ một dòng. Máy kiểm: chức vụ, trình độ, chuyên môn, độ tuổi — nhóm
-- nào đã nhập thì cộng lại phải bằng số lượng của tổ.
CREATE TABLE IF NOT EXISTS bc_luc_luong (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  ky_id           INT NOT NULL,
  xa_phuong_id    INT NOT NULL,
  ten_to          VARCHAR(120) NOT NULL,
  so_luong        INT UNSIGNED NOT NULL DEFAULT 0,
  cv_pho_truong   INT UNSIGNED NULL, cv_to_truong INT UNSIGNED NULL, cv_to_pho INT UNSIGNED NULL, cv_can_bo INT UNSIGNED NULL,
  td_tien_si      INT UNSIGNED NULL, td_thac_si INT UNSIGNED NULL, td_dai_hoc INT UNSIGNED NULL, td_cao_dang INT UNSIGNED NULL, td_trung_cap INT UNSIGNED NULL,
  cm_an_ninh      INT UNSIGNED NULL, cm_canh_sat INT UNSIGNED NULL,
  tuoi_duoi_30    INT UNSIGNED NULL, tuoi_30_40 INT UNSIGNED NULL, tuoi_tren_40 INT UNSIGNED NULL,
  nguoi_sua       INT NULL,
  xoa_luc         DATETIME NULL,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ky_xa (ky_id, xa_phuong_id, xoa_luc),
  FOREIGN KEY (ky_id) REFERENCES ky_bao_cao(id) ON DELETE CASCADE,
  FOREIGN KEY (xa_phuong_id) REFERENCES xa_phuong(id) ON DELETE CASCADE,
  FOREIGN KEY (nguoi_sua) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* Tổng quân số công an của xã: một số cho mỗi xã mỗi kỳ, khác tổng các tổ
   (không phải ai cũng thuộc tổ phụ trách du lịch). */
CREATE TABLE IF NOT EXISTS bc_quan_so (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  ky_id         INT NOT NULL,
  xa_phuong_id  INT NOT NULL,
  tong_quan_so  INT UNSIGNED NOT NULL DEFAULT 0,
  nguoi_sua     INT NULL,
  xoa_luc       DATETIME NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_ky_xa (ky_id, xa_phuong_id),
  FOREIGN KEY (ky_id) REFERENCES ky_bao_cao(id) ON DELETE CASCADE,
  FOREIGN KEY (xa_phuong_id) REFERENCES xa_phuong(id) ON DELETE CASCADE,
  FOREIGN KEY (nguoi_sua) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------- BẢNG 8: DÂN CƯ, DÂN TỘC, TÔN GIÁO
CREATE TABLE IF NOT EXISTS bc_dan_cu (
  id               INT PRIMARY KEY AUTO_INCREMENT,
  ky_id            INT NOT NULL,
  xa_phuong_id     INT NOT NULL,
  so_to_thon       INT UNSIGNED NULL,
  dan_so           INT UNSIGNED NULL,
  so_dan_toc       INT UNSIGNED NULL,
  co_so_ton_giao   INT UNSIGNED NULL,
  chuc_sac         INT UNSIGNED NULL,
  tin_do           INT UNSIGNED NULL,
  ghi_chu          VARCHAR(500) NULL,
  nguoi_sua        INT NULL,
  xoa_luc          DATETIME NULL,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_ky_xa (ky_id, xa_phuong_id),
  FOREIGN KEY (ky_id) REFERENCES ky_bao_cao(id) ON DELETE CASCADE,
  FOREIGN KEY (xa_phuong_id) REFERENCES xa_phuong(id) ON DELETE CASCADE,
  FOREIGN KEY (nguoi_sua) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------- BẢNG 9: VI PHẠM CỦA KHÁCH NƯỚC NGOÀI
-- Mỗi vụ một dòng, CÓ QUỐC TỊCH -> bảng 10 (theo quốc tịch) do máy tự tổng
-- hợp từ đây, không nhập hai lần, không bao giờ lệch nhau.
CREATE TABLE IF NOT EXISTS bc_vi_pham (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  xa_phuong_id  INT NOT NULL,
  ngay          DATE NOT NULL,
  loai          VARCHAR(30) NOT NULL COMMENT 'hinh-su | xuat-nhap-canh | trat-tu | khac',
  quoc_tich     VARCHAR(60) NOT NULL,
  so_luot       INT UNSIGNED NOT NULL DEFAULT 1,
  noi_dung      VARCHAR(1000) NULL,
  nguoi_sua     INT NULL,
  xoa_luc       DATETIME NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_xa_ngay (xa_phuong_id, ngay, xoa_luc),
  FOREIGN KEY (xa_phuong_id) REFERENCES xa_phuong(id),
  FOREIGN KEY (nguoi_sua) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------- XÁC THỰC HAI LỚP (TỰ NGUYỆN)
-- Cán bộ tự bật trong "Tài khoản của tôi": sau mật khẩu phải nhập mã 6 số
-- trên điện thoại (Google Authenticator, Microsoft Authenticator...).
SET @co := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'staff' AND COLUMN_NAME = 'totp_bi_mat');
SET @lenh := IF(@co = 0, 'ALTER TABLE staff ADD COLUMN totp_bi_mat VARCHAR(64) NULL, ADD COLUMN totp_bat BOOLEAN NOT NULL DEFAULT FALSE, ADD COLUMN totp_buoc_cuoi BIGINT NULL COMMENT ''Chặn dùng lại mã vừa dùng''', 'DO 0');
PREPARE lenh FROM @lenh; EXECUTE lenh; DEALLOCATE PREPARE lenh;


-- ============================================================================
-- GIAI ĐOẠN 3 — PHÍA NGƯỜI DÂN: LỘ TRÌNH, ẢNH, PHẢN ÁNH, TIN TỨC, TIẾNG ANH
-- ============================================================================

-- ------------------------------------------- TIẾNG ANH CHO ĐỊA ĐIỂM
SET @co := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dia_diem' AND COLUMN_NAME = 'ten_en');
SET @lenh := IF(@co = 0, 'ALTER TABLE dia_diem ADD COLUMN ten_en VARCHAR(120) NULL AFTER ten, ADD COLUMN mo_ta_en TEXT NULL AFTER mo_ta', 'DO 0');
PREPARE lenh FROM @lenh; EXECUTE lenh; DEALLOCATE PREPARE lenh;

UPDATE dia_diem SET ten_en = CASE id
  WHEN 'ho-xuan-huong' THEN 'Xuan Huong Lake'
  WHEN 'ga-da-lat' THEN 'Da Lat Railway Station'
  WHEN 'thien-vien-truc-lam' THEN 'Truc Lam Zen Monastery and Tuyen Lam Lake'
  WHEN 'dinh-bao-dai' THEN 'Bao Dai Summer Palace (Palace III)'
  WHEN 'nui-langbiang' THEN 'Langbiang Mountain'
  WHEN 'thac-pongour' THEN 'Pongour Waterfall'
  WHEN 'doi-cat-mui-ne' THEN 'Mui Ne Sand Dunes'
  WHEN 'bau-trang' THEN 'Bau Trang White Sand Dunes'
  WHEN 'thap-po-sah-inu' THEN 'Po Sah Inu Cham Towers'
  WHEN 'hai-dang-ke-ga' THEN 'Ke Ga Lighthouse'
  WHEN 'nui-ta-cu' THEN 'Ta Cu Mountain'
  WHEN 'dao-phu-quy' THEN 'Phu Quy Island'
  WHEN 'ho-ta-dung' THEN 'Ta Dung Lake'
  WHEN 'thac-dray-sap' THEN 'Dray Sap Waterfall'
  WHEN 'hang-dong-nui-lua-krong-no' THEN 'Krong No Volcanic Caves' END,
mo_ta_en = CASE id
  WHEN 'ho-xuan-huong' THEN 'A crescent-shaped lake right in the centre of Da Lat, about 5 km around. Walking paths, flower gardens, grassy hills and cafes ring the water; it is the symbol of the city of flowers.'
  WHEN 'ga-da-lat' THEN 'A French-era station whose three pointed roofs echo the Langbiang peaks, once the terminus of the Thap Cham - Da Lat cog railway. A tourist train now runs to Trai Mat.'
  WHEN 'thien-vien-truc-lam' THEN 'A large Zen monastery on Phung Hoang hill overlooking the green Tuyen Lam Lake among pine forest. Reach it by cable car from Robin Hill, then take a boat on the lake.'
  WHEN 'dinh-bao-dai' THEN 'The summer residence of Emperor Bao Dai on a pine-covered hill, built in the 1930s. Inside are his office, reception rooms, bedrooms and many of the royal family''s belongings.'
  WHEN 'nui-langbiang' THEN 'One of the highest peaks of the Lam Vien plateau, tied to the love legend of K''Lang and H''Biang. Hike to the summit or ride up to Radar Hill for views over Da Lat.'
  WHEN 'thac-pongour' THEN 'A wide waterfall spilling over many rock terraces, nicknamed "the finest waterfall of the South". Best in the rainy season when water covers the whole rock face.'
  WHEN 'doi-cat-mui-ne' THEN 'Red sand dunes on the Mui Ne coast; the wind keeps reshaping them, hence the name "flying sand dunes". Visitors go sand-sledding and watch sunrise and sunset over the sand.'
  WHEN 'bau-trang' THEN 'Vast white sand dunes around freshwater lakes, often called a miniature desert. Ride a dune buggy over the sand and see lotus blooming on the lake.'
  WHEN 'thap-po-sah-inu' THEN 'Ancient Cham towers on Ba Nai hill, built around the late 8th to early 9th century. The hill looks out over the sea and Phan Thiet.'
  WHEN 'hai-dang-ke-ga' THEN 'A stone lighthouse built by the French in the late 19th century on Ke Ga cape, one of the oldest in Vietnam. Climb the spiral staircase for sea views.'
  WHEN 'nui-ta-cu' THEN 'A mountain with Linh Son Truong Tho Pagoda and a 49-metre reclining Buddha. Take the cable car or hike up through the forest.'
  WHEN 'dao-phu-quy' THEN 'An island far out at sea, about 120 km from Phan Thiet, with clear water and coral reefs. Highlights include the whale temple, rocky headlands and unspoilt beaches.'
  WHEN 'ho-ta-dung' THEN 'A hydropower reservoir in the deep forest dotted with dozens of wooded islets, often called the Ha Long Bay of the Central Highlands. Best at sunrise when mist covers the water.'
  WHEN 'thac-dray-sap' THEN 'A large waterfall on the Srepok River; Dray Sap means "smoky falls" for its clouds of spray. It lies within the UNESCO global geopark area.'
  WHEN 'hang-dong-nui-lua-krong-no' THEN 'A system of caves formed by volcanic lava flows, among the longest in Southeast Asia. A highlight of the UNESCO global geopark.' END
WHERE ten_en IS NULL AND id IN ('ho-xuan-huong', 'ga-da-lat', 'thien-vien-truc-lam', 'dinh-bao-dai', 'nui-langbiang', 'thac-pongour', 'doi-cat-mui-ne', 'bau-trang', 'thap-po-sah-inu', 'hai-dang-ke-ga', 'nui-ta-cu', 'dao-phu-quy', 'ho-ta-dung', 'thac-dray-sap', 'hang-dong-nui-lua-krong-no');

-- ------------------------------------------- LỘ TRÌNH DU LỊCH (cán bộ quản lý)
CREATE TABLE IF NOT EXISTS lich_trinh (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  ten         VARCHAR(120) NOT NULL,
  ten_en      VARCHAR(120) NULL,
  thoi_gian   VARCHAR(40) NULL COMMENT 'Ví dụ: 2 ngày 1 đêm',
  mo_ta       VARCHAR(600) NULL,
  mo_ta_en    VARCHAR(600) NULL,
  hien        BOOLEAN NOT NULL DEFAULT TRUE,
  thu_tu      INT NOT NULL DEFAULT 0,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lich_trinh_diem (
  lich_trinh_id  INT NOT NULL,
  thu_tu         SMALLINT NOT NULL,
  dia_diem_id    VARCHAR(80) NOT NULL,
  ngay           TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Ngày thứ mấy của lộ trình',
  ghi_chu        VARCHAR(300) NULL,
  PRIMARY KEY (lich_trinh_id, thu_tu),
  FOREIGN KEY (lich_trinh_id) REFERENCES lich_trinh(id) ON DELETE CASCADE,
  FOREIGN KEY (dia_diem_id) REFERENCES dia_diem(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* Lộ trình gợi ý, cán bộ sửa ở mục Lộ trình. */
INSERT IGNORE INTO lich_trinh (id, ten, ten_en, thoi_gian, mo_ta, mo_ta_en, thu_tu) VALUES
  (1, 'Một ngày ở Đà Lạt', 'One day in Da Lat', '1 ngày', 'Dạo hồ Xuân Hương, thăm ga Đà Lạt và Dinh Bảo Đại, chiều đi cáp treo xuống Thiền viện Trúc Lâm bên hồ Tuyền Lâm.', 'Walk around Xuan Huong Lake, see Da Lat station and Bao Dai Palace, then take the cable car to Truc Lam monastery by Tuyen Lam Lake.', 1),
  (2, 'Núi và thác cao nguyên Lâm Viên', 'Mountains and falls of the Lam Vien plateau', '2 ngày 1 đêm', 'Leo núi Langbiang ngắm toàn cảnh Đà Lạt, hôm sau về phía nam xem thác Pongour.', 'Climb Langbiang for views over Da Lat, then head south to Pongour Waterfall the next day.', 2),
  (3, 'Biển và đồi cát Phan Thiết, Mũi Né', 'Sea and dunes of Phan Thiet and Mui Ne', '2 ngày 1 đêm', 'Tháp Chăm Po Sah Inư, trượt cát đồi Mũi Né lúc hoàng hôn, sáng hôm sau ngắm bình minh ở Bàu Trắng.', 'The Po Sah Inu Cham towers, sand-sledding on the Mui Ne dunes at sunset, then sunrise at Bau Trang the next morning.', 3),
  (4, 'Bờ biển phía nam: Tà Cú và Kê Gà', 'The southern coast: Ta Cu and Ke Ga', '1 ngày', 'Sáng lên núi Tà Cú viếng chùa, chiều ra mũi Kê Gà leo hải đăng cổ.', 'Morning visit to the pagoda on Ta Cu Mountain, afternoon climb of the old Ke Ga lighthouse.', 4),
  (5, 'Đại ngàn và công viên địa chất', 'Forests and the geopark', '2 ngày 1 đêm', 'Cắm trại ngắm bình minh trên hồ Tà Đùng, hôm sau khám phá hang động núi lửa và thác Dray Sáp.', 'Camp for sunrise over Ta Dung Lake, then explore the volcanic caves and Dray Sap Waterfall.', 5);
INSERT IGNORE INTO lich_trinh_diem (lich_trinh_id, thu_tu, dia_diem_id, ngay) VALUES
  (1, 1, 'ho-xuan-huong', 1), (1, 2, 'ga-da-lat', 1), (1, 3, 'dinh-bao-dai', 1), (1, 4, 'thien-vien-truc-lam', 1),
  (2, 1, 'nui-langbiang', 1), (2, 2, 'thac-pongour', 2),
  (3, 1, 'thap-po-sah-inu', 1), (3, 2, 'doi-cat-mui-ne', 1), (3, 3, 'bau-trang', 2),
  (4, 1, 'nui-ta-cu', 1), (4, 2, 'hai-dang-ke-ga', 1),
  (5, 1, 'ho-ta-dung', 1), (5, 2, 'hang-dong-nui-lua-krong-no', 2), (5, 3, 'thac-dray-sap', 2);

-- ------------------------------------------- ẢNH ĐỊA ĐIỂM
-- Lưu ngay trong cơ sở dữ liệu: Render không có ổ đĩa giữ tệp lâu dài. Ảnh
-- được thu nhỏ trên trình duyệt trước khi tải lên (cạnh dài tối đa 1600px).
CREATE TABLE IF NOT EXISTS anh_dia_diem (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  dia_diem_id  VARCHAR(80) NOT NULL,
  du_lieu      MEDIUMBLOB NOT NULL,
  kieu         VARCHAR(20) NOT NULL,
  rong         SMALLINT UNSIGNED NULL,
  cao          SMALLINT UNSIGNED NULL,
  chu_thich    VARCHAR(200) NULL,
  thu_tu       SMALLINT NOT NULL DEFAULT 0,
  nguoi_tai    INT NULL,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_diem (dia_diem_id, thu_tu),
  FOREIGN KEY (dia_diem_id) REFERENCES dia_diem(id) ON DELETE CASCADE,
  FOREIGN KEY (nguoi_tai) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------- PHẢN ÁNH CỦA NGƯỜI DÂN, DU KHÁCH
-- Người dân chỉ GỬI, không có tra cứu kết quả. ma_tra_cuu là số hiệu nội bộ
-- để cán bộ đối chiếu; phan_hoi là ghi chú kết quả xử lý, chỉ cán bộ xem.
-- Số liên hệ (không bắt buộc) để cán bộ gọi lại khi cần, không bao giờ công khai.
CREATE TABLE IF NOT EXISTS phan_anh (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  ma_tra_cuu    CHAR(8) NOT NULL UNIQUE,
  loai          VARCHAR(30) NOT NULL,
  dia_diem_id   VARCHAR(80) NULL,
  xa_phuong_id  INT NULL,
  noi_dung      VARCHAR(2000) NOT NULL,
  lien_he       VARCHAR(100) NULL,
  ip_bam        CHAR(64) NULL,
  trang_thai    VARCHAR(20) NOT NULL DEFAULT 'moi' COMMENT 'moi | dang-xu-ly | da-xu-ly | khong-xu-ly',
  phan_hoi      VARCHAR(2000) NULL COMMENT 'Kết quả xử lý — ghi chú nội bộ',
  nguoi_xu_ly   INT NULL,
  xu_ly_luc     DATETIME NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_trang_thai (trang_thai, created_at),
  FOREIGN KEY (dia_diem_id) REFERENCES dia_diem(id) ON DELETE SET NULL,
  FOREIGN KEY (xa_phuong_id) REFERENCES xa_phuong(id) ON DELETE SET NULL,
  FOREIGN KEY (nguoi_xu_ly) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------- TIN TỨC, CẢNH BÁO, SỐ ĐIỆN THOẠI CẦN BIẾT
CREATE TABLE IF NOT EXISTS tin_tuc (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  loai         VARCHAR(20) NOT NULL COMMENT 'canh-bao | su-kien | thong-bao | lien-he',
  tieu_de      VARCHAR(200) NOT NULL,
  tieu_de_en   VARCHAR(200) NULL,
  noi_dung     VARCHAR(3000) NULL,
  noi_dung_en  VARCHAR(3000) NULL,
  tu_ngay      DATE NULL,
  den_ngay     DATE NULL COMMENT 'Hết ngày này thì tự thôi hiện',
  dia_diem_id  VARCHAR(80) NULL,
  hien         BOOLEAN NOT NULL DEFAULT TRUE,
  thu_tu       INT NOT NULL DEFAULT 0,
  nguoi_tao    INT NULL,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_hien (hien, loai),
  FOREIGN KEY (dia_diem_id) REFERENCES dia_diem(id) ON DELETE SET NULL,
  FOREIGN KEY (nguoi_tao) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* Số khẩn cấp toàn quốc. Đường dây nóng du lịch của tỉnh thì cán bộ tự
   thêm ở mục Tin tức (loại "Số điện thoại") — không đoán số ở đây. */
INSERT IGNORE INTO tin_tuc (id, loai, tieu_de, tieu_de_en, noi_dung, thu_tu) VALUES
  (1, 'lien-he', 'Công an', 'Police', '113', 1),
  (2, 'lien-he', 'Cứu nạn, cứu hộ, chữa cháy', 'Fire and rescue', '114', 2),
  (3, 'lien-he', 'Cấp cứu y tế', 'Ambulance', '115', 3),
  (4, 'lien-he', 'Tìm kiếm cứu nạn', 'Search and rescue', '112', 4);

-- ------------------------------------------- BÁO ĐÁNH GIÁ SAI PHẠM
-- Mỗi thiết bị báo một đánh giá một lần (lưu bản băm, như đánh giá).
CREATE TABLE IF NOT EXISTS bao_danh_gia (
  danh_gia_id  BIGINT NOT NULL,
  ma_thiet_bi  CHAR(64) NOT NULL,
  ly_do        VARCHAR(30) NULL,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (danh_gia_id, ma_thiet_bi),
  FOREIGN KEY (danh_gia_id) REFERENCES danh_gia(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- GIAI ĐOẠN 4 — GIAO DIỆN MỚI: VÙNG DU LỊCH, PHƯƠNG TIỆN CỦA LỘ TRÌNH
-- ============================================================================
-- Vùng: để du khách lọc điểm đến theo miền (cao nguyên, biển đảo, đại ngàn).
-- Gán sẵn cho 15 điểm; cán bộ đổi được ở mục Địa điểm. Không suy ra vùng phía giao diện
-- (dễ sai, cán bộ không sửa được).
SET @co := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dia_diem' AND COLUMN_NAME = 'vung');
SET @lenh := IF(@co = 0, 'ALTER TABLE dia_diem ADD COLUMN vung ENUM(''cao-nguyen'',''bien-dao'',''dai-ngan'') NULL COMMENT ''Vùng du lịch, để lọc'' AFTER xa_phuong_id', 'DO 0');
PREPARE lenh FROM @lenh; EXECUTE lenh; DEALLOCATE PREPARE lenh;

UPDATE dia_diem SET vung = CASE
    WHEN id IN ('ho-xuan-huong','ga-da-lat','thien-vien-truc-lam','dinh-bao-dai','nui-langbiang','thac-pongour') THEN 'cao-nguyen'
    WHEN id IN ('doi-cat-mui-ne','bau-trang','thap-po-sah-inu','hai-dang-ke-ga','nui-ta-cu','dao-phu-quy') THEN 'bien-dao'
    WHEN id IN ('ho-ta-dung','thac-dray-sap','hang-dong-nui-lua-krong-no') THEN 'dai-ngan'
  END
WHERE vung IS NULL AND id IN ('ho-xuan-huong', 'ga-da-lat', 'thien-vien-truc-lam', 'dinh-bao-dai', 'nui-langbiang', 'thac-pongour', 'doi-cat-mui-ne', 'bau-trang', 'thap-po-sah-inu', 'hai-dang-ke-ga', 'nui-ta-cu', 'dao-phu-quy', 'ho-ta-dung', 'thac-dray-sap', 'hang-dong-nui-lua-krong-no');

-- Phương tiện gợi ý cho lộ trình (ô tô, xe máy…). Để trống cho cán bộ điền:
-- giao diện không hiện dòng này khi chưa có, không tự đoán.
SET @co := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'lich_trinh' AND COLUMN_NAME = 'phuong_tien');
SET @lenh := IF(@co = 0, 'ALTER TABLE lich_trinh ADD COLUMN phuong_tien VARCHAR(60) NULL AFTER thoi_gian, ADD COLUMN phuong_tien_en VARCHAR(60) NULL AFTER phuong_tien', 'DO 0');
PREPARE lenh FROM @lenh; EXECUTE lenh; DEALLOCATE PREPARE lenh;

-- Điểm lấy nét của ảnh (phần trăm ngang, dọc): khi ảnh bị cắt cho vừa khung
-- (thẻ, trình chiếu), phần cán bộ chọn luôn nằm trong khung.
SET @co := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'anh_dia_diem' AND COLUMN_NAME = 'tieu_diem_x');
SET @lenh := IF(@co = 0, 'ALTER TABLE anh_dia_diem ADD COLUMN tieu_diem_x TINYINT UNSIGNED NOT NULL DEFAULT 50 AFTER chu_thich, ADD COLUMN tieu_diem_y TINYINT UNSIGNED NOT NULL DEFAULT 50 AFTER tieu_diem_x', 'DO 0');
PREPARE lenh FROM @lenh; EXECUTE lenh; DEALLOCATE PREPARE lenh;

-- ============================================================================
-- GIAI ĐOẠN 5 — BÀI GIỚI THIỆU CHI TIẾT TỪNG ĐỊA ĐIỂM
-- ============================================================================
-- chi_tiet: bài dài hiện ở trang riêng của địa điểm. Định dạng đơn giản:
-- dòng "## " là tiêu đề mục, dòng "- " là gạch đầu dòng, dòng trống ngăn đoạn.
-- Mục "Lịch sử hình thành" mỗi dòng dạng "Mốc: nội dung" hiện thành dòng thời
-- gian. Bài viết sẵn là bản TỔNG HỢP, chờ cán bộ đối chiếu (cột da_kiem_tra);
-- chỉ điền khi cột còn trống, chạy lại không đè bài cán bộ đã sửa.
SET @co := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dia_diem' AND COLUMN_NAME = 'chi_tiet');
SET @lenh := IF(@co = 0, 'ALTER TABLE dia_diem ADD COLUMN chi_tiet TEXT NULL AFTER mo_ta_en, ADD COLUMN chi_tiet_en TEXT NULL AFTER chi_tiet', 'DO 0');
PREPARE lenh FROM @lenh; EXECUTE lenh; DEALLOCATE PREPARE lenh;

UPDATE dia_diem SET chi_tiet = '## Giới thiệu
Hồ Xuân Hương nằm ngay giữa trung tâm Đà Lạt, hình trăng lưỡi liềm, chu vi khoảng 5 km. Hồ được tạo ra từ thời Pháp bằng cách đắp đập ngăn dòng suối Cam Ly giữa thung lũng, về sau trở thành trái tim của thành phố.

Quanh hồ là vườn hoa thành phố, đồi cỏ, rừng thông, nhà hàng Thuỷ Tạ trên mặt nước và rất nhiều quán cà phê. Đây là nơi diễn ra nhiều hoạt động của lễ hội hoa Đà Lạt.

## Lịch sử hình thành
- 1919: Người Pháp đắp đập ngăn suối Cam Ly, tạo thành hồ nước giữa thung lũng, khi ấy gọi là Hồ Lớn.
- Đầu thập niên 1930: Đập bị hư hại sau mưa bão và được xây lại kiên cố hơn.
- 1953: Hồ được đặt tên là hồ Xuân Hương.
- 2004: Lễ hội hoa Đà Lạt lần đầu được tổ chức, hồ Xuân Hương là một trong những nơi trung tâm của lễ hội.
- Ngày nay: Biểu tượng của Đà Lạt, nơi người dân và du khách đi dạo, tập thể dục mỗi sáng.

## Có gì để xem
- Đi bộ hoặc đạp xe một vòng quanh hồ, đẹp nhất lúc sáng sớm khi sương còn phủ mặt nước.
- Vườn hoa thành phố ở đầu hồ, đồi cỏ và hàng thông ven hồ.
- Nhà hàng Thuỷ Tạ, công trình cũ nằm trên mặt hồ.
- Chợ Đà Lạt chỉ cách vài trăm mét, có thể ghép trong một buổi.

## Kinh nghiệm
- Đà Lạt lạnh vào sáng sớm và tối, nên mang áo ấm.
- Cuối tuần và dịp lễ rất đông, nên đi bộ thay vì đi xe quanh hồ.
- Không xả rác, không cho cá ăn thức ăn lạ để giữ nước hồ sạch.', chi_tiet_en = '## About
Xuan Huong Lake lies right in the centre of Da Lat: crescent-shaped and about 5 km around. It was created in the French era by damming the Cam Ly stream in the valley, and later became the heart of the city.

Around it are the city flower garden, grassy hills, pines, the Thuy Ta restaurant on the water and many cafes. Many events of the Da Lat Flower Festival take place here.

## Timeline
- 1919: The French dam the Cam Ly stream, creating a lake in the valley, then called the Great Lake.
- Early 1930s: The dam is damaged by storms and rebuilt more solidly.
- 1953: The lake is named Xuan Huong Lake.
- 2004: The first Da Lat Flower Festival is held, with the lake as one of its centres.
- Today: The symbol of Da Lat, where people walk and exercise every morning.

## What to see
- Walk or cycle around the lake, best early in the morning when mist still covers the water.
- The city flower garden, the grassy hills and the pines along the shore.
- Thuy Ta, an old restaurant building on the lake.
- Da Lat market is only a few hundred metres away.

## Tips
- Mornings and evenings are cold: bring a jacket.
- Weekends and holidays are crowded; walk rather than drive around the lake.
- Do not litter or feed the fish.' WHERE id = 'ho-xuan-huong' AND chi_tiet IS NULL;
UPDATE dia_diem SET chi_tiet = '## Giới thiệu
Ga Đà Lạt là nhà ga xây dựng thời Pháp, nổi bật với ba mái nhọn gợi hình ba đỉnh núi Langbiang và những ô cửa kính màu. Đây từng là ga cuối của tuyến đường sắt răng cưa Tháp Chàm - Đà Lạt, tuyến đường sắt leo núi nổi tiếng một thời.

Tuyến đường sắt nay không còn chạy suốt, nhưng đoạn từ ga Đà Lạt tới ga Trại Mát đã được khôi phục để chạy tàu du lịch.

## Lịch sử hình thành
- 1908: Khởi công tuyến đường sắt Tháp Chàm - Đà Lạt, có những đoạn dùng đường ray răng cưa để leo dốc.
- 1932: Tuyến đường sắt lên tới Đà Lạt.
- 1932 - 1938: Xây dựng nhà ga Đà Lạt theo thiết kế của các kiến trúc sư người Pháp.
- Thập niên 1970: Tuyến đường sắt ngừng khai thác do chiến tranh và hư hỏng; sau đó phần lớn đường ray bị tháo dỡ.
- 1991: Đoạn Đà Lạt - Trại Mát được khôi phục để chạy tàu du lịch.
- 2001: Nhà ga được công nhận là di tích kiến trúc nghệ thuật cấp quốc gia.

## Có gì để xem
- Kiến trúc ba mái nhọn và các ô cửa kính màu, góc chụp ảnh quen thuộc.
- Đầu máy và toa tàu cũ trưng bày trong sân ga.
- Đi tàu du lịch tới Trại Mát, thăm chùa Linh Phước nổi tiếng với các công trình khảm sành sứ.

## Kinh nghiệm
- Hỏi giờ tàu và mua vé ngay tại ga; tàu chạy theo chuyến, cần đủ khách.
- Đi buổi sáng để kịp thăm Trại Mát và về trước trưa.', chi_tiet_en = '## About
Da Lat Station was built in the French era. Its three pointed roofs recall the Langbiang peaks, and it has colourful stained-glass windows. It was the terminus of the Thap Cham - Da Lat cog railway, once a famous mountain line.

The line no longer runs its full length, but the stretch from Da Lat to Trai Mat has been restored for a tourist train.

## Timeline
- 1908: Work begins on the Thap Cham - Da Lat railway, with cog-rail sections for the steep climb.
- 1932: The line reaches Da Lat.
- 1932 - 1938: Da Lat station is built to a design by French architects.
- 1970s: The line stops running because of war and damage; most of the track is later removed.
- 1991: The Da Lat - Trai Mat section is restored for a tourist train.
- 2001: The station is listed as a national architectural monument.

## What to see
- The three-gabled facade and stained glass.
- Old locomotives and carriages on display.
- The tourist train to Trai Mat and Linh Phuoc Pagoda, famous for its ceramic mosaics.

## Tips
- Check train times and buy tickets at the station; trains run when there are enough passengers.
- Go in the morning to see Trai Mat and be back by noon.' WHERE id = 'ga-da-lat' AND chi_tiet IS NULL;
UPDATE dia_diem SET chi_tiet = '## Giới thiệu
Thiền viện Trúc Lâm Đà Lạt nằm trên núi Phụng Hoàng, nhìn xuống hồ Tuyền Lâm giữa rừng thông. Thiền viện tu theo thiền phái Trúc Lâm Yên Tử, có chánh điện, lầu chuông, vườn hoa và cây cảnh được chăm chút.

Từ thiền viện đi bộ xuống bến hồ Tuyền Lâm, du khách có thể thuê thuyền đi dạo trên mặt hồ.

## Lịch sử hình thành
- Cuối thập niên 1980: Hồ Tuyền Lâm hình thành khi đắp đập ngăn suối Tía.
- 1993: Khởi công xây dựng thiền viện trên núi Phụng Hoàng.
- 1994: Thiền viện khánh thành.
- Đầu những năm 2000: Tuyến cáp treo từ đồi Robin xuống thiền viện đưa vào sử dụng.
- Ngày nay: Một trong những thiền viện lớn nhất Lâm Đồng, điểm tham quan quen thuộc của du khách.

## Có gì để xem
- Chánh điện, lầu chuông và vườn hoa trong khuôn viên thiền viện.
- Toàn cảnh hồ Tuyền Lâm nhìn từ sân thiền viện.
- Đi cáp treo qua rừng thông, ngắm Đà Lạt từ trên cao.
- Đi thuyền trên hồ Tuyền Lâm.

## Kinh nghiệm
- Đây là nơi tu hành: ăn mặc kín đáo, nói nhỏ; khu nội viện của tăng ni không mở cho khách.
- Cáp treo có thể tạm dừng khi gió lớn, hỏi trước ở nhà ga cáp treo.', chi_tiet_en = '## About
Truc Lam Zen Monastery stands on Phung Hoang hill above Tuyen Lam Lake in the pine forest. It follows the Truc Lam Yen Tu school of Zen and has a main hall, a bell tower and carefully tended gardens.

From the monastery a path leads down to the lake, where boats can be hired.

## Timeline
- Late 1980s: Tuyen Lam Lake is formed by damming the Tia stream.
- 1993: Construction of the monastery begins on Phung Hoang hill.
- 1994: The monastery is inaugurated.
- Early 2000s: The cable car from Robin Hill to the monastery opens.
- Today: One of the largest monasteries in Lam Dong and a popular visit.

## What to see
- The main hall, bell tower and gardens.
- Views over Tuyen Lam Lake from the monastery grounds.
- The cable car ride over the pine forest.
- A boat trip on the lake.

## Tips
- It is a working monastery: dress modestly and keep quiet; the monks'' inner quarters are closed to visitors.
- The cable car may stop in strong wind; ask at the station first.' WHERE id = 'thien-vien-truc-lam' AND chi_tiet IS NULL;
UPDATE dia_diem SET chi_tiet = '## Giới thiệu
Dinh Bảo Đại, thường gọi là Dinh III, là biệt điện nghỉ mát của vị vua cuối cùng triều Nguyễn, nằm trên một đồi thông yên tĩnh ở Đà Lạt. Công trình mang dáng kiến trúc châu Âu đầu thế kỷ XX, đơn giản mà sang trọng.

Bên trong dinh còn giữ phòng làm việc, phòng khách, phòng ăn, phòng ngủ của vua và hoàng gia với nhiều đồ dùng, ảnh tư liệu.

## Lịch sử hình thành
- 1933 - 1938: Xây dựng biệt điện nghỉ mát của vua Bảo Đại trên đồi thông.
- 1938 - 1945: Vua Bảo Đại và gia đình nghỉ ngơi, làm việc tại đây mỗi khi lên Đà Lạt.
- 1949 - 1955: Thời làm Quốc trưởng, ông tiếp tục dùng dinh làm nơi làm việc, nghỉ ngơi.
- Ngày nay: Mở cửa đón khách tham quan như một bảo tàng nhỏ về đời sống hoàng gia.

## Có gì để xem
- Phòng làm việc, phòng khách và phòng ngủ còn giữ cách bài trí xưa.
- Ảnh tư liệu và đồ dùng của gia đình vua Bảo Đại.
- Vườn hoa và đồi thông bao quanh dinh.

## Kinh nghiệm
- Một số phòng yêu cầu bọc giày hoặc không chụp ảnh, làm theo hướng dẫn tại chỗ.
- Có thể ghép với hồ Xuân Hương và ga Đà Lạt trong một ngày.', chi_tiet_en = '## About
Bao Dai Palace, usually called Palace III, was the summer residence of the last Nguyen emperor, on a quiet pine hill in Da Lat. The building is a simple yet elegant example of early 20th-century European style.

Inside are the emperor''s office, reception and dining rooms and the royal bedrooms, with furniture and archive photos.

## Timeline
- 1933 - 1938: The summer residence of Emperor Bao Dai is built on a pine hill.
- 1938 - 1945: The emperor and his family stay and work here on visits to Da Lat.
- 1949 - 1955: As Head of State he keeps using the palace as an office and residence.
- Today: Open to visitors as a small museum of royal life.

## What to see
- The office, reception rooms and bedrooms in their original layout.
- Archive photos and belongings of the royal family.
- The gardens and pine hill around the palace.

## Tips
- Some rooms require shoe covers or ban photos; follow the signs.
- Combine with Xuan Huong Lake and Da Lat station in one day.' WHERE id = 'dinh-bao-dai' AND chi_tiet IS NULL;
UPDATE dia_diem SET chi_tiet = '## Giới thiệu
Langbiang là dãy núi cao ở phía bắc Đà Lạt, gồm hai đỉnh mà người dân quen gọi là núi Ông và núi Bà. Tên núi gắn với truyền thuyết về mối tình của chàng K''Lang và nàng H''Biang thuộc hai bộ tộc khác nhau.

Du khách có thể leo bộ lên đỉnh qua rừng thông, rừng lá rộng, hoặc đi xe lên đồi Radar để ngắm toàn cảnh Đà Lạt và thung lũng Vàng.

## Lịch sử hình thành
- 1893: Bác sĩ Alexandre Yersin thám hiểm và khám phá cao nguyên Lang Biang, mở đầu cho việc hình thành Đà Lạt.
- Đầu thế kỷ XX: Vùng chân núi là nơi sinh sống lâu đời của đồng bào K''Ho và các dân tộc bản địa.
- 2015: UNESCO công nhận Khu dự trữ sinh quyển thế giới Langbiang.
- Ngày nay: Điểm leo núi, cắm trại và giao lưu văn hoá cồng chiêng nổi tiếng của Lâm Đồng.

## Có gì để xem
- Toàn cảnh Đà Lạt, hồ Đankia và thung lũng từ đồi Radar.
- Đường mòn leo núi qua rừng thông lên đỉnh.
- Chương trình giao lưu văn hoá cồng chiêng của đồng bào bản địa vào buổi tối.

## Kinh nghiệm
- Leo bộ lên đỉnh mất khoảng 3 đến 4 giờ; đi cùng người dẫn đường nếu chưa quen.
- Mang áo ấm, áo mưa, nước uống; mùa mưa từ tháng 5 đến tháng 10 đường trơn.
- Mang rác xuống núi, không đốt lửa trong rừng.', chi_tiet_en = '## About
Langbiang is a mountain range north of Da Lat with two peaks known locally as the Husband and the Wife. Its name comes from the legend of K''Lang and H''Biang, lovers from two different tribes.

Hike to the top through pine and broadleaf forest, or ride up to Radar Hill for views over Da Lat and the Golden Valley.

## Timeline
- 1893: Dr Alexandre Yersin explores the Lang Biang plateau, a first step towards the founding of Da Lat.
- Early 20th century: The foothills are long-time home to the K''Ho and other indigenous peoples.
- 2015: UNESCO recognises the Langbiang World Biosphere Reserve.
- Today: A well-known spot for hiking, camping and gong culture evenings.

## What to see
- Views over Da Lat, Dankia Lake and the valley from Radar Hill.
- The hiking trail through the pines to the summit.
- Evening gong performances by local communities.

## Tips
- The hike to the summit takes about 3 to 4 hours; go with a guide if unsure of the way.
- Bring a jacket, rain gear and water; trails are slippery from May to October.
- Carry your rubbish down and never light fires in the forest.' WHERE id = 'nui-langbiang' AND chi_tiet IS NULL;
UPDATE dia_diem SET chi_tiet = '## Giới thiệu
Thác Pongour nằm cách trung tâm Đà Lạt khoảng 50 km về phía nam, nước đổ qua nhiều bậc đá rộng xếp tầng như bậc thang khổng lồ. Thác thường được gọi là "Nam thiên đệ nhất thác", thác đẹp bậc nhất phương Nam.

Tương truyền thác gắn với nữ tù trưởng Ka Nai và đàn tê giác của bà. Vào mùa nước, cả vách đá phủ một màu trắng xoá.

## Lịch sử hình thành
- Xưa: Vùng thác là nơi sinh sống của đồng bào bản địa, gắn với truyền thuyết nữ tù trưởng Ka Nai.
- Thời Pháp: Thác được biết đến rộng rãi như một thắng cảnh trên đường từ đồng bằng lên Đà Lạt.
- Ngày nay: Khu du lịch sinh thái, có lễ hội vào dịp rằm tháng Giêng. (Mốc năm cụ thể: cán bộ bổ sung.)

## Có gì để xem
- Toàn cảnh thác nhiều bậc nhìn từ bờ bên kia.
- Lối đi xuống chân thác và những hồ nước nhỏ dưới các bậc đá.
- Mùa khô có thể đi trên một phần các bậc đá, mùa mưa thác đẹp nhất.

## Kinh nghiệm
- Mùa mưa nước chảy mạnh: không lội ra các bậc đá, không tắm ở vùng nước xiết.
- Đường xuống thác có nhiều bậc, mang giày đế bám.', chi_tiet_en = '## About
Pongour Waterfall lies about 50 km south of central Da Lat. Water pours over wide rock terraces like a giant staircase, and it is often called "the finest waterfall of the South".

Legend links the falls to the chieftainess Ka Nai and her rhinoceroses. In the rainy season the whole rock face turns white with water.

## Timeline
- Long ago: Home to indigenous communities and the legend of chieftainess Ka Nai.
- French era: The falls become known as a sight on the road up to Da Lat.
- Today: An eco-tourism area with a festival around the first full moon of the lunar year. (Exact dates: to be added by staff.)

## What to see
- The full width of the terraced falls from the opposite bank.
- The path down to the foot of the falls and the pools below.
- In the dry season parts of the rock terraces can be walked on; the falls are fullest in the rainy season.

## Tips
- In the rainy season the current is strong: stay off the rocks and do not swim.
- The path has many steps; wear shoes with good grip.' WHERE id = 'thac-pongour' AND chi_tiet IS NULL;
UPDATE dia_diem SET chi_tiet = '## Giới thiệu
Đồi cát Mũi Né, thường gọi là đồi Hồng hay đồi cát bay, là dải đồi cát màu đỏ cam nằm sát biển. Gió thổi liên tục làm cát di chuyển, hình dáng đồi thay đổi theo mùa.

Nơi đây nổi tiếng với trò trượt cát bằng ván nhựa và những bức ảnh lúc bình minh, hoàng hôn khi cát đổi màu theo ánh nắng.

## Lịch sử hình thành
- Xưa: Mũi Né là làng chài nhỏ, sống bằng nghề biển và làm nước mắm.
- 24/10/1995: Nhật thực toàn phần quan sát rõ ở vùng Phan Thiết - Mũi Né; du khách và các nhà khoa học đổ về, Mũi Né bắt đầu được nhiều người biết đến.
- Cuối thập niên 1990 đến nay: Hàng loạt resort mọc lên dọc bờ biển Hàm Tiến - Mũi Né, đồi cát trở thành điểm tham quan không thể thiếu.
- Ngày nay: Một trong những điểm du lịch biển nổi tiếng nhất cả nước.

## Có gì để xem
- Đồi cát đỏ lúc bình minh và hoàng hôn.
- Trượt cát bằng ván nhựa trên các sườn đồi.
- Làng chài Mũi Né và suối Tiên gần đó có thể ghép cùng một buổi.

## Kinh nghiệm
- Tránh buổi trưa: cát rất nóng và nắng gắt; mang nước, mũ, kính.
- Hỏi rõ giá thuê ván, giá xe trước khi dùng dịch vụ.
- Gió mạnh nhiều cát bay, bảo vệ máy ảnh, điện thoại.', chi_tiet_en = '## About
The Mui Ne dunes, often called the Red Dunes or flying dunes, are orange-red sand hills close to the sea. The constant wind moves the sand, so their shape changes with the seasons.

They are famous for sand-sledding on plastic boards and for photos at sunrise and sunset, when the sand changes colour.

## Timeline
- Long ago: Mui Ne is a small fishing village living from the sea and fish sauce.
- 24/10/1995: A total solar eclipse is clearly visible around Phan Thiet - Mui Ne; visitors and scientists arrive and Mui Ne becomes widely known.
- Late 1990s to now: Resorts line the Ham Tien - Mui Ne coast and the dunes become a must-see.
- Today: One of the best-known beach destinations in Vietnam.

## What to see
- The red dunes at sunrise and sunset.
- Sand-sledding down the slopes.
- Mui Ne fishing village and the Fairy Stream nearby.

## Tips
- Avoid midday: the sand is very hot. Bring water, a hat and sunglasses.
- Agree on board and vehicle prices before using a service.
- Strong wind blows sand: protect cameras and phones.' WHERE id = 'doi-cat-mui-ne' AND chi_tiet IS NULL;
UPDATE dia_diem SET chi_tiet = '## Giới thiệu
Bàu Trắng là vùng đồi cát trắng rộng lớn bao quanh những hồ nước ngọt, thường được ví là tiểu sa mạc. Giữa nền cát trắng là mặt hồ xanh, mùa hè sen nở kín một góc hồ.

Du khách đi xe địa hình chạy trên cát, leo lên đỉnh đồi ngắm bình minh hoặc dạo quanh hồ.

## Lịch sử hình thành
- Xưa: Vùng cát ven biển là nơi người dân sống bằng nghề nông, chăn nuôi quanh các bàu nước ngọt.
- Những năm gần đây: Bàu Trắng trở thành điểm tham quan, chụp ảnh nổi tiếng, có dịch vụ xe địa hình trên cát. (Mốc năm cụ thể: cán bộ bổ sung.)
- Ngày nay: Điểm đến được nhiều du khách ghép cùng chuyến đi Mũi Né.

## Có gì để xem
- Đồi cát trắng nhấp nhô, đẹp nhất lúc bình minh.
- Hồ nước ngọt và sen nở vào mùa hè.
- Đi xe địa hình trên cát.

## Kinh nghiệm
- Đi thật sớm để ngắm bình minh và tránh nắng gắt.
- Đi xe địa hình theo đúng tuyến của đơn vị cho thuê, đội mũ bảo hiểm.
- Hỏi rõ giá dịch vụ trước khi đi.', chi_tiet_en = '## About
Bau Trang is a vast area of white sand dunes around freshwater lakes, often called a miniature desert. Blue water sits in the white sand, and in summer lotus covers part of the lake.

Visitors ride dune buggies, climb the dunes for sunrise or walk around the lake.

## Timeline
- Long ago: People farm and raise livestock around the freshwater lakes in the coastal sands.
- Recent years: Bau Trang becomes a popular sight with dune-buggy rides. (Exact dates: to be added by staff.)
- Today: Often combined with a trip to Mui Ne.

## What to see
- Rolling white dunes, best at sunrise.
- The freshwater lake and summer lotus.
- Dune-buggy rides over the sand.

## Tips
- Go very early for sunrise and to avoid the heat.
- Ride buggies only on the operator''s routes and wear a helmet.
- Agree on prices before you go.' WHERE id = 'bau-trang' AND chi_tiet IS NULL;
UPDATE dia_diem SET chi_tiet = '## Giới thiệu
Tháp Po Sah Inư là cụm tháp Chăm cổ trên đồi Bà Nài, nhìn ra biển và trung tâm Phan Thiết. Các tháp được xây bằng gạch theo kỹ thuật đặc trưng của người Chăm, thờ thần Shiva.

Tên tháp gắn với công chúa Po Sah Inư trong truyền thuyết của người Chăm. Đây là một trong những di tích Chăm cổ ở phía nam miền Trung.

## Lịch sử hình thành
- Cuối thế kỷ VIII - đầu thế kỷ IX: Người Chăm dựng cụm tháp trên đồi Bà Nài.
- Các thế kỷ sau: Tháp là nơi thờ tự, gắn với đời sống tín ngưỡng của cộng đồng Chăm trong vùng.
- 1991: Cụm tháp được công nhận là di tích kiến trúc nghệ thuật cấp quốc gia.
- Ngày nay: Điểm tham quan văn hoá Chăm, có trưng bày hiện vật và biểu diễn nghệ thuật Chăm.

## Có gì để xem
- Các tháp gạch cổ và kỹ thuật xây gạch không thấy mạch vữa của người Chăm.
- Toàn cảnh biển và thành phố từ đồi tháp.
- Nhà trưng bày hiện vật, trang phục và đồ gốm Chăm.

## Kinh nghiệm
- Tháp là nơi thờ tự: không leo trèo lên tháp, ăn mặc lịch sự.
- Đi buổi chiều để ngắm hoàng hôn trên biển.', chi_tiet_en = '## About
Po Sah Inu is a group of ancient Cham towers on Ba Nai hill, looking out over the sea and Phan Thiet. The brick towers, built with the Cham people''s distinctive technique, were dedicated to the god Shiva.

They are named after Princess Po Sah Inu of Cham legend and are among the old Cham monuments of the southern central coast.

## Timeline
- Late 8th - early 9th century: The Cham build the towers on Ba Nai hill.
- Following centuries: The towers remain a place of worship for the local Cham community.
- 1991: Listed as a national architectural monument.
- Today: A Cham cultural site with an exhibition of artefacts and Cham performances.

## What to see
- The old brick towers and the Cham mortar-less bricklaying.
- Views over the sea and the city from the hill.
- The exhibition of Cham artefacts, costumes and pottery.

## Tips
- It is a place of worship: do not climb the towers and dress respectfully.
- Come in the late afternoon for the sunset over the sea.' WHERE id = 'thap-po-sah-inu' AND chi_tiet IS NULL;
UPDATE dia_diem SET chi_tiet = '## Giới thiệu
Hải đăng Kê Gà đứng trên mũi Kê Gà, một mỏm đá nhô ra biển ở phía nam Phan Thiết. Ngọn hải đăng do người Pháp xây cuối thế kỷ XIX bằng đá granite, là một trong những hải đăng cổ nhất Việt Nam và vẫn đang hoạt động.

Leo hết các bậc thang xoắn bên trong tháp, du khách nhìn bao quát biển, bãi đá và bờ cát dài phía dưới.

## Lịch sử hình thành
- 1897 - 1899: Người Pháp xây hải đăng bằng đá granite trên mũi Kê Gà.
- Thế kỷ XX: Hải đăng hoạt động liên tục, dẫn đường cho tàu thuyền qua vùng biển phía nam miền Trung.
- Ngày nay: Vẫn là hải đăng đang hoạt động, đồng thời mở cửa đón khách tham quan.

## Có gì để xem
- Tháp đá cổ và cầu thang xoắn bên trong.
- Toàn cảnh biển và mũi Kê Gà từ đỉnh tháp.
- Bãi đá nhiều hình thù ven đảo, đẹp lúc bình minh.

## Kinh nghiệm
- Ra mũi Kê Gà bằng thuyền từ bờ; hỏi trước giờ đưa đón và tình hình sóng gió.
- Cầu thang hẹp và dốc, không phù hợp người sợ độ cao hoặc trẻ quá nhỏ.
- Đi giày đế bám khi đi trên bãi đá.', chi_tiet_en = '## About
Ke Ga Lighthouse stands on Ke Ga cape, a rocky point south of Phan Thiet. Built by the French in granite at the end of the 19th century, it is one of the oldest lighthouses in Vietnam and still in service.

Climb the spiral stairs inside the tower for views over the sea, the rocks and the long beach below.

## Timeline
- 1897 - 1899: The French build the granite lighthouse on Ke Ga cape.
- 20th century: The light guides ships along the southern central coast without interruption.
- Today: Still a working lighthouse, open to visitors.

## What to see
- The old stone tower and its spiral staircase.
- Views of the sea and the cape from the top.
- Sculpted rocks along the shore, lovely at sunrise.

## Tips
- Reach the cape by boat from the shore; ask about times and sea conditions.
- The stairs are narrow and steep; not for those afraid of heights or very young children.
- Wear shoes with good grip on the rocks.' WHERE id = 'hai-dang-ke-ga' AND chi_tiet IS NULL;
UPDATE dia_diem SET chi_tiet = '## Giới thiệu
Núi Tà Cú cao khoảng 650 m, phủ rừng xanh quanh năm, trên núi có chùa Linh Sơn Trường Thọ và tượng Phật nhập Niết bàn dài 49 m, một trong những tượng Phật nằm lớn ở Việt Nam.

Du khách lên chùa bằng cáp treo hoặc leo bộ theo đường mòn qua rừng, vừa hành hương vừa ngắm cảnh đồng bằng ven biển.

## Lịch sử hình thành
- 1879: Thiền sư Hữu Đức lên núi lập am tu hành, về sau thành chùa Linh Sơn Trường Thọ.
- Thập niên 1960: Xây dựng tượng Phật nhập Niết bàn dài 49 m trên núi.
- Đầu những năm 2000: Tuyến cáp treo lên núi đưa vào hoạt động.
- Ngày nay: Điểm hành hương và du lịch sinh thái nổi tiếng, đông khách vào dịp lễ Phật giáo.

## Có gì để xem
- Tượng Phật nhập Niết bàn và tượng Quan Âm trên núi.
- Chùa Linh Sơn Trường Thọ và các am cổ.
- Rừng nguyên sinh và cảnh đồng bằng nhìn từ trên cao.

## Kinh nghiệm
- Leo bộ mất khoảng 2 đến 3 giờ, mang nước và giày leo núi.
- Ăn mặc kín đáo khi vào chùa.
- Dịp rằm, lễ lớn rất đông, nên đi sớm.', chi_tiet_en = '## About
Ta Cu Mountain is about 650 m high and forested all year round. On it stand Linh Son Truong Tho Pagoda and a 49-metre reclining Buddha, one of the largest in Vietnam.

Go up by cable car or follow the forest trail, combining a pilgrimage with views over the coastal plain.

## Timeline
- 1879: The monk Huu Duc settles on the mountain; his hermitage later becomes Linh Son Truong Tho Pagoda.
- 1960s: The 49-metre reclining Buddha is built.
- Early 2000s: The cable car opens.
- Today: A well-known pilgrimage and eco-tourism site, crowded on Buddhist holidays.

## What to see
- The reclining Buddha and the Quan Am statue.
- Linh Son Truong Tho Pagoda and its old shrines.
- The forest and the plain below.

## Tips
- The hike takes about 2 to 3 hours; bring water and proper shoes.
- Dress modestly in the pagoda.
- Full-moon days and big festivals are crowded; go early.' WHERE id = 'nui-ta-cu' AND chi_tiet IS NULL;
UPDATE dia_diem SET chi_tiet = '## Giới thiệu
Phú Quý là hòn đảo giữa biển khơi, cách Phan Thiết khoảng 120 km. Nước biển ở đây trong xanh, nhiều rạn san hô, bờ đảo có những gành đá, bãi cát còn hoang sơ.

Đảo có đời sống văn hoá biển đặc sắc với lăng Ông Nam Hải thờ cá voi, chùa Linh Sơn trên núi Cao Cát và những làng chài yên bình.

## Lịch sử hình thành
- Thế kỷ XVII - XVIII: Cư dân Việt từ miền Trung ra khai phá, lập làng trên đảo.
- 1977: Thành lập huyện đảo Phú Quý.
- 2025: Phú Quý trở thành đặc khu thuộc tỉnh Lâm Đồng.
- Ngày nay: Điểm du lịch biển đảo đang được nhiều du khách tìm đến.

## Có gì để xem
- Gành Hang, các bãi đá và bãi tắm hoang sơ.
- Lặn ngắm san hô ở vùng nước trong quanh đảo.
- Lăng Ông Nam Hải, chùa Linh Sơn trên núi Cao Cát, cột cờ Phú Quý.

## Kinh nghiệm
- Ra đảo bằng tàu từ cảng Phan Thiết, đi khoảng 2 đến 3 giờ; đặt vé trước, mang giấy tờ tùy thân.
- Tàu có thể ngưng chạy khi biển động, nhất là mùa gió đông bắc cuối năm; để dư thời gian.
- Không bẻ san hô, không mang san hô, vỏ ốc quý về đất liền.', chi_tiet_en = '## About
Phu Quy is an island far out at sea, about 120 km from Phan Thiet. The water is clear with coral reefs, and the shore has rocky headlands and unspoilt beaches.

The island has a rich sea culture, with the Nam Hai whale temple, Linh Son Pagoda on Cao Cat hill and quiet fishing villages.

## Timeline
- 17th - 18th century: Settlers from the central coast clear land and found villages on the island.
- 1977: Phu Quy island district is created.
- 2025: Phu Quy becomes a special administrative zone of Lam Dong province.
- Today: A growing island destination.

## What to see
- Ganh Hang, the rocky shores and quiet beaches.
- Snorkelling over the coral in the clear water.
- The whale temple, Linh Son Pagoda on Cao Cat hill and the Phu Quy flag tower.

## Tips
- Take the boat from Phan Thiet port, about 2 to 3 hours; book ahead and carry ID.
- Boats may be cancelled in rough seas, especially in the north-east monsoon at the end of the year; allow spare days.
- Do not break or take coral or rare shells.' WHERE id = 'dao-phu-quy' AND chi_tiet IS NULL;
UPDATE dia_diem SET chi_tiet = '## Giới thiệu
Hồ Tà Đùng là lòng hồ thuỷ điện nằm giữa núi rừng, với hàng chục đảo lớn nhỏ phủ cây xanh nhô lên mặt nước. Cảnh hồ thường được ví là vịnh Hạ Long của Tây Nguyên.

Quanh hồ là rừng của Vườn quốc gia Tà Đùng, nơi có nhiều loài động thực vật quý. Du khách đến đây cắm trại, ngủ homestay và dậy sớm ngắm sương trên hồ.

## Lịch sử hình thành
- Trước đây: Thung lũng sông Đồng Nai giữa đại ngàn, nơi sinh sống của đồng bào M''Nông và các dân tộc bản địa.
- Khoảng 2010 - 2011: Hồ hình thành khi thuỷ điện Đồng Nai 3 tích nước, các đỉnh đồi trở thành đảo.
- Ngày nay: Điểm du lịch sinh thái, cắm trại nổi tiếng của vùng Đắk Nông cũ.

## Có gì để xem
- Bình minh và biển mây trên mặt hồ, nhìn từ các đồi quanh hồ.
- Đi thuyền giữa các đảo nhỏ.
- Rừng nguyên sinh của Vườn quốc gia Tà Đùng.

## Kinh nghiệm
- Ngủ lại một đêm để ngắm bình minh; đặt homestay trước.
- Đường đồi dốc, mùa mưa trơn; đi xe vững tay lái.
- Không đốt lửa trong rừng, mang rác về.', chi_tiet_en = '## About
Ta Dung Lake is a hydropower reservoir among the mountains, with dozens of wooded islets rising from the water. It is often called the Ha Long Bay of the Central Highlands.

Around it is the forest of Ta Dung National Park, home to many rare species. Visitors camp, stay in homestays and get up early to watch the mist on the lake.

## Timeline
- Before: A valley of the Dong Nai River in deep forest, home to the M''Nong and other indigenous peoples.
- About 2010 - 2011: The lake forms as the Dong Nai 3 hydropower plant fills, turning hilltops into islands.
- Today: A well-known eco-tourism and camping spot of the former Dak Nong area.

## What to see
- Sunrise and the sea of clouds over the lake from the surrounding hills.
- A boat trip among the islets.
- The forest of Ta Dung National Park.

## Tips
- Stay one night to see the sunrise; book a homestay in advance.
- Hill roads are steep and slippery in the rainy season.
- No fires in the forest; take your rubbish home.' WHERE id = 'ho-ta-dung' AND chi_tiet IS NULL;
UPDATE dia_diem SET chi_tiet = '## Giới thiệu
Thác Dray Sáp nằm trên dòng sông Sêrêpốk, nước đổ xuống tạo thành màn bụi nước bay mù mịt, nên người Ê Đê gọi là thác khói. Gần đó còn có thác Gia Long và nhiều thác khác trên cùng dòng sông.

Thác nằm trong vùng công viên địa chất toàn cầu UNESCO, với những vách đá bazan hình thành từ các đợt phun trào núi lửa xa xưa.

## Lịch sử hình thành
- Xa xưa: Các đợt phun trào núi lửa tạo nên nền đá bazan và địa hình thác ghềnh của vùng.
- Thế kỷ XX: Thác trở thành thắng cảnh nổi tiếng của vùng Tây Nguyên.
- 2020: UNESCO công nhận Công viên địa chất toàn cầu Đắk Nông, trong đó có vùng thác.
- Ngày nay: Khu du lịch sinh thái, điểm tham quan của các tuyến khám phá công viên địa chất.

## Có gì để xem
- Thác lớn và màn bụi nước vào mùa mưa.
- Vách đá bazan và hang đá dưới chân thác.
- Thác Gia Long ở gần đó.

## Kinh nghiệm
- Mùa mưa nước rất mạnh: đứng ở khu vực có rào chắn, không tắm thác.
- Đá ven thác trơn, đi giày đế bám.', chi_tiet_en = '## About
Dray Sap Waterfall is on the Srepok River. Its falling water throws up clouds of spray, so the Ede people call it the smoky falls. Gia Long Waterfall and other falls lie nearby on the same river.

It sits within the UNESCO global geopark, among basalt cliffs formed by ancient volcanic eruptions.

## Timeline
- Ancient times: Volcanic eruptions lay down the basalt and shape the region''s falls and rapids.
- 20th century: The falls become a famous sight of the Central Highlands.
- 2020: UNESCO recognises the Dak Nong Global Geopark, which includes the falls area.
- Today: An eco-tourism area on geopark discovery routes.

## What to see
- The main falls and the spray in the rainy season.
- Basalt cliffs and rock caves at the foot of the falls.
- Gia Long Waterfall nearby.

## Tips
- In the rainy season the current is very strong: stay behind the barriers and do not swim.
- Rocks are slippery; wear shoes with good grip.' WHERE id = 'thac-dray-sap' AND chi_tiet IS NULL;
UPDATE dia_diem SET chi_tiet = '## Giới thiệu
Hang động núi lửa Krông Nô là hệ thống hang hình thành từ dòng dung nham của núi lửa Chư B''luk. Khi lớp ngoài dòng dung nham nguội và cứng lại, phần bên trong tiếp tục chảy đi, để lại những ống hang dài trong lòng đất.

Hệ thống hang thuộc loại dài nhất Đông Nam Á và là điểm nhấn của công viên địa chất toàn cầu UNESCO.

## Lịch sử hình thành
- Xa xưa: Núi lửa Chư B''luk phun trào, dòng dung nham tạo nên hệ thống hang ngầm.
- 2007: Các nhà khoa học Việt Nam và Nhật Bản khảo sát, công bố hệ thống hang động núi lửa.
- 2020: UNESCO công nhận Công viên địa chất toàn cầu Đắk Nông.
- Ngày nay: Điểm khám phá địa chất, đón khách theo tour có người hướng dẫn.

## Có gì để xem
- Vòm hang và vách đá bazan còn in dấu dòng dung nham.
- Miệng núi lửa và cảnh quan đồng cỏ, rẫy cà phê quanh vùng.

## Kinh nghiệm
- Chỉ vào hang khi có người hướng dẫn; liên hệ ban quản lý công viên địa chất trước khi đi.
- Mang đèn pin, giày leo núi, mũ bảo hộ.
- Không chạm, không lấy đá, không viết vẽ lên vách hang.', chi_tiet_en = '## About
The Krong No volcanic caves were formed by lava from the Chu B''luk volcano. As the outer crust of the lava flow cooled and hardened, molten lava inside flowed on, leaving long tubes underground.

The system is among the longest volcanic caves in Southeast Asia and a highlight of the UNESCO global geopark.

## Timeline
- Ancient times: Chu B''luk erupts and its lava flows form the cave system.
- 2007: Vietnamese and Japanese scientists survey and announce the volcanic caves.
- 2020: UNESCO recognises the Dak Nong Global Geopark.
- Today: A geology discovery site, visited on guided tours.

## What to see
- Cave vaults and basalt walls still marked by the lava flow.
- The volcanic crater and the grassland and coffee farms around it.

## Tips
- Enter only with a guide; contact the geopark management before going.
- Bring a torch, hiking shoes and a helmet.
- Do not touch, take or draw on the rocks.' WHERE id = 'hang-dong-nui-lua-krong-no' AND chi_tiet IS NULL;

-- ============================================================================
-- GIAI ĐOẠN 6 — ĐIỂM QUAN SÁT 360°
-- ============================================================================
-- Mỗi điểm quan sát là một ảnh toàn cảnh 360° chụp tại một vị trí của địa
-- điểm (đỉnh núi, cổng chính, bến thuyền…): du khách kéo chuột hoặc xoay điện
-- thoại để nhìn quanh. Ảnh lưu trong cơ sở dữ liệu như ảnh địa điểm.
--   goc_ngang: góc chụp ngang (360 = ảnh 360° trọn vòng, 180 = ảnh panorama nửa vòng)
--   huong_dau: hướng nhìn lúc mở (độ, -180..180)
--   nguon: 'anh' = ảnh cán bộ tải lên (du_lieu), 'google' = ảnh 360° trên Google Maps
--          (Street View hoặc ảnh 360° người dùng đăng), nhúng thẳng vào trang qua google_url
CREATE TABLE IF NOT EXISTS diem_quan_sat (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  dia_diem_id  VARCHAR(80) NOT NULL,
  ten          VARCHAR(120) NOT NULL,
  ten_en       VARCHAR(120) NULL,
  nguon        ENUM('anh','google') NOT NULL DEFAULT 'anh',
  du_lieu      MEDIUMBLOB NULL,
  google_url   VARCHAR(2000) NULL,
  kieu         VARCHAR(20) NULL,
  rong         SMALLINT UNSIGNED NULL,
  cao          SMALLINT UNSIGNED NULL,
  goc_ngang    SMALLINT UNSIGNED NOT NULL DEFAULT 360,
  huong_dau    SMALLINT NOT NULL DEFAULT 0,
  thu_tu       SMALLINT NOT NULL DEFAULT 0,
  nguoi_tai    INT NULL,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_diem (dia_diem_id, thu_tu),
  FOREIGN KEY (dia_diem_id) REFERENCES dia_diem(id) ON DELETE CASCADE,
  FOREIGN KEY (nguoi_tai) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- Bảng tạo từ bản trước (chưa có nguồn Google Maps): thêm cột.
SET @co := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'diem_quan_sat' AND COLUMN_NAME = 'google_url');
SET @lenh := IF(@co = 0, 'ALTER TABLE diem_quan_sat ADD COLUMN nguon ENUM(''anh'',''google'') NOT NULL DEFAULT ''anh'' AFTER ten_en, MODIFY du_lieu MEDIUMBLOB NULL, ADD COLUMN google_url VARCHAR(2000) NULL AFTER du_lieu, MODIFY kieu VARCHAR(20) NULL', 'DO 0');
PREPARE lenh FROM @lenh; EXECUTE lenh; DEALLOCATE PREPARE lenh;

-- ============================================================================
-- GIAI ĐOẠN 7 — TIN TỨC CÓ ẢNH, TIN NỔI BẬT, ĐƯỜNG DẪN NGUỒN
-- ============================================================================
-- noi_bat: tin nổi bật, tự lướt ở đầu trang Tin tức. lien_ket: đường dẫn tới
-- nguồn tin (trang của sở, báo…). Nội dung tin nới lên TEXT để viết bài dài.
SET @co := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tin_tuc' AND COLUMN_NAME = 'noi_bat');
SET @lenh := IF(@co = 0, 'ALTER TABLE tin_tuc ADD COLUMN noi_bat BOOLEAN NOT NULL DEFAULT FALSE AFTER hien, ADD COLUMN lien_ket VARCHAR(300) NULL AFTER dia_diem_id, MODIFY noi_dung TEXT NULL, MODIFY noi_dung_en TEXT NULL', 'DO 0');
PREPARE lenh FROM @lenh; EXECUTE lenh; DEALLOCATE PREPARE lenh;

-- Ảnh của tin (ảnh đầu là ảnh bìa), lưu trong cơ sở dữ liệu như ảnh địa điểm.
CREATE TABLE IF NOT EXISTS anh_tin (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  tin_id       INT NOT NULL,
  du_lieu      MEDIUMBLOB NOT NULL,
  kieu         VARCHAR(20) NOT NULL,
  rong         SMALLINT UNSIGNED NULL,
  cao          SMALLINT UNSIGNED NULL,
  chu_thich    VARCHAR(200) NULL,
  thu_tu       SMALLINT NOT NULL DEFAULT 0,
  nguoi_tai    INT NULL,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tin (tin_id, thu_tu),
  FOREIGN KEY (tin_id) REFERENCES tin_tuc(id) ON DELETE CASCADE,
  FOREIGN KEY (nguoi_tai) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- ẢNH 360° GOOGLE GẮN SẴN CHO 15 ĐIỂM ĐẾN
-- ============================================================================
-- Mỗi điểm đến một điểm quan sát Street View theo toạ độ (kiểu "svembed", không
-- cần khoá API), hiện đầu tiên ở mục "Quan sát 360°" (thu_tu 0). Toạ độ là vị trí
-- khởi đầu, Google tự lấy ảnh 360° gần nhất — cán bộ mở trang từng điểm để kiểm,
-- điểm nào không có ảnh thì xoá ở mục Địa điểm và dán mã nhúng khác.
-- Đường dẫn đúng dạng chuẩn máy chủ tự dựng (routes/noi-dung.js, docNhungGoogle).
-- Chạy lại không thêm trùng; không vượt 10 điểm quan sát mỗi địa điểm; địa điểm
-- đã bị xoá thì bỏ qua. Cần MySQL 8.0.19 trở lên (VALUES ROW).
INSERT INTO diem_quan_sat (dia_diem_id, ten, ten_en, nguon, google_url, thu_tu)
SELECT t.column_0, t.column_1, t.column_2, 'google', t.column_3, 0
  FROM (VALUES
  ROW('ho-xuan-huong', 'Hồ Xuân Hương', 'Xuan Huong Lake', 'https://maps.google.com/maps?layer=c&cbll=11.944252,108.447478&cbp=12,0,0,0,0&output=svembed'),
  ROW('ga-da-lat', 'Ga Đà Lạt', 'Da Lat Railway Station', 'https://maps.google.com/maps?layer=c&cbll=11.9445,108.4583&cbp=12,0,0,0,0&output=svembed'),
  ROW('thien-vien-truc-lam', 'Thiền viện Trúc Lâm - hồ Tuyền Lâm', 'Truc Lam Zen Monastery - Tuyen Lam Lake', 'https://maps.google.com/maps?layer=c&cbll=11.90417,108.43485&cbp=12,0,0,0,0&output=svembed'),
  ROW('dinh-bao-dai', 'Dinh Bảo Đại (Dinh III)', 'Bao Dai Palace (Palace III)', 'https://maps.google.com/maps?layer=c&cbll=11.93005,108.42967&cbp=12,0,0,0,0&output=svembed'),
  ROW('nui-langbiang', 'Núi Langbiang', 'Langbiang Mountain', 'https://maps.google.com/maps?layer=c&cbll=12.04726,108.44058&cbp=12,0,0,0,0&output=svembed'),
  ROW('thac-pongour', 'Thác Pongour', 'Pongour Waterfall', 'https://maps.google.com/maps?layer=c&cbll=11.68929,108.2655&cbp=12,0,0,0,0&output=svembed'),
  ROW('doi-cat-mui-ne', 'Đồi cát bay Mũi Né', 'Mui Ne Flying Sand Dunes', 'https://maps.google.com/maps?layer=c&cbll=10.9334,108.2825&cbp=12,0,0,0,0&output=svembed'),
  ROW('bau-trang', 'Bàu Trắng', 'Bau Trang White Dunes', 'https://maps.google.com/maps?layer=c&cbll=11.06791,108.41692&cbp=12,0,0,0,0&output=svembed'),
  ROW('thap-po-sah-inu', 'Tháp Po Sah Inư', 'Po Sah Inu Cham Towers', 'https://maps.google.com/maps?layer=c&cbll=10.93595,108.14617&cbp=12,0,0,0,0&output=svembed'),
  ROW('hai-dang-ke-ga', 'Hải đăng Kê Gà', 'Ke Ga Lighthouse', 'https://maps.google.com/maps?layer=c&cbll=10.69529,107.99158&cbp=12,0,0,0,0&output=svembed'),
  ROW('nui-ta-cu', 'Núi Tà Cú', 'Ta Cu Mountain', 'https://maps.google.com/maps?layer=c&cbll=10.81507,107.9001&cbp=12,0,0,0,0&output=svembed'),
  ROW('dao-phu-quy', 'Đảo Phú Quý', 'Phu Quy Island', 'https://maps.google.com/maps?layer=c&cbll=10.53086,108.94276&cbp=12,0,0,0,0&output=svembed'),
  ROW('ho-ta-dung', 'Hồ Tà Đùng - điểm ngắm toàn cảnh', 'Ta Dung Lake - panoramic viewpoint', 'https://maps.google.com/maps?layer=c&cbll=11.86029,107.92353&cbp=12,0,0,0,0&output=svembed'),
  ROW('thac-dray-sap', 'Thác Dray Sáp', 'Dray Sap Waterfall', 'https://maps.google.com/maps?layer=c&cbll=12.53785,107.89017&cbp=12,0,0,0,0&output=svembed'),
  ROW('hang-dong-nui-lua-krong-no', 'Hang động núi lửa Krông Nô - khu hang C3', 'Krong No Volcanic Caves - C3 cave area', 'https://maps.google.com/maps?layer=c&cbll=12.51731,107.89645&cbp=12,0,0,0,0&output=svembed')
  ) AS t
  JOIN dia_diem d ON d.id = t.column_0
 WHERE NOT EXISTS (SELECT 1 FROM diem_quan_sat q WHERE q.dia_diem_id = t.column_0 AND q.google_url = t.column_3)
   AND (SELECT COUNT(*) FROM diem_quan_sat c WHERE c.dia_diem_id = t.column_0) < 10;

SELECT COUNT(*) AS so_dia_diem, (SELECT COUNT(*) FROM xa_phuong) AS so_xa_phuong FROM dia_diem;
