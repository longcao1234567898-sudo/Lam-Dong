/**
 * Khối "Thời tiết ba vùng" ở trang chủ: mỗi vùng một thẻ mang màu vùng, chọn được nơi tiêu
 * biểu. Danh sách nơi do cán bộ quản lý (mục "Điểm thời tiết"); máy chủ chưa có bảng thì
 * dùng danh sách dựng sẵn. Mọi nơi lấy trong MỘT lần gọi (services/thoiTiet.ts), đổi nơi
 * không phải gọi lại. Vùng chưa có nơi nào thì không hiện thẻ.
 */
import { useState, type CSSProperties } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNN } from '../../i18n/NgonNgu';
import { VUNG } from '../../utils/hangSo';
import { DIEM_THOI_TIET_MAC_DINH } from '../../utils/noiDungMacDinh';
import { layDiemThoiTiet } from '../../services/api';
import { TieuDeKhoi } from '../du-lich/GiaoDien';
import { useThoiTiet, moTaMa, mucUv, do_, BayNgay, LoiThoiTiet } from '../du-lich/ThoiTiet';
import type { Vung } from '../../utils/kieu';

const CAC_VUNG = Object.keys(VUNG) as Vung[];

export default function ThoiTietVung() {
  const { t, nn, chon: dich } = useNN();
  const { data: diemTuMay, isLoading: dangTaiDiem } = useQuery({ queryKey: ['diem-thoi-tiet'], queryFn: layDiemThoiTiet, staleTime: 10 * 60_000 });
  const diem = Array.isArray(diemTuMay) ? diemTuMay : dangTaiDiem ? [] : DIEM_THOI_TIET_MAC_DINH;
  /* Xếp theo vùng để một lần gọi trả về đúng thứ tự; tatCa[i] ứng với kết quả dự báo thứ i. */
  const tatCa = CAC_VUNG.flatMap((v) => diem.filter((d) => d.vung === v));
  const { data, isLoading, isError, refetch } = useThoiTiet(tatCa);
  const dangTai = dangTaiDiem || isLoading;
  /* Nơi đang chọn ở mỗi vùng, nhớ theo mã điểm (cán bộ thêm, bớt điểm không làm lệch). */
  const [noi, setNoi] = useState<Partial<Record<Vung, number>>>({});
  const cacVung = CAC_VUNG.filter((v) => tatCa.some((d) => d.vung === v));
  return (
    <section id="thoi-tiet" className="py-12 sm:py-16 lg:py-20" style={{ scrollMarginTop: 72 }}>
      <div className="container-page">
        <TieuDeKhoi tieuDe={t('thoiTietTieuDe')} moTa={t('thoiTietMoTa')} />
        {isError && <div className="the p-5"><LoiThoiTiet onThuLai={() => refetch()} /></div>}
        {!isError && <div className={`grid gap-4 ${cacVung.length === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3'}`}>
          {dangTaiDiem && [0, 1, 2].map((i) => <div key={i} className="skeleton h-[26rem] rounded-2xl" />)}
          {cacVung.map((v, iv) => {
            const k = VUNG[v], ds = tatCa.filter((d) => d.vung === v);
            const dc = ds.find((d) => d.id === noi[v]) || ds[0];
            const db = data?.[tatCa.indexOf(dc)];
            const nay = db?.ngay[0];
            return (
              <article key={v} className={`hien-dan the vung-${k.token} relative flex flex-col overflow-hidden`} style={{ '--i': iv } as CSSProperties}
                aria-label={`${nn === 'en' ? k.en : k.ten}: ${dich(dc.ten, dc.tenEn)}`}>
                <span className="absolute inset-x-0 top-0 h-1 bg-[var(--vm)]" aria-hidden="true" />
                <div className="p-5 pb-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className={`nhan-vung vung-${k.token}`}>{nn === 'en' ? k.nganEn : k.ngan}</span>
                    {db && <span className="text-[12px] tabular-nums text-muted">{t('capNhatLuc', { gio: db.hienTai.luc.slice(11, 16) })}</span>}
                  </div>
                  {ds.length > 1 ? <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label={t('chonNoiXem')}>{ds.map((d) => (
                    <button key={d.id} type="button" className={`chip min-h-[34px] px-3 text-[13px] vung-${k.token}`} aria-pressed={d.id === dc.id}
                      onClick={() => setNoi((n) => ({ ...n, [v]: d.id }))}>{dich(d.ten, d.tenEn)}</button>))}</div>
                    : <p className="mt-3 text-[15px] font-semibold">{dich(dc.ten, dc.tenEn)}</p>}

                  {dangTai && <div className="skeleton mt-4 h-[7.5rem] rounded-xl" />}
                  {db && nay && (() => { const [Ic, vi, en] = moTaMa(db.hienTai.ma, db.hienTai.banNgay); return (<>
                    <div className="mt-4 flex items-center gap-4">
                      <Ic className="h-14 w-14 shrink-0 text-[var(--vm)]" strokeWidth={1.4} aria-hidden="true" />
                      <b className="font-serif text-[54px] font-medium leading-none tabular-nums">{do_(db.hienTai.nhiet)}</b>
                      <span className="min-w-0 text-[14px] leading-snug">
                        <b className="block text-[16px] font-semibold">{nn === 'en' ? en : vi}</b>
                        <span className="text-muted">{t('caoThap', { c: do_(nay.cao), t: do_(nay.thap) })}</span></span>
                    </div>
                    <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-ink-2">
                      {db.hienTai.camGiac !== null && <span>{t('camGiac', { n: do_(db.hienTai.camGiac) })}</span>}
                      <span>{t('doAm', { n: Math.round(db.hienTai.doAm) })}</span>
                      <span>{t('gioKmh', { n: Math.round(db.hienTai.gio) })}</span>
                      {nay.uv !== null && <span>{t('uvMuc', { n: Math.round(nay.uv), muc: mucUv(nay.uv)[nn === 'en' ? 1 : 0] })}</span>}
                    </p></>); })()}
                </div>
                {db && <div className="mt-auto border-t border-line/60 px-5 pb-2"><BayNgay db={db} /></div>}
              </article>); })}</div>}
      </div>
    </section>);
}
