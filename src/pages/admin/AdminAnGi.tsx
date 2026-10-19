/** Ăn gì ở Lâm Đồng — món tiêu biểu và quà mang về của từng vùng, hiện ở trang /an-gi. */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowUp, ArrowDown, ArrowUpRight } from 'lucide-react';
import { adminFetch } from '../../services/adminService';
import { TieuDeQt, The, The_nho, o, nhan, nutChinh, nutVien } from '../../components/common/KhoiQt';
import { VUNG } from '../../utils/hangSo';
import type { Vung } from '../../utils/kieu';

interface Mon { id: number; vung: Vung; loai: 'mon' | 'qua'; ten: string; tenEn: string | null; moTa: string | null; moTaEn: string | null; thuTu: number; hien: boolean }
const TRONG = { vung: 'cao-nguyen' as Vung, loai: 'mon' as 'mon' | 'qua', ten: '', tenEn: '', moTa: '', moTaEn: '', thuTu: 0, hien: true };
const LOAI = { mon: 'Món tiêu biểu', qua: 'Mua làm quà' };

export default function AdminAnGi() {
  const qc = useQueryClient();
  const { data: ds = [], error } = useQuery({ queryKey: ['qt-mon-an'], queryFn: () => adminFetch<Mon[]>('/mon-an') });
  const [f, setF] = useState(TRONG); const [suaId, setSuaId] = useState<number | null>(null); const [loi, setLoi] = useState('');
  const [xemVung, setXemVung] = useState<Vung>('cao-nguyen');
  const lamMoi = () => { qc.invalidateQueries({ queryKey: ['qt-mon-an'] }); qc.invalidateQueries({ queryKey: ['mon-an'] }); };
  const ghi = (id: number | null, body: object) => adminFetch(id ? `/mon-an/${id}` : '/mon-an', { method: id ? 'PUT' : 'POST', body: JSON.stringify(body) });
  const luu = useMutation({ mutationFn: () => ghi(suaId, f),
    onSuccess: () => { toast.success(suaId ? 'Đã lưu.' : 'Đã thêm.'); setXemVung(f.vung); setF({ ...TRONG, vung: f.vung, loai: f.loai }); setSuaId(null); setLoi(''); lamMoi(); },
    onError: (e: Error) => setLoi(e.message) });
  const xoa = useMutation({ mutationFn: (id: number) => adminFetch(`/mon-an/${id}`, { method: 'DELETE' }), onSuccess: () => { toast.success('Đã xoá.'); lamMoi(); } });
  /* Đổi chỗ hai mục liền nhau: ghi lại số thứ tự của cả nhóm cho chắc (thứ tự cũ có thể trùng nhau). */
  const doiCho = useMutation({ mutationFn: async ({ nhom, i, j }: { nhom: Mon[]; i: number; j: number }) => {
    const moi = [...nhom]; [moi[i], moi[j]] = [moi[j], moi[i]];
    for (const [k, m] of moi.entries()) if (m.thuTu !== k + 1) await ghi(m.id, { ...m, thuTu: k + 1 });
  }, onSuccess: lamMoi, onError: (e: Error) => toast.error(e.message) });
  const dat = (k: keyof typeof TRONG) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value });
  const sua = (m: Mon) => { setSuaId(m.id); setLoi(''); setF({ vung: m.vung, loai: m.loai, ten: m.ten, tenEn: m.tenEn || '', moTa: m.moTa || '', moTaEn: m.moTaEn || '', thuTu: m.thuTu, hien: m.hien }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  return (<>
    <TieuDeQt tieuDe="Ăn gì ở Lâm Đồng" moTa="Món tiêu biểu và quà mang về của từng vùng. Nơi ăn uống cụ thể thì thêm ở mục Địa điểm với loại Ẩm thực hoặc Đặc sản." />
    {error && <The className="mb-4"><p className="text-sm text-red-700 dark:text-red-300">Chưa đọc được danh sách: {(error as Error).message}. Nếu máy chủ vừa cập nhật, đợi vài phút cho máy chủ tự tạo bảng rồi tải lại trang.</p></The>}
    <div className="grid items-start gap-4 xl:grid-cols-2">
      <The><h2 className="text-[17px] font-bold">{suaId ? 'Sửa' : 'Thêm món, quà'}</h2>
        <div className="grid gap-x-3 sm:grid-cols-2">
          <label className={nhan}>Vùng<select className={o} value={f.vung} onChange={dat('vung')}>{(Object.keys(VUNG) as Vung[]).map((v) => <option key={v} value={v}>{VUNG[v].ngan}</option>)}</select></label>
          <label className={nhan}>Loại<select className={o} value={f.loai} onChange={dat('loai')}><option value="mon">{LOAI.mon}</option><option value="qua">{LOAI.qua}</option></select></label>
        </div>
        <label className={nhan}>Tên<input className={o} value={f.ten} maxLength={120} onChange={dat('ten')} placeholder={f.loai === 'mon' ? 'Ví dụ: Bánh căn' : 'Ví dụ: Mứt Đà Lạt'} /></label>
        <label className={nhan}>Tên tiếng Anh <small className="font-normal text-slate-500">(không bắt buộc)</small><input className={o} value={f.tenEn} maxLength={120} onChange={dat('tenEn')} /></label>
        <label className={nhan}>Mô tả <small className="font-normal text-slate-500">({f.loai === 'mon' ? 'món làm từ gì, ăn thế nào, ăn lúc nào hợp' : 'không bắt buộc, hiện khi rê chuột'})</small>
          <textarea className={o} rows={3} maxLength={1000} value={f.moTa} onChange={dat('moTa')} /></label>
        <label className={nhan}>Mô tả tiếng Anh<textarea className={o} rows={2} maxLength={1000} value={f.moTaEn} onChange={dat('moTaEn')} /></label>
        <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" className="h-[18px] w-[18px] accent-primary-600" checked={f.hien} onChange={dat('hien')} />Hiện cho người dân</label>
        <p className="mt-2 text-xs text-slate-500">Không ghi tên quán, giá bán: thông tin đó dễ cũ và dễ thành quảng cáo.</p>
        {loi && <div className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">{loi}</div>}
        <div className="mt-4 flex gap-2"><button type="button" className={nutChinh} disabled={luu.isPending} onClick={() => luu.mutate()}>{suaId ? 'Lưu' : 'Thêm'}</button>
          {suaId && <button type="button" className={nutVien + ' min-h-[44px] px-4 text-sm'} onClick={() => { setSuaId(null); setF(TRONG); setLoi(''); }}>Huỷ sửa</button>}</div>
      </The>
      <The>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">{(Object.keys(VUNG) as Vung[]).map((v) => (
            <button key={v} type="button" onClick={() => setXemVung(v)} className={`${nutVien} ${xemVung === v ? 'border-primary-600 bg-primary-50 text-primary-800 dark:bg-primary-900/40 dark:text-primary-100' : ''}`}>
              {VUNG[v].ngan} ({ds.filter((m) => m.vung === v).length})</button>))}</div>
          <Link to="/an-gi" target="_blank" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:underline">Xem trang<ArrowUpRight className="h-4 w-4" /></Link>
        </div>
        {(['mon', 'qua'] as const).map((loai) => { const nhom = ds.filter((m) => m.vung === xemVung && m.loai === loai); return (
          <div key={loai} className="mt-4">
            <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300">{LOAI[loai]} ({nhom.length})</h3>
            {!nhom.length ? <p className="mt-1 text-sm text-slate-500">Chưa có.</p> :
              <ul className="mt-1 divide-y divide-slate-100 dark:divide-slate-800">{nhom.map((m, i) => (
                <li key={m.id} className={`flex items-start justify-between gap-2 py-2.5 ${m.hien ? '' : 'opacity-60'}`}>
                  <div className="min-w-0"><b className="text-[15px]">{m.ten}</b>{m.tenEn && <span className="text-sm text-slate-500"> · {m.tenEn}</span>}{!m.hien && <> <The_nho mau="xam">Đang ẩn</The_nho></>}
                    {m.moTa && <p className="line-clamp-2 text-xs text-slate-500">{m.moTa}</p>}</div>
                  <div className="flex shrink-0 gap-1">
                    <button type="button" className={nutVien} disabled={i === 0 || doiCho.isPending} onClick={() => doiCho.mutate({ nhom, i, j: i - 1 })} aria-label="Lên trên"><ArrowUp className="h-3.5 w-3.5" /></button>
                    <button type="button" className={nutVien} disabled={i === nhom.length - 1 || doiCho.isPending} onClick={() => doiCho.mutate({ nhom, i, j: i + 1 })} aria-label="Xuống dưới"><ArrowDown className="h-3.5 w-3.5" /></button>
                    <button type="button" className={nutVien} onClick={() => sua(m)}>Sửa</button>
                    <button type="button" className={nutVien} onClick={() => window.confirm(`Xoá "${m.ten}"?`) && xoa.mutate(m.id)}>Xoá</button>
                  </div>
                </li>))}</ul>}
          </div>); })}
      </The>
    </div>
  </>);
}
