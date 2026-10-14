/**
 * ẢNH 360° GOOGLE KIỂU "svembed" — GẮN SẴN CHO 15 ĐIỂM ĐẾN
 *
 * Mã nhúng Street View kiểu cũ (maps.google.com/maps?layer=c&cbll=VĨ,KINH&output=svembed)
 * không cần khoá API và chỉ cần toạ độ — cán bộ có sẵn mã kiểu này cho cả 15 điểm.
 * Trước đây máy chủ chỉ nhận mã "Chia sẻ → Nhúng bản đồ" (/maps/embed?pb=…!6m…), nên dán
 * vào là bị từ chối. Máy chủ KHÔNG lưu nguyên chuỗi người dán: đọc ra toạ độ và hướng
 * nhìn (số đã kiểm), rồi tự dựng lại đường dẫn — không tham số lạ nào lọt vào iframe.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { datBienMoiTruongHopLe } from './helpers-test.js';

datBienMoiTruongHopLe();
const { docNhungGoogle } = await import('../src/routes/noi-dung.js');

const HXH = 'https://maps.google.com/maps?layer=c&cbll=11.944252,108.447478&cbp=12,0,0,0,0&output=svembed';

test('nhận mã svembed (cả thẻ iframe hoặc chỉ đường dẫn), dựng lại đường dẫn chuẩn', () => {
  const iframe = `<iframe src="${HXH}" width="100%" height="450" style="border:0" allowfullscreen loading="lazy"></iframe>`;
  assert.deepEqual(docNhungGoogle(iframe), { url: HXH });
  assert.deepEqual(docNhungGoogle(HXH.replace(/&/g, '&amp;')), { url: HXH });
  /* www.google.com cùng là Google; hướng nhìn giữ lại; tham số lạ bị bỏ khi dựng lại */
  assert.deepEqual(docNhungGoogle('https://www.google.com/maps?layer=c&cbll=10.9334,108.2825&cbp=12,75.5,0,0,0&output=svembed&la=x'),
    { url: 'https://maps.google.com/maps?layer=c&cbll=10.9334,108.2825&cbp=12,75.5,0,0,0&output=svembed' });
  assert.deepEqual(docNhungGoogle('https://maps.google.com/maps?layer=c&cbll=12.5,107.9&output=svembed'),
    { url: 'https://maps.google.com/maps?layer=c&cbll=12.5,107.9&cbp=12,0,0,0,0&output=svembed' });
});

test('từ chối svembed sai: toạ độ hỏng, không phải ảnh 360°, máy khác, http', () => {
  for (const sai of [
    'https://maps.google.com/maps?layer=c&cbll=91,108&output=svembed',
    'https://maps.google.com/maps?layer=c&cbll=11.9,abc&output=svembed',
    'https://maps.google.com/maps?layer=c&cbll=11.9,108.4"><script>&output=svembed',
    'https://maps.google.com/maps?layer=c&output=svembed',
    'https://maps.google.com/maps?q=da+lat&output=embed',
    'https://maps.google.com/maps?layer=c&cbll=11.9,108.4&output=svembed&cbp=12,9999,0,0,0',
    'https://evil.example/maps?layer=c&cbll=11.9,108.4&output=svembed',
    'https://maps.google.com.evil.example/maps?layer=c&cbll=11.9,108.4&output=svembed',
    'http://maps.google.com/maps?layer=c&cbll=11.9,108.4&output=svembed',
  ]) assert.ok(docNhungGoogle(sai).loi, `phải từ chối: ${sai}`);
});

test('mã nhúng kiểu cũ /maps/embed?pb=…!6m… vẫn nhận như trước', () => {
  const SV = 'https://www.google.com/maps/embed?pb=!4v1760000000000!6m8!1m7!1sCAoSLEFGMVFpcE1abc-_XYZ!2m2!1d10.9645!2d106.8016!3f75.5!4f0!5f0.78';
  assert.deepEqual(docNhungGoogle(SV), { url: SV });
});

test('tệp CSDL gắn sẵn ảnh 360° Google cho đủ 15 điểm đến, mỗi đường dẫn qua được bộ kiểm', async () => {
  const sql = await readFile(new URL('../../database/du_lich_lam_dong.sql', import.meta.url), 'utf8');
  const bangDiem = sql.slice(sql.indexOf('INSERT IGNORE INTO dia_diem ('));
  const diemDen = new Set([...bangDiem.slice(0, bangDiem.indexOf(';\n')).matchAll(/^\s*\('([a-z0-9-]+)',/gm)].map((m) => m[1]));
  assert.ok(diemDen.size >= 15, 'không đọc được danh sách điểm đến nạp sẵn — cách đọc tệp đã hỏng');
  const khoi = sql.slice(sql.indexOf('ẢNH 360° GOOGLE GẮN SẴN'));
  assert.ok(khoi.length > 100, 'thiếu mục "ẢNH 360° GOOGLE GẮN SẴN" trong database/du_lich_lam_dong.sql');
  const dong = [...khoi.matchAll(/\('([a-z0-9-]+)',\s*'[^']+',\s*'[^']+',\s*'(https:[^']+)'\)/g)];
  const ids = dong.map((m) => m[1]);
  assert.equal(new Set(ids).size, 15, `cần đủ 15 điểm đến khác nhau, đang có ${new Set(ids).size}`);
  for (const [, id, url] of dong) {
    assert.deepEqual(docNhungGoogle(url), { url }, `${id}: đường dẫn phải đúng dạng chuẩn máy chủ tự dựng`);
    assert.ok(diemDen.has(id), `${id} không có trong bảng dia_diem nạp sẵn`);
  }
  /* Chạy lại tệp không được thêm trùng */
  assert.match(khoi, /NOT EXISTS\s*\(\s*SELECT 1 FROM diem_quan_sat/i, 'phải có NOT EXISTS để chạy lại không thêm trùng');
});
