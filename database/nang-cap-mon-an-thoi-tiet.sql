-- Tạo bảng món ăn và điểm thời tiết (19/10/2026). Máy chủ tự chạy phần này khi khởi động
-- (thấy thiếu bảng). Chỉ cần dán tay khi tắt tự nâng cấp. Chạy lại nhiều lần không sao.
-- ============================================================================
-- Ăn gì ở Lâm Đồng và điểm dự báo thời tiết: cán bộ sửa ở khu quản trị (mục "Ăn gì",
-- "Điểm thời tiết"). Dữ liệu ban đầu chỉ điền khi bảng còn TRỐNG: cán bộ đã sửa, xoá
-- thì chạy lại tệp này không đè lên.
CREATE TABLE IF NOT EXISTS mon_an (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  vung       ENUM('cao-nguyen','bien-dao','dai-ngan') NOT NULL,
  loai       ENUM('mon','qua') NOT NULL DEFAULT 'mon' COMMENT 'mon: món tiêu biểu, qua: mua làm quà',
  ten        VARCHAR(120) NOT NULL,
  ten_en     VARCHAR(120) NULL,
  mo_ta      VARCHAR(1000) NULL,
  mo_ta_en   VARCHAR(1000) NULL,
  thu_tu     INT NOT NULL DEFAULT 0,
  hien       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_vung (vung, loai, thu_tu)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS diem_thoi_tiet (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  vung       ENUM('cao-nguyen','bien-dao','dai-ngan') NOT NULL,
  ten        VARCHAR(80) NOT NULL,
  ten_en     VARCHAR(80) NULL,
  lat        DECIMAL(9,6) NOT NULL,
  lng        DECIMAL(9,6) NOT NULL,
  thu_tu     INT NOT NULL DEFAULT 0,
  hien       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_vung (vung, thu_tu)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TEMPORARY TABLE IF EXISTS mon_an_dau;
CREATE TEMPORARY TABLE mon_an_dau LIKE mon_an;
INSERT INTO mon_an_dau (vung, loai, ten, ten_en, mo_ta, mo_ta_en, thu_tu) VALUES
  ('cao-nguyen', 'mon', 'Bánh căn', 'Banh can', 'Bột gạo đổ vào khuôn đất nướng trên than, ăn nóng với nước chấm, xíu mại hoặc trứng. Hợp nhất vào sáng sớm và tối se lạnh.', 'Rice batter cooked in clay moulds over charcoal, eaten hot with dipping sauce, meatballs or egg. Best on chilly mornings and evenings.', 1),
  ('cao-nguyen', 'mon', 'Bánh tráng nướng', 'Grilled rice paper', 'Bánh tráng nướng giòn trên than với trứng, hành và đủ thứ nhân, món ăn vặt buổi tối quen thuộc của Đà Lạt.', 'Rice paper grilled crisp over charcoal with egg, spring onion and toppings, Da Lat''s classic evening snack.', 2),
  ('cao-nguyen', 'mon', 'Bánh mì xíu mại', 'Banh mi with meatball soup', 'Bánh mì chấm chén xíu mại nước dùng nóng, món ăn sáng của người Đà Lạt.', 'Bread dipped into a hot bowl of pork meatballs in broth, a Da Lat breakfast.', 3),
  ('cao-nguyen', 'mon', 'Lẩu gà lá é', 'Chicken hotpot with e leaves', 'Gà nấu với lá é, loại rau thơm nồng vị cay the, ăn giữa trời lạnh.', 'Chicken cooked with e, a pungent peppery herb, perfect in the cold.', 4),
  ('cao-nguyen', 'mon', 'Nem nướng', 'Grilled pork rolls', 'Nem nướng cuốn rau, chấm nước chấm sệt đậm vị.', 'Grilled pork sausage rolled with greens, dipped in a thick savoury sauce.', 5),
  ('cao-nguyen', 'mon', 'Sữa đậu nành nóng', 'Hot soy milk', 'Ly sữa đậu nành nóng với bánh ngọt bên lề đường vào buổi tối.', 'A hot cup of soy milk with pastries at a roadside stall in the evening.', 6),
  ('cao-nguyen', 'qua', 'Atiso (trà, cao)', 'Artichoke tea and extract', NULL, NULL, 1),
  ('cao-nguyen', 'qua', 'Mứt Đà Lạt', 'Da Lat candied fruit', NULL, NULL, 2),
  ('cao-nguyen', 'qua', 'Dâu tây', 'Strawberries', NULL, NULL, 3),
  ('cao-nguyen', 'qua', 'Hồng treo gió, hồng sấy', 'Dried persimmons', NULL, NULL, 4),
  ('cao-nguyen', 'qua', 'Rau củ cao nguyên', 'Highland vegetables', NULL, NULL, 5),
  ('cao-nguyen', 'qua', 'Cà phê', 'Coffee', NULL, NULL, 6),
  ('bien-dao', 'mon', 'Bánh canh chả cá Phan Thiết', 'Phan Thiet fishcake noodle soup', 'Sợi bánh canh trong nước dùng cá, ăn với chả cá chiên thái lát.', 'Thick noodles in fish broth with sliced fried fishcake.', 1),
  ('bien-dao', 'mon', 'Lẩu thả', 'Lau tha', 'Món cầu kỳ của Phan Thiết: cá, trứng, thịt, rau và bún xếp thành hình bông hoa, chan nước lẩu khi ăn.', 'An elaborate Phan Thiet dish: fish, egg, pork, herbs and noodles arranged like a flower, with hot broth poured over.', 2),
  ('bien-dao', 'mon', 'Gỏi cá mai', 'Ca mai fish salad', 'Cá mai tươi trộn thính, cuốn bánh tráng với rau sống, chấm nước chấm đậu phộng.', 'Fresh anchovy-like fish tossed with toasted rice powder, wrapped in rice paper with herbs and peanut sauce.', 3),
  ('bien-dao', 'mon', 'Bánh xèo khuôn', 'Mini banh xeo', 'Bánh xèo nhỏ đổ trong khuôn đất, nhân tôm mực, ăn với rau và nước chấm.', 'Small crispy pancakes cooked in clay moulds with shrimp or squid, eaten with herbs and dipping sauce.', 4),
  ('bien-dao', 'mon', 'Dông nướng', 'Grilled sand lizard', 'Dông cát, đặc sản vùng đồi cát ven biển, nướng hoặc xào lăn.', 'Sand lizard, a speciality of the coastal dunes, grilled or stir-fried.', 5),
  ('bien-dao', 'mon', 'Cua mặt trăng Phú Quý', 'Phu Quy moon crab', 'Loại cua có đốm tròn trên mai, đặc sản của đảo Phú Quý.', 'A crab with round spots on its shell, a speciality of Phu Quy island.', 6),
  ('bien-dao', 'qua', 'Nước mắm Phan Thiết', 'Phan Thiet fish sauce', NULL, NULL, 1),
  ('bien-dao', 'qua', 'Thanh long', 'Dragon fruit', NULL, NULL, 2),
  ('bien-dao', 'qua', 'Mực một nắng', 'Sun-dried squid', NULL, NULL, 3),
  ('bien-dao', 'qua', 'Hải sản khô', 'Dried seafood', NULL, NULL, 4),
  ('bien-dao', 'qua', 'Cốm hộc', 'Com hoc sweets', NULL, NULL, 5),
  ('dai-ngan', 'mon', 'Cơm lam', 'Bamboo-tube rice', 'Gạo nếp cho vào ống tre, ống nứa nướng trên lửa, ăn với muối vừng hoặc gà nướng.', 'Sticky rice cooked in bamboo tubes over the fire, eaten with sesame salt or grilled chicken.', 1),
  ('dai-ngan', 'mon', 'Gà nướng', 'Grilled chicken', 'Gà thả đồi nướng than, chấm muối ớt, hay ăn cùng cơm lam.', 'Free-range chicken grilled over charcoal with chilli salt, often served with bamboo-tube rice.', 2),
  ('dai-ngan', 'mon', 'Canh thụt', 'Canh thut', 'Món của đồng bào bản địa: rau rừng, cà đắng, thịt hoặc cá cho vào ống nứa, dùng que thụt cho nhuyễn rồi nấu.', 'An indigenous dish: forest greens, bitter eggplant and meat or fish packed into a bamboo tube, pounded and cooked.', 3),
  ('dai-ngan', 'mon', 'Cà đắng', 'Bitter eggplant', 'Cà đắng nấu, xào hoặc giã, vị đắng nhẹ rất riêng của núi rừng.', 'Bitter eggplant stewed, stir-fried or pounded, with a mild, distinctive bitterness.', 4),
  ('dai-ngan', 'mon', 'Lá bép xào', 'Stir-fried bep leaves', 'Lá rừng mềm, xào tỏi hoặc nấu canh, món rau quen thuộc của vùng.', 'Tender forest leaves stir-fried with garlic or cooked in soup.', 5),
  ('dai-ngan', 'mon', 'Rượu cần', 'Rice wine through straws', 'Uống chung qua cần trúc trong dịp lễ hội, gắn với văn hoá cồng chiêng.', 'Shared through bamboo straws at festivals, part of gong culture.', 6),
  ('dai-ngan', 'qua', 'Cà phê', 'Coffee', NULL, NULL, 1),
  ('dai-ngan', 'qua', 'Hồ tiêu', 'Black pepper', NULL, NULL, 2),
  ('dai-ngan', 'qua', 'Hạt mắc ca', 'Macadamia nuts', NULL, NULL, 3),
  ('dai-ngan', 'qua', 'Sầu riêng (theo mùa)', 'Durian (in season)', NULL, NULL, 4),
  ('dai-ngan', 'qua', 'Bơ (theo mùa)', 'Avocado (in season)', NULL, NULL, 5);
SET @trong := (SELECT COUNT(*) = 0 FROM mon_an);
INSERT INTO mon_an (vung, loai, ten, ten_en, mo_ta, mo_ta_en, thu_tu)
  SELECT vung, loai, ten, ten_en, mo_ta, mo_ta_en, thu_tu FROM mon_an_dau WHERE @trong ORDER BY id;
DROP TEMPORARY TABLE mon_an_dau;

DROP TEMPORARY TABLE IF EXISTS diem_thoi_tiet_dau;
CREATE TEMPORARY TABLE diem_thoi_tiet_dau LIKE diem_thoi_tiet;
INSERT INTO diem_thoi_tiet_dau (vung, ten, ten_en, lat, lng, thu_tu) VALUES
  ('cao-nguyen', 'Đà Lạt', 'Da Lat', 11.9404, 108.4583, 1),
  ('bien-dao', 'Phan Thiết', 'Phan Thiet', 10.9289, 108.1021, 1),
  ('bien-dao', 'Mũi Né', 'Mui Ne', 10.9483, 108.3005, 2),
  ('bien-dao', 'Đảo Phú Quý', 'Phu Quy Island', 10.52, 108.935, 3),
  ('dai-ngan', 'Gia Nghĩa', 'Gia Nghia', 12.0042, 107.6907, 1),
  ('dai-ngan', 'Hồ Tà Đùng', 'Ta Dung Lake', 11.867, 107.983, 2);
SET @trong := (SELECT COUNT(*) = 0 FROM diem_thoi_tiet);
INSERT INTO diem_thoi_tiet (vung, ten, ten_en, lat, lng, thu_tu)
  SELECT vung, ten, ten_en, lat, lng, thu_tu FROM diem_thoi_tiet_dau WHERE @trong ORDER BY id;
DROP TEMPORARY TABLE diem_thoi_tiet_dau;
