/**
 * Khối "Thời tiết ba vùng" ở trang chủ: mỗi vùng một thẻ mang màu vùng, chọn được nơi tiêu
 * biểu (utils/hangSo.ts, DIEM_THOI_TIET). Cả sáu nơi lấy trong MỘT lần gọi (services/thoiTiet.ts),
 * đổi nơi không phải gọi lại.
 */
import { useState, type CSSProperties } from 'react';
import { useNN } from '../../i18n/NgonNgu';
import { VUNG, DIEM_THOI_TIET } from '../../utils/hangSo';
import { TieuDeKhoi } from '../du-lich/GiaoDien';
import { useThoiTiet, moTaMa, mucUv, do_, BayNgay, LoiThoiTiet } from '../du-lich/ThoiTiet';
import type { Vung } from '../../utils/kieu';

const CAC_VUNG = Object.keys(VUNG) as Vung[];
const TAT_CA = CAC_VUNG.flatMap((v) => DIEM_THOI_TIET[v]);
/** Vị trí nơi đầu tiên của mỗi vùng trong TAT_CA. */
const DAU = CAC_VUNG.reduce((m, v, i) => ({ ...m, [v]: i ? m[CAC_VUNG[i - 1]] + DIEM_THOI_TIET[CAC_VUNG[i - 1]].length : 0 }), {} as Record<Vung, number>);

export default function ThoiTietVung() {
  const { t, nn } = useNN();
  const { data, isLoading, isError, refetch } = useThoiTiet(TAT_CA);
  const [noi, setNoi] = useState<Record<Vung, number>>({ 'cao-nguyen': 0, 'bien-dao': 0, 'dai-ngan': 0 });
  return (
    <section id="thoi-tiet" className="py-12 sm:py-16 lg:py-20" style={{ scrollMarginTop: 72 }}>
      <div className="container-page">
        <TieuDeKhoi tieuDe={t('thoiTietTieuDe')} moTa={t('thoiTietMoTa')} />
        {isError && <div className="the p-5"><LoiThoiTiet onThuLai={() => refetch()} /></div>}
        {!isError && <div className="grid gap-4 lg:grid-cols-3">{CAC_VUNG.map((v, iv) => {
          const k = VUNG[v], ds = DIEM_THOI_TIET[v], chon = noi[v], db = data?.[DAU[v] + chon];
          const nay = db?.ngay[0];
          return (
            <article key={v} className={`hien-dan the vung-${k.token} relative flex flex-col overflow-hidden`} style={{ '--i': iv } as CSSProperties}
              aria-label={`${nn === 'en' ? k.en : k.ten}: ${nn === 'en' ? ds[chon].en : ds[chon].ten}`}>
              <span className="absolute inset-x-0 top-0 h-1 bg-[var(--vm)]" aria-hidden="true" />
              <div className="p-5 pb-3">
                <div className="flex items-center justify-between gap-3">
                  <span className={`nhan-vung vung-${k.token}`}>{nn === 'en' ? k.nganEn : k.ngan}</span>
                  {db && <span className="text-[12px] tabular-nums text-muted">{t('capNhatLuc', { gio: db.hienTai.luc.slice(11, 16) })}</span>}
                </div>
                {ds.length > 1 ? <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label={t('chonNoiXem')}>{ds.map((d, i) => (
                  <button key={d.ten} type="button" className={`chip min-h-[34px] px-3 text-[13px] vung-${k.token}`} aria-pressed={chon === i}
                    onClick={() => setNoi((n) => ({ ...n, [v]: i }))}>{nn === 'en' ? d.en : d.ten}</button>))}</div>
                  : <p className="mt-3 text-[15px] font-semibold">{nn === 'en' ? ds[0].en : ds[0].ten}</p>}

                {isLoading && <div className="skeleton mt-4 h-[7.5rem] rounded-xl" />}
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
