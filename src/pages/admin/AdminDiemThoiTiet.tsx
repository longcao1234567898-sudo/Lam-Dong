/**
 * Điểm dự báo thời tiết — nơi tiêu biểu của từng vùng ở khối "Thời tiết ba vùng" trang chủ.
 * Mọi nơi lấy dự báo trong một lần gọi, nên mỗi vùng chỉ nên 1–4 nơi.
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowUp, ArrowDown, ArrowUpRight, MapPin } from 'lucide-react';
import { adminFetch } from '../../services/adminService';
import { TieuDeQt, The, The_nho, o, nhan, nutChinh, nutVien } from '../../components/common/KhoiQt';
import { VUNG } from '../../utils/hangSo';
import type { Vung } from '../../utils/kieu';

interface Diem { id: number; vung: Vung; ten: string; tenEn: string | null; lat: number; lng: number; thuTu: number; hien: boolean }
const TRONG = { vung: 'cao-nguyen' as Vung, ten: '', tenEn: '', lat: '', lng: '', thuTu: 0, hien: true };
const NEN_TOI_DA = 4;

export default function AdminDiemThoiTiet() {
  const qc = useQueryClient();
  const { data: ds = [], error } = useQuery({ queryKey: ['qt-diem-thoi-tiet'], queryFn: () => adminFetch<Diem[]>('/diem-thoi-tiet') });
  const { data: dd = [] } = useQuery({ queryKey: ['qt-dia-diem'], queryFn: () => adminFetch<{ id: string; ten: string; lat: number; lng: number; vung?: Vung | null }[]>('/dia-diem') });
  const [f, setF] = useState(TRONG); const [suaId, setSuaId] = useState<number | null>(null); const [loi, setLoi] = useState('');
  const lamMoi = () => { qc.invalidateQueries({ queryKey: ['qt-diem-thoi-tiet'] }); qc.invalidateQueries({ queryKey: ['diem-thoi-tiet'] }); };
  const ghi = (id: number | null, body: object) => adminFetch(id ? `/diem-thoi-tiet/${id}` : '/diem-thoi-tiet', { method: id ? 'PUT' : 'POST', body: JSON.stringify(body) });
  const luu = useMutation({ mutationFn: () => ghi(suaId, f),
    onSuccess: () => { toast.success(suaId ? 'Đã lưu.' : 'Đã thêm. Trang chủ cập nhật trong vài phút.'); setF({ ...TRONG, vung: f.vung }); setSuaId(null); setLoi(''); lamMoi(); },
    onError: (e: Error) => setLoi(e.message) });
  const xoa = useMutation({ mutationFn: (id: number) => adminFetch(`/diem-thoi-tiet/${id}`, { method: 'DELETE' }), onSuccess: () => { toast.success('Đã xoá.'); lamMoi(); } });
  const doiCho = useMutation({ mutationFn: async ({ nhom, i, j }: { nhom: Diem[]; i: number; j: number }) => {
    const moi = [...nhom]; [moi[i], moi[j]] = [moi[j], moi[i]];
    for (const [k, d] of moi.entries()) if (d.thuTu !== k + 1) await ghi(d.id, { ...d, thuTu: k + 1 });
  }, onSuccess: lamMoi, onError: (e: Error) => toast.error(e.message) });
  const dat = (k: keyof typeof TRONG) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value });
  /* Lấy toạ độ, tên, vùng từ một địa điểm đã có, khỏi gõ tay. */
  const layTuDiem = (id: string) => { const p = dd.find((x) => x.id === id); if (p) setF({ ...f, ten: f.ten || p.ten, lat: String(p.lat), lng: String(p.lng), vung: p.vung || f.vung }); };
  const sua = (d: Diem) => { setSuaId(d.id); setLoi(''); setF({ vung: d.vung, ten: d.ten, tenEn: d.tenEn || '', lat: String(d.lat), lng: String(d.lng), thuTu: d.thuTu, hien: d.hien }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const soTrongVung = ds.filter((d) => d.vung === f.vung && d.hien && d.id !== suaId).length;
  const lat = Number(String(f.lat).replace(',', '.')), lng = Number(String(f.lng).replace(',', '.'));
  return (<>
    <TieuDeQt tieuDe="Điểm dự báo thời tiết" moTa='Nơi tiêu biểu của từng vùng ở khối "Thời tiết ba vùng" trang chủ. Dự báo tính theo toạ độ và độ cao địa hình của từng nơi.' />
    {error && <The className="mb-4"><p className="text-sm text-red-700 dark:text-red-300">Chưa đọc được danh sách: {(error as Error).message}. Nếu máy chủ vừa cập nhật, đợi vài phút cho máy chủ tự tạo bảng rồi tải lại trang.</p></The>}
    <div className="grid items-start gap-4 xl:grid-cols-2">
      <The><h2 className="text-[17px] font-bold">{suaId ? 'Sửa điểm' : 'Thêm điểm'}</h2>
        {!suaId && <label className={nhan}>Lấy từ địa điểm đã có <small className="font-normal text-slate-500">(điền sẵn tên, toạ độ, vùng)</small>
          <select className={o} value="" onChange={(e) => layTuDiem(e.target.value)}><option value="">— chọn —</option>{dd.map((x) => <option key={x.id} value={x.id}>{x.ten}</option>)}</select></label>}
        <div className="grid gap-x-3 sm:grid-cols-2">
          <label className={nhan}>Vùng<select className={o} value={f.vung} onChange={dat('vung')}>{(Object.keys(VUNG) as Vung[]).map((v) => <option key={v} value={v}>{VUNG[v].ngan}</option>)}</select></label>
          <label className={nhan}>Tên hiện trên nút<input className={o} value={f.ten} maxLength={80} onChange={dat('ten')} placeholder="Ví dụ: Bảo Lộc" /></label>
        </div>
        <label className={nhan}>Tên tiếng Anh <small className="font-normal text-slate-500">(không bắt buộc)</small><input className={o} value={f.tenEn} maxLength={80} onChange={dat('tenEn')} /></label>
        <div className="grid gap-x-3 sm:grid-cols-2">
          <label className={nhan}>Vĩ độ<input className={o} inputMode="decimal" value={f.lat} onChange={dat('lat')} placeholder="11.9404" /></label>
          <label className={nhan}>Kinh độ<input className={o} inputMode="decimal" value={f.lng} onChange={dat('lng')} placeholder="108.4583" /></label>
        </div>
        {Number.isFinite(lat) && Number.isFinite(lng) && f.lat && f.lng && <a className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer"
          href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}><MapPin className="h-4 w-4" />Kiểm tra vị trí trên Google Maps<ArrowUpRight className="h-3.5 w-3.5" /></a>}
        <p className="mt-2 text-xs text-slate-500">Mẹo: trên Google Maps, bấm chuột phải vào điểm rồi bấm dòng số đầu tiên để chép toạ độ (vĩ độ, kinh độ).</p>
        <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" className="h-[18px] w-[18px] accent-primary-600" checked={f.hien} onChange={dat('hien')} />Hiện trên trang chủ</label>
        {soTrongVung >= NEN_TOI_DA && f.hien && <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-900/30 dark:text-amber-100">Vùng này đã có {soTrongVung} nơi. Nhiều nơi quá thì hàng nút chọn dài, khó nhìn trên điện thoại. Nên giữ 1–{NEN_TOI_DA} nơi mỗi vùng.</p>}
        {loi && <div className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">{loi}</div>}
        <div className="mt-4 flex gap-2"><button type="button" className={nutChinh} disabled={luu.isPending} onClick={() => luu.mutate()}>{suaId ? 'Lưu' : 'Thêm'}</button>
          {suaId && <button type="button" className={nutVien + ' min-h-[44px] px-4 text-sm'} onClick={() => { setSuaId(null); setF(TRONG); setLoi(''); }}>Huỷ sửa</button>}</div>
      </The>
      <The><h2 className="text-[17px] font-bold">Các nơi theo vùng</h2>
        {(Object.keys(VUNG) as Vung[]).map((v) => { const nhom = ds.filter((d) => d.vung === v); return (
          <div key={v} className="mt-4">
            <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300">{VUNG[v].ten} ({nhom.length})</h3>
            {!nhom.length ? <p className="mt-1 text-sm text-slate-500">Chưa có nơi nào: trang chủ sẽ không hiện thẻ của vùng này.</p> :
              <ul className="mt-1 divide-y divide-slate-100 dark:divide-slate-800">{nhom.map((d, i) => (
                <li key={d.id} className={`flex items-center justify-between gap-2 py-2.5 ${d.hien ? '' : 'opacity-60'}`}>
                  <div className="min-w-0"><b className="text-[15px]">{d.ten}</b>{d.tenEn && <span className="text-sm text-slate-500"> · {d.tenEn}</span>}{!d.hien && <> <The_nho mau="xam">Đang ẩn</The_nho></>}
                    <p className="text-xs tabular-nums text-slate-500">{d.lat}, {d.lng}</p></div>
                  <div className="flex shrink-0 gap-1">
                    <button type="button" className={nutVien} disabled={i === 0 || doiCho.isPending} onClick={() => doiCho.mutate({ nhom, i, j: i - 1 })} aria-label="Lên trên"><ArrowUp className="h-3.5 w-3.5" /></button>
                    <button type="button" className={nutVien} disabled={i === nhom.length - 1 || doiCho.isPending} onClick={() => doiCho.mutate({ nhom, i, j: i + 1 })} aria-label="Xuống dưới"><ArrowDown className="h-3.5 w-3.5" /></button>
                    <button type="button" className={nutVien} onClick={() => sua(d)}>Sửa</button>
                    <button type="button" className={nutVien} onClick={() => window.confirm(`Xoá "${d.ten}"?`) && xoa.mutate(d.id)}>Xoá</button>
                  </div>
                </li>))}</ul>}
          </div>); })}
        <p className="mt-4 text-xs text-slate-500">Nơi đầu tiên của mỗi vùng là nơi hiện sẵn khi mở trang chủ.</p>
      </The>
    </div>
  </>);
}
