/**
 * Tổng quan khu cán bộ: bốn con số chính (bấm vào là tới mục quản lý tương ứng), tiến độ
 * phụ lục thống kê của kỳ hiện tại, và một chỗ gom các việc cần xử lý trước.
 */
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Clock, Users, MessageSquare, AlertTriangle, BellRing, CheckCircle2, ArrowUpRight, FileSpreadsheet, Lock, MapPinOff } from 'lucide-react';
import { adminFetch } from '../../services/adminService';
import { TieuDeQt, The } from '../../components/common/KhoiQt';
import { so } from '../../utils/hangSo';
import { ngayVn } from '../../utils/phuLuc';

interface TQ { diaDiem: number; choKiemTra: number; khachThangNay: number; danhGiaMoi: number; diaDiemChuaGanXa: number; phanAnhMoi: number;
  baoCao: { kyId: number; ky: string; hanNop: string | null; khoa: boolean; soXa: number; daChot: number } | null }

export default function AdminTongQuan() {
  const { data: d } = useQuery({ queryKey: ['qt-tong-quan'], queryFn: () => adminFetch<TQ>('/tong-quan') });
  const bc = d?.baoCao;
  const quaHan = !!(bc?.hanNop && bc.hanNop < new Date().toISOString().slice(0, 10) && bc.daChot < bc.soXa);
  const tiLe = bc && bc.soXa ? Math.round((bc.daChot / bc.soXa) * 100) : 0;
  const SO = [
    { gt: d?.diaDiem, nhan: 'địa điểm', to: '/quan-tri/dia-diem', Ic: MapPin },
    { gt: d?.choKiemTra, nhan: 'địa điểm chờ kiểm tra', to: '/quan-tri/dia-diem', Ic: Clock, canChu: !!d?.choKiemTra },
    { gt: d?.khachThangNay, nhan: 'lượt khách tháng này', to: '/quan-tri/luot-khach', Ic: Users },
    { gt: d?.danhGiaMoi, nhan: 'đánh giá mới trong 7 ngày', to: '/quan-tri/danh-gia', Ic: MessageSquare },
  ];
  const coViec = !!(d?.phanAnhMoi || d?.choKiemTra || d?.diaDiemChuaGanXa);
  return (<>
    <TieuDeQt tieuDe="Tổng quan" moTa="Tình hình dữ liệu du lịch hiện tại. Bấm vào một ô để tới mục quản lý tương ứng." />
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {SO.map(({ gt, nhan, to, Ic, canChu }) => (
        <Link key={nhan} to={to} className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-soft transition-[border-color,box-shadow] hover:border-primary-300 hover:shadow-sh-2 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-primary-700">
          <span className="flex items-start justify-between gap-2">
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${canChu ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200' : 'bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200'}`}>
              <Ic className="h-5 w-5" aria-hidden="true" /></span>
            <ArrowUpRight className="h-4 w-4 text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary-600" aria-hidden="true" />
          </span>
          <b className="mt-3 block text-2xl font-extrabold tabular-nums">{d ? so(Number(gt)) : '…'}</b>
          <small className="text-xs text-slate-500 dark:text-slate-400">{nhan}</small>
        </Link>))}
    </div>

    <div className="mt-4 grid gap-4 lg:grid-cols-12">
      {bc && <The className="lg:col-span-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200"><FileSpreadsheet className="h-5 w-5" aria-hidden="true" /></span>
            <div>
              <h2 className="text-[17px] font-bold">Phụ lục thống kê — {bc.ky}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{bc.hanNop ? `Hạn nộp ${ngayVn(bc.hanNop)}` : 'Chưa đặt hạn nộp'}</p>
            </div>
          </div>
          {bc.khoa ? <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300"><Lock className="h-3 w-3" aria-hidden="true" />Kỳ đã khoá</span>
            : quaHan ? <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"><AlertTriangle className="h-3 w-3" aria-hidden="true" />Quá hạn nộp</span>
            : <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-200">Đang nhận báo cáo</span>}
        </div>
        <div className="mt-5 flex items-end justify-between gap-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">Đã chốt <b className="text-slate-900 dark:text-white">{bc.daChot}/{bc.soXa}</b> xã/phường</p>
          <b className="text-2xl font-extrabold tabular-nums text-primary-700 dark:text-primary-300">{tiLe}%</b>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" role="progressbar" aria-valuemin={0} aria-valuemax={bc.soXa} aria-valuenow={bc.daChot} aria-label="Số xã/phường đã chốt">
          <div className={`h-full rounded-full ${quaHan ? 'bg-amber-500' : 'bg-primary-600'}`} style={{ width: `${tiLe}%` }} /></div>
        {quaHan && <p className="mt-3 text-sm font-semibold text-amber-700 dark:text-amber-300">Đã quá hạn nộp mà còn {bc.soXa - bc.daChot} xã/phường chưa chốt.</p>}
        <Link to="/quan-tri/bao-cao" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:underline">Xem tiến độ từng xã<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
      </The>}

      <The className={bc ? 'lg:col-span-5' : 'lg:col-span-12'}>
        <h2 className="text-[17px] font-bold">Việc cần xử lý</h2>
        <div className="mt-3 space-y-2.5">
          {!!d?.phanAnhMoi && <Link to="/quan-tri/phan-anh" className="flex items-start gap-3 rounded-xl bg-red-50 p-3.5 text-sm text-red-900 transition-colors hover:bg-red-100 dark:bg-red-900/30 dark:text-red-100 dark:hover:bg-red-900/50">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-red-600 text-white"><BellRing className="h-4 w-4" aria-hidden="true" /></span>
            <span><b className="block">Có {d.phanAnhMoi} phản ánh mới của người dân chưa xử lý</b><span className="text-red-800/90 dark:text-red-200/90">Bấm để mở mục Phản ánh.</span></span></Link>}
          {!!d?.choKiemTra && <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-3.5 text-sm text-amber-900 dark:bg-amber-900/30 dark:text-amber-100">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-500 text-white"><Clock className="h-4 w-4" aria-hidden="true" /></span>
            <span><b className="block">Còn {d.choKiemTra} địa điểm chưa được cán bộ kiểm tra</b>Nên bổ sung số điện thoại, giờ mở cửa từ nguồn chính thức rồi đánh dấu đã kiểm tra ở mục <Link className="font-bold underline" to="/quan-tri/dia-diem">Địa điểm</Link>.</span></div>}
          {!!d?.diaDiemChuaGanXa && <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-3.5 text-sm text-amber-900 dark:bg-amber-900/30 dark:text-amber-100">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-500 text-white"><MapPinOff className="h-4 w-4" aria-hidden="true" /></span>
            <span><b className="block">Còn {d.diaDiemChuaGanXa} địa điểm chưa gắn xã/phường</b>Mở mục <Link className="font-bold underline" to="/quan-tri/dia-diem">Địa điểm</Link>, bấm Sửa và chọn xã/phường.</span></div>}
          {d && !coViec && <p className="flex items-center gap-2 rounded-xl bg-primary-50 p-3.5 text-sm font-semibold text-primary-800 dark:bg-primary-900/30 dark:text-primary-100">
            <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />Không còn phản ánh mới hay địa điểm thiếu thông tin.</p>}
          {!d && <p className="text-sm text-slate-500">Đang tải…</p>}
        </div>
      </The>
    </div>
  </>);
}
