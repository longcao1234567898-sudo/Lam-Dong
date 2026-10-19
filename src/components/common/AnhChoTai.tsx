/**
 * Ảnh chọn sẵn khi đăng tin, thêm địa điểm: giữ trên trình duyệt, bấm Lưu thì tải lên ngay
 * sau khi máy chủ tạo xong (lúc đó mới có mã tin, mã địa điểm để gắn ảnh vào).
 */
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { ImagePlus, Star, X } from 'lucide-react';
import { thuNho } from './QuanLyAnh';
import { nutVien } from './KhoiQt';

/** Thu nhỏ rồi gửi lần lượt từng ảnh. Ảnh lỗi báo riêng, không chặn ảnh sau; trả về số ảnh gửi được. */
export async function taiLanLuot(tep: File[], gui: (x: Awaited<ReturnType<typeof thuNho>>, f: File) => Promise<unknown>, tienDo?: (i: number) => void) {
  let duoc = 0;
  for (const [i, f] of tep.entries()) {
    tienDo?.(i + 1);
    try { await gui(await thuNho(f), f); duoc++; } catch (e) { toast.error(`${f.name}: ${(e as Error).message}`); }
  }
  return duoc;
}

export default function AnhChoTai({ tep, onDoi, toiDa, nhanDau }: { tep: File[]; onDoi: (t: File[]) => void; toiDa: number; nhanDau: string }) {
  const chon = useRef<HTMLInputElement>(null);
  /* Tạo và thu hồi đường dẫn xem trước trong cùng một hiệu ứng (StrictMode chạy hiệu ứng hai lần). */
  const [url, setUrl] = useState<string[]>([]);
  useEffect(() => { const u = tep.map((f) => URL.createObjectURL(f)); setUrl(u); return () => u.forEach((x) => URL.revokeObjectURL(x)); }, [tep]);
  const them = (ds: FileList | null) => {
    const anh = Array.from(ds || []).filter((f) => f.type.startsWith('image/')), con = toiDa - tep.length;
    if (anh.length > con) toast.error(`Tối đa ${toiDa} ảnh: chỉ lấy ${con} ảnh đầu.`);
    if (con > 0 && anh.length) onDoi([...tep, ...anh.slice(0, con)]);
    if (chon.current) chon.current.value = '';
  };
  return (
    <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-3 dark:border-slate-600"
      onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); them(e.dataTransfer.files); }}>
      <div className="flex flex-wrap items-center justify-between gap-2"><b className="text-sm">Ảnh ({tep.length}/{toiDa})</b>
        <button type="button" className={nutVien + ' gap-1.5'} disabled={tep.length >= toiDa} onClick={() => chon.current?.click()}><ImagePlus className="h-3.5 w-3.5" />Chọn ảnh</button>
        <input ref={chon} type="file" accept="image/*" multiple hidden onChange={(e) => them(e.target.files)} /></div>
      <p className="mt-1 text-xs text-slate-500">Chọn hoặc kéo ảnh vào đây, bấm Lưu thì ảnh tải lên cùng lúc. Ảnh đầu tiên là {nhanDau.toLowerCase()}. Chỉ đăng ảnh tự chụp hoặc được phép dùng.</p>
      {tep.length > 0 && <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">{tep.map((f, i) => (
        <figure key={i} className="relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
          {url[i] ? <img src={url[i]} alt={f.name} className="aspect-[4/3] w-full bg-slate-100 object-cover dark:bg-slate-800" /> : <div className="aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800" />}
          {i === 0 && <span className="absolute bottom-1 left-1 rounded-full bg-white/90 px-1.5 py-0.5 text-[10.5px] font-semibold text-slate-700">{nhanDau}</span>}
          <div className="absolute right-1 top-1 flex gap-1">
            {i > 0 && <button type="button" className="grid h-6 w-6 place-items-center rounded-full bg-white/90 text-slate-700 shadow" title={`Đặt làm ${nhanDau.toLowerCase()}`} aria-label={`Đặt làm ${nhanDau.toLowerCase()}`}
              onClick={() => onDoi([f, ...tep.filter((_, k) => k !== i)])}><Star className="h-3 w-3" /></button>}
            <button type="button" className="grid h-6 w-6 place-items-center rounded-full bg-white/90 text-slate-700 shadow" title="Bỏ ảnh này" aria-label="Bỏ ảnh này"
              onClick={() => onDoi(tep.filter((_, k) => k !== i))}><X className="h-3 w-3" /></button></div>
        </figure>))}</div>}
    </div>);
}
