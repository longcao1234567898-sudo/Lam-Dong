/**
 * Tìm điểm đến — dùng chung cho ô tìm ở đầu trang chủ (gợi ý ngay khi gõ) và danh
 * sách Khám phá (sau khi bấm Tìm), để hai chỗ luôn ra cùng một kết quả.
 *
 * Gõ không dấu vẫn ra ("ta dung" ra "Hồ Tà Đùng"); gõ nhiều từ thì mỗi từ phải có
 * mặt, không cần đúng thứ tự ("dung ho" vẫn ra). Xếp hạng: tên bắt đầu bằng từ gõ >
 * có một từ trong tên bắt đầu bằng từ gõ > tên chứa từ gõ > chỉ khớp xã, địa chỉ.
 */

/** Không dùng kiểu DiaDiem để tệp này chạy được thẳng trong bộ test của máy chủ. */
export interface DiemTim { ten: string; tenEn?: string | null; xa?: string | null; diaChi?: string | null }

/** Bỏ dấu, chữ thường: "Đà Lạt" -> "da lat". */
export const boDau = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[đĐ]/g, 'd').toLowerCase();

const tuKhoa = (q: string) => boDau(q).split(/\s+/).filter(Boolean);

/** Điểm khớp thấp hơn là khớp tốt hơn; null = không khớp. */
function diemKhop(p: DiemTim, tu: string[]): number | null {
  const ten = boDau(`${p.ten} ${p.tenEn || ''}`);
  const tatCa = `${ten} ${boDau(`${p.xa || ''} ${p.diaChi || ''}`)}`;
  if (!tu.every((t) => tatCa.includes(t))) return null;
  const cau = tu.join(' ');
  if (ten.startsWith(cau)) return 0;
  if (ten.split(/\s+/).some((w) => w.startsWith(tu[0]))) return 1;
  if (tu.every((t) => ten.includes(t))) return 2;
  return 3;
}

export const khopDiem = (p: DiemTim, q: string): boolean => {
  const tu = tuKhoa(q);
  return !tu.length || diemKhop(p, tu) !== null;
};

/** Các điểm khớp, xếp khớp tốt trước; cùng hạng giữ nguyên thứ tự gốc. */
export function timDiem<T extends DiemTim>(ds: T[], q: string, toiDa = Infinity): T[] {
  const tu = tuKhoa(q);
  if (!tu.length) return [];
  return ds.map((p, i) => ({ p, i, d: diemKhop(p, tu) }))
    .filter((x): x is { p: T; i: number; d: number } => x.d !== null)
    .sort((a, b) => a.d - b.d || a.i - b.i)
    .slice(0, toiDa).map((x) => x.p);
}

/**
 * Cắt tên thành các đoạn để tô đậm chỗ khớp: [{ chu, khop }]. So khớp trên bản bỏ
 * dấu nhưng cắt trên tên gốc (mỗi chữ có dấu dựng sẵn bỏ dấu vẫn là một chữ).
 */
export function toDam(ten: string, q: string): { chu: string; khop: boolean }[] {
  const chu = [...ten];
  const ban = chu.map((c) => boDau(c));
  if (ban.some((b) => b.length !== 1)) return [{ chu: ten, khop: false }];
  const phang = ban.join('');
  const danh = new Array<boolean>(chu.length).fill(false);
  for (const t of tuKhoa(q)) {
    for (let i = phang.indexOf(t); i >= 0; i = phang.indexOf(t, i + 1)) danh.fill(true, i, i + t.length);
  }
  const ra: { chu: string; khop: boolean }[] = [];
  chu.forEach((c, i) => {
    const cuoi = ra[ra.length - 1];
    if (cuoi && cuoi.khop === danh[i]) cuoi.chu += c; else ra.push({ chu: c, khop: danh[i] });
  });
  return ra;
}
