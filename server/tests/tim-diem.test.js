/**
 * Ô tìm ở đầu trang chủ và danh sách Khám phá dùng chung src/utils/timDiem.ts.
 * Chạy thẳng tệp TypeScript (Node 22 tự bỏ kiểu); máy chạy Node cũ thì bỏ qua.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

const BO_QUA = Number(process.versions.node.split('.')[0]) < 22 && 'cần Node 22 trở lên để chạy thẳng tệp .ts';
const nap = () => import(new URL('../../src/utils/timDiem.ts', import.meta.url).href);

const DS = [
  { id: 'ho-xuan-huong', ten: 'Hồ Xuân Hương', tenEn: 'Xuan Huong Lake', xa: 'Phường Xuân Hương - Đà Lạt' },
  { id: 'ho-ta-dung', ten: 'Hồ Tà Đùng', tenEn: 'Ta Dung Lake', xa: 'Xã Tà Đùng' },
  { id: 'ga-da-lat', ten: 'Ga Đà Lạt', tenEn: 'Da Lat Railway Station', xa: 'Phường Xuân Hương - Đà Lạt' },
  { id: 'dao-phu-quy', ten: 'Đảo Phú Quý', tenEn: 'Phu Quy Island', xa: 'Đặc khu Phú Quý' },
];
const ids = (ds) => ds.map((p) => p.id);

test('có dấu, không dấu, hoa thường đều ra; nhiều từ không cần đúng thứ tự', { skip: BO_QUA }, async () => {
  const { timDiem } = await nap();
  for (const q of ['hồ Tà Đùng', 'ho ta dung', 'HO TA DUNG', 'dung ho', '  ta   dung  ']) {
    assert.deepEqual(ids(timDiem(DS, q)), ['ho-ta-dung'], q);
  }
  assert.deepEqual(ids(timDiem(DS, 'dao')), ['dao-phu-quy'], '"đ" gõ thành "d"');
  assert.deepEqual(timDiem(DS, '   '), []);
  assert.deepEqual(timDiem(DS, 'khong co dau'), []);
});

test('xếp hạng: tên bắt đầu bằng từ gõ đứng trước điểm chỉ khớp ở xã', { skip: BO_QUA }, async () => {
  const { timDiem } = await nap();
  /* "da lat": Ga Đà Lạt khớp ở tên; Hồ Xuân Hương chỉ khớp ở xã (…Đà Lạt) -> đứng sau */
  assert.deepEqual(ids(timDiem(DS, 'da lat')), ['ga-da-lat', 'ho-xuan-huong']);
  assert.deepEqual(ids(timDiem(DS, 'ho')), ['ho-xuan-huong', 'ho-ta-dung'], 'cùng hạng giữ thứ tự gốc');
  assert.equal(timDiem(DS, 'a', 2).length, 2, 'giới hạn số gợi ý');
});

test('khopDiem (danh sách Khám phá) cùng kết quả với gợi ý', { skip: BO_QUA }, async () => {
  const { timDiem, khopDiem } = await nap();
  for (const q of ['dung ho', 'da lat', 'xuan', 'phu quy dao', 'zzz']) {
    assert.deepEqual(ids(DS.filter((p) => khopDiem(p, q))).sort(), ids(timDiem(DS, q)).sort(), q);
  }
  assert.ok(DS.every((p) => khopDiem(p, '')), 'ô trống thì không lọc');
});

test('toDam: tô đúng chỗ khớp trên tên có dấu', { skip: BO_QUA }, async () => {
  const { toDam } = await nap();
  assert.deepEqual(toDam('Hồ Tà Đùng', 'ta dung'), [{ chu: 'Hồ ', khop: false }, { chu: 'Tà', khop: true }, { chu: ' ', khop: false }, { chu: 'Đùng', khop: true }]);
  assert.deepEqual(toDam('Ga Đà Lạt', 'zzz'), [{ chu: 'Ga Đà Lạt', khop: false }]);
});
