/**
 * Nội dung dựng sẵn cho trang 'Ăn gì' và khối thời tiết ba vùng. Từ nay cán bộ sửa ở khu
 * quản trị (bảng mon_an, diem_thoi_tiet, có cùng dữ liệu ban đầu); danh sách này chỉ dùng khi
 * máy chủ chưa có bảng (vừa cập nhật mã, chưa tự nâng cấp xong) hoặc không trả lời được.
 */
import type { DiemThoiTiet, MonAn } from './kieu';

export const MON_AN_MAC_DINH: MonAn[] = [
  { id: -1, vung: 'cao-nguyen', loai: 'mon', ten: 'Bánh căn', tenEn: 'Banh can', moTa: 'Bột gạo đổ vào khuôn đất nướng trên than, ăn nóng với nước chấm, xíu mại hoặc trứng. Hợp nhất vào sáng sớm và tối se lạnh.', moTaEn: 'Rice batter cooked in clay moulds over charcoal, eaten hot with dipping sauce, meatballs or egg. Best on chilly mornings and evenings.' },
  { id: -2, vung: 'cao-nguyen', loai: 'mon', ten: 'Bánh tráng nướng', tenEn: 'Grilled rice paper', moTa: 'Bánh tráng nướng giòn trên than với trứng, hành và đủ thứ nhân, món ăn vặt buổi tối quen thuộc của Đà Lạt.', moTaEn: 'Rice paper grilled crisp over charcoal with egg, spring onion and toppings, Da Lat\'s classic evening snack.' },
  { id: -3, vung: 'cao-nguyen', loai: 'mon', ten: 'Bánh mì xíu mại', tenEn: 'Banh mi with meatball soup', moTa: 'Bánh mì chấm chén xíu mại nước dùng nóng, món ăn sáng của người Đà Lạt.', moTaEn: 'Bread dipped into a hot bowl of pork meatballs in broth, a Da Lat breakfast.' },
  { id: -4, vung: 'cao-nguyen', loai: 'mon', ten: 'Lẩu gà lá é', tenEn: 'Chicken hotpot with e leaves', moTa: 'Gà nấu với lá é, loại rau thơm nồng vị cay the, ăn giữa trời lạnh.', moTaEn: 'Chicken cooked with e, a pungent peppery herb, perfect in the cold.' },
  { id: -5, vung: 'cao-nguyen', loai: 'mon', ten: 'Nem nướng', tenEn: 'Grilled pork rolls', moTa: 'Nem nướng cuốn rau, chấm nước chấm sệt đậm vị.', moTaEn: 'Grilled pork sausage rolled with greens, dipped in a thick savoury sauce.' },
  { id: -6, vung: 'cao-nguyen', loai: 'mon', ten: 'Sữa đậu nành nóng', tenEn: 'Hot soy milk', moTa: 'Ly sữa đậu nành nóng với bánh ngọt bên lề đường vào buổi tối.', moTaEn: 'A hot cup of soy milk with pastries at a roadside stall in the evening.' },
  { id: -7, vung: 'cao-nguyen', loai: 'qua', ten: 'Atiso (trà, cao)', tenEn: 'Artichoke tea and extract', moTa: null, moTaEn: null },
  { id: -8, vung: 'cao-nguyen', loai: 'qua', ten: 'Mứt Đà Lạt', tenEn: 'Da Lat candied fruit', moTa: null, moTaEn: null },
  { id: -9, vung: 'cao-nguyen', loai: 'qua', ten: 'Dâu tây', tenEn: 'Strawberries', moTa: null, moTaEn: null },
  { id: -10, vung: 'cao-nguyen', loai: 'qua', ten: 'Hồng treo gió, hồng sấy', tenEn: 'Dried persimmons', moTa: null, moTaEn: null },
  { id: -11, vung: 'cao-nguyen', loai: 'qua', ten: 'Rau củ cao nguyên', tenEn: 'Highland vegetables', moTa: null, moTaEn: null },
  { id: -12, vung: 'cao-nguyen', loai: 'qua', ten: 'Cà phê', tenEn: 'Coffee', moTa: null, moTaEn: null },
  { id: -13, vung: 'bien-dao', loai: 'mon', ten: 'Bánh canh chả cá Phan Thiết', tenEn: 'Phan Thiet fishcake noodle soup', moTa: 'Sợi bánh canh trong nước dùng cá, ăn với chả cá chiên thái lát.', moTaEn: 'Thick noodles in fish broth with sliced fried fishcake.' },
  { id: -14, vung: 'bien-dao', loai: 'mon', ten: 'Lẩu thả', tenEn: 'Lau tha', moTa: 'Món cầu kỳ của Phan Thiết: cá, trứng, thịt, rau và bún xếp thành hình bông hoa, chan nước lẩu khi ăn.', moTaEn: 'An elaborate Phan Thiet dish: fish, egg, pork, herbs and noodles arranged like a flower, with hot broth poured over.' },
  { id: -15, vung: 'bien-dao', loai: 'mon', ten: 'Gỏi cá mai', tenEn: 'Ca mai fish salad', moTa: 'Cá mai tươi trộn thính, cuốn bánh tráng với rau sống, chấm nước chấm đậu phộng.', moTaEn: 'Fresh anchovy-like fish tossed with toasted rice powder, wrapped in rice paper with herbs and peanut sauce.' },
  { id: -16, vung: 'bien-dao', loai: 'mon', ten: 'Bánh xèo khuôn', tenEn: 'Mini banh xeo', moTa: 'Bánh xèo nhỏ đổ trong khuôn đất, nhân tôm mực, ăn với rau và nước chấm.', moTaEn: 'Small crispy pancakes cooked in clay moulds with shrimp or squid, eaten with herbs and dipping sauce.' },
  { id: -17, vung: 'bien-dao', loai: 'mon', ten: 'Dông nướng', tenEn: 'Grilled sand lizard', moTa: 'Dông cát, đặc sản vùng đồi cát ven biển, nướng hoặc xào lăn.', moTaEn: 'Sand lizard, a speciality of the coastal dunes, grilled or stir-fried.' },
  { id: -18, vung: 'bien-dao', loai: 'mon', ten: 'Cua mặt trăng Phú Quý', tenEn: 'Phu Quy moon crab', moTa: 'Loại cua có đốm tròn trên mai, đặc sản của đảo Phú Quý.', moTaEn: 'A crab with round spots on its shell, a speciality of Phu Quy island.' },
  { id: -19, vung: 'bien-dao', loai: 'qua', ten: 'Nước mắm Phan Thiết', tenEn: 'Phan Thiet fish sauce', moTa: null, moTaEn: null },
  { id: -20, vung: 'bien-dao', loai: 'qua', ten: 'Thanh long', tenEn: 'Dragon fruit', moTa: null, moTaEn: null },
  { id: -21, vung: 'bien-dao', loai: 'qua', ten: 'Mực một nắng', tenEn: 'Sun-dried squid', moTa: null, moTaEn: null },
  { id: -22, vung: 'bien-dao', loai: 'qua', ten: 'Hải sản khô', tenEn: 'Dried seafood', moTa: null, moTaEn: null },
  { id: -23, vung: 'bien-dao', loai: 'qua', ten: 'Cốm hộc', tenEn: 'Com hoc sweets', moTa: null, moTaEn: null },
  { id: -24, vung: 'dai-ngan', loai: 'mon', ten: 'Cơm lam', tenEn: 'Bamboo-tube rice', moTa: 'Gạo nếp cho vào ống tre, ống nứa nướng trên lửa, ăn với muối vừng hoặc gà nướng.', moTaEn: 'Sticky rice cooked in bamboo tubes over the fire, eaten with sesame salt or grilled chicken.' },
  { id: -25, vung: 'dai-ngan', loai: 'mon', ten: 'Gà nướng', tenEn: 'Grilled chicken', moTa: 'Gà thả đồi nướng than, chấm muối ớt, hay ăn cùng cơm lam.', moTaEn: 'Free-range chicken grilled over charcoal with chilli salt, often served with bamboo-tube rice.' },
  { id: -26, vung: 'dai-ngan', loai: 'mon', ten: 'Canh thụt', tenEn: 'Canh thut', moTa: 'Món của đồng bào bản địa: rau rừng, cà đắng, thịt hoặc cá cho vào ống nứa, dùng que thụt cho nhuyễn rồi nấu.', moTaEn: 'An indigenous dish: forest greens, bitter eggplant and meat or fish packed into a bamboo tube, pounded and cooked.' },
  { id: -27, vung: 'dai-ngan', loai: 'mon', ten: 'Cà đắng', tenEn: 'Bitter eggplant', moTa: 'Cà đắng nấu, xào hoặc giã, vị đắng nhẹ rất riêng của núi rừng.', moTaEn: 'Bitter eggplant stewed, stir-fried or pounded, with a mild, distinctive bitterness.' },
  { id: -28, vung: 'dai-ngan', loai: 'mon', ten: 'Lá bép xào', tenEn: 'Stir-fried bep leaves', moTa: 'Lá rừng mềm, xào tỏi hoặc nấu canh, món rau quen thuộc của vùng.', moTaEn: 'Tender forest leaves stir-fried with garlic or cooked in soup.' },
  { id: -29, vung: 'dai-ngan', loai: 'mon', ten: 'Rượu cần', tenEn: 'Rice wine through straws', moTa: 'Uống chung qua cần trúc trong dịp lễ hội, gắn với văn hoá cồng chiêng.', moTaEn: 'Shared through bamboo straws at festivals, part of gong culture.' },
  { id: -30, vung: 'dai-ngan', loai: 'qua', ten: 'Cà phê', tenEn: 'Coffee', moTa: null, moTaEn: null },
  { id: -31, vung: 'dai-ngan', loai: 'qua', ten: 'Hồ tiêu', tenEn: 'Black pepper', moTa: null, moTaEn: null },
  { id: -32, vung: 'dai-ngan', loai: 'qua', ten: 'Hạt mắc ca', tenEn: 'Macadamia nuts', moTa: null, moTaEn: null },
  { id: -33, vung: 'dai-ngan', loai: 'qua', ten: 'Sầu riêng (theo mùa)', tenEn: 'Durian (in season)', moTa: null, moTaEn: null },
  { id: -34, vung: 'dai-ngan', loai: 'qua', ten: 'Bơ (theo mùa)', tenEn: 'Avocado (in season)', moTa: null, moTaEn: null },
];

/** Nơi tiêu biểu xem thời tiết từng vùng: toạ độ trung tâm, đủ cho dự báo theo ô lưới vài km. */
export const DIEM_THOI_TIET_MAC_DINH: DiemThoiTiet[] = [
  { id: -1, vung: 'cao-nguyen', ten: 'Đà Lạt', tenEn: 'Da Lat', lat: 11.9404, lng: 108.4583 },
  { id: -2, vung: 'bien-dao', ten: 'Phan Thiết', tenEn: 'Phan Thiet', lat: 10.9289, lng: 108.1021 },
  { id: -3, vung: 'bien-dao', ten: 'Mũi Né', tenEn: 'Mui Ne', lat: 10.9483, lng: 108.3005 },
  { id: -4, vung: 'bien-dao', ten: 'Đảo Phú Quý', tenEn: 'Phu Quy Island', lat: 10.52, lng: 108.935 },
  { id: -5, vung: 'dai-ngan', ten: 'Gia Nghĩa', tenEn: 'Gia Nghia', lat: 12.0042, lng: 107.6907 },
  { id: -6, vung: 'dai-ngan', ten: 'Hồ Tà Đùng', tenEn: 'Ta Dung Lake', lat: 11.867, lng: 107.983 },
];
