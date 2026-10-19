/**
 * KIỂM THỬ: Ăn gì ở Lâm Đồng, điểm dự báo thời tiết, loại tin ưu đãi.
 * Chạy đường dẫn thật qua HTTP với pool giả (không cần MySQL), như du-lich.test.js.
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { datBienMoiTruongHopLe } from './helpers-test.js';

datBienMoiTruongHopLe();
const { pool } = await import('../src/db.js');
const { signAccessToken } = await import('../src/lib/token.js');
const { requireAuth, xoaDemTrangThai } = await import('../src/middleware/auth.js');
const congKhai = (await import('../src/routes/cong-khai.js')).default;
const quanTri = (await import('../src/routes/quan-tri.js')).default;

let goi = [];
let thieuBang = false;           // giả lập máy chủ chưa tự nâng cấp xong
let thieuCotVung = false;        // giả lập bảng tin_tuc chưa có cột vung
pool.query = async (sql, params = []) => {
  goi.push({ sql, params });
  if (/SELECT is_active FROM staff/i.test(sql)) return [[{ is_active: 1 }]];
  if (thieuBang && /FROM (mon_an|diem_thoi_tiet)/i.test(sql)) { const e = new Error('no table'); e.code = 'ER_NO_SUCH_TABLE'; throw e; }
  if (/FROM mon_an WHERE hien = 1/i.test(sql)) return [[{ id: 1, vung: 'cao-nguyen', loai: 'mon', ten: 'Bánh căn', ten_en: 'Banh can', mo_ta: 'Mô tả', mo_ta_en: null }]];
  if (/FROM diem_thoi_tiet WHERE hien = 1/i.test(sql)) return [[{ id: 1, vung: 'bien-dao', ten: 'Mũi Né', ten_en: 'Mui Ne', lat: '10.948300', lng: '108.300500' }]];
  if (thieuCotVung && /tin_tuc SET/i.test(sql) && params[0] && 'vung' in params[0]) { const e = new Error('Unknown column vung'); e.code = 'ER_BAD_FIELD_ERROR'; throw e; }
  return [{ affectedRows: 1, insertId: 7 }];
};

const app = express();
app.use(express.json());
app.use('/api/cong-khai', congKhai);
app.use('/api/quan-tri', requireAuth, quanTri);
let may, goc;
before(async () => { may = app.listen(0); await new Promise((r) => may.once('listening', r)); goc = `http://127.0.0.1:${may.address().port}`; });
after(() => may.close());
const ve = signAccessToken({ id: 1, username: 'u1', role: 'admin', full_name: 'Cán bộ' });
const goiApi = (duong, { method = 'GET', body, token } = {}) => fetch(goc + duong, { method,
  headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined });

test('công khai: danh sách món ăn và điểm thời tiết đúng dạng, toạ độ là số', async () => {
  thieuBang = false;
  const mon = await (await goiApi('/api/cong-khai/mon-an')).json();
  assert.deepEqual(mon[0], { id: 1, vung: 'cao-nguyen', loai: 'mon', ten: 'Bánh căn', tenEn: 'Banh can', moTa: 'Mô tả', moTaEn: null });
  const diem = await (await goiApi('/api/cong-khai/diem-thoi-tiet')).json();
  assert.equal(diem[0].lat, 10.9483);
  assert.equal(typeof diem[0].lng, 'number');
});

test('công khai: bảng chưa có thì trả null (giao diện dùng danh sách dựng sẵn), không báo lỗi', async () => {
  thieuBang = true;
  const r1 = await goiApi('/api/cong-khai/mon-an'), r2 = await goiApi('/api/cong-khai/diem-thoi-tiet');
  assert.equal(r1.status, 200); assert.equal(await r1.json(), null);
  assert.equal(r2.status, 200); assert.equal(await r2.json(), null);
  thieuBang = false;
});

test('quản trị: món ăn thiếu vùng, sai loại, thiếu tên -> 400', async () => {
  xoaDemTrangThai();
  for (const body of [{ loai: 'mon', ten: 'A' }, { vung: 'cao-nguyen', loai: 'khac', ten: 'A' }, { vung: 'cao-nguyen', loai: 'mon', ten: '  ' }]) {
    const r = await goiApi('/api/quan-tri/mon-an', { method: 'POST', token: ve, body });
    assert.equal(r.status, 400);
  }
});

test('quản trị: thêm món hợp lệ -> 201 và ghi nhật ký', async () => {
  goi = [];
  const r = await goiApi('/api/quan-tri/mon-an', { method: 'POST', token: ve, body: { vung: 'bien-dao', loai: 'qua', ten: 'Nước mắm Phan Thiết' } });
  assert.equal(r.status, 201);
  assert.ok(goi.some((g) => /INSERT INTO mon_an/i.test(g.sql)));
  assert.ok(goi.some((g) => /staff_activity_logs|nhat_ky/i.test(g.sql)), 'phải ghi nhật ký');
});

test('quản trị: điểm thời tiết ngoài tỉnh hoặc đảo vĩ độ, kinh độ -> 400', async () => {
  for (const body of [{ vung: 'bien-dao', ten: 'Hà Nội', lat: 21.03, lng: 105.85 }, { vung: 'cao-nguyen', ten: 'Đà Lạt', lat: 108.45, lng: 11.94 }]) {
    const r = await goiApi('/api/quan-tri/diem-thoi-tiet', { method: 'POST', token: ve, body });
    assert.equal(r.status, 400);
    assert.match((await r.json()).error, /Lâm Đồng/);
  }
});

test('quản trị: điểm thời tiết nhận dấu phẩy thập phân', async () => {
  goi = [];
  const r = await goiApi('/api/quan-tri/diem-thoi-tiet', { method: 'POST', token: ve, body: { vung: 'cao-nguyen', ten: 'Bảo Lộc', lat: '11,548', lng: '107,8077' } });
  assert.equal(r.status, 201);
  const ins = goi.find((g) => /INSERT INTO diem_thoi_tiet/i.test(g.sql));
  assert.equal(ins.params[0].lat, 11.548);
});

test('tin ưu đãi: nhận loại uu-dai kèm vùng', async () => {
  goi = []; thieuCotVung = false;
  const r = await goiApi('/api/quan-tri/tin-tuc', { method: 'POST', token: ve, body: { loai: 'uu-dai', tieuDe: 'Giảm 20%', vung: 'bien-dao' } });
  assert.equal(r.status, 201);
  assert.equal(goi.find((g) => /INSERT INTO tin_tuc/i.test(g.sql)).params[0].vung, 'bien-dao');
});

test('tin ưu đãi: cơ sở dữ liệu chưa có cột vung thì vẫn lưu được (bỏ vùng)', async () => {
  goi = []; thieuCotVung = true;
  const r = await goiApi('/api/quan-tri/tin-tuc', { method: 'POST', token: ve, body: { loai: 'uu-dai', tieuDe: 'Giảm 20%', vung: 'bien-dao' } });
  assert.equal(r.status, 201);
  const lan = goi.filter((g) => /INSERT INTO tin_tuc/i.test(g.sql));
  assert.equal(lan.length, 2, 'lần đầu lỗi thiếu cột, lần sau lưu không kèm vùng');
  assert.ok(!('vung' in lan[1].params[0]));
  thieuCotVung = false;
});
