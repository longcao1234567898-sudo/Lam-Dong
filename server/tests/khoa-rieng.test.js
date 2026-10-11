/**
 * Web Đồng Nai và web Lâm Đồng có thể dùng chung giá trị JWT_SECRET. Phiên
 * đăng nhập ký thẳng bằng giá trị đó (kiểu web Đồng Nai) KHÔNG được web Lâm
 * Đồng chấp nhận, và phiên của Lâm Đồng không ký bằng giá trị thô.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { datBienMoiTruongHopLe, TEST_JWT_SECRET } from './helpers-test.js';

datBienMoiTruongHopLe();
const { signAccessToken, verifyAccessToken } = await import('../src/lib/token.js');

test('phiên đăng nhập của web khác dùng chung JWT_SECRET bị từ chối', () => {
  const cuaDongNai = jwt.sign({ sub: 1, username: 'admin', role: 'admin', name: 'A' }, TEST_JWT_SECRET, { expiresIn: '8h' });
  assert.throws(() => verifyAccessToken(cuaDongNai));
});

test('phiên của web Lâm Đồng hợp lệ ở chính nó, không ký bằng giá trị thô của JWT_SECRET', () => {
  const t = signAccessToken({ id: 1, username: 'admin', role: 'admin', full_name: 'A' });
  assert.equal(verifyAccessToken(t).sub, 1);
  assert.throws(() => jwt.verify(t, TEST_JWT_SECRET, { algorithms: ['HS256'] }));
});
