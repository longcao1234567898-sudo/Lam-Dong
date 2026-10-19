/**
 * Ăn gì ở Lâm Đồng: món tiêu biểu và quà mang về của ba vùng (cán bộ sửa ở mục "Ăn gì" khu
 * quản trị), kèm nơi ăn uống, mua đặc sản lấy từ các địa điểm loại "am-thuc", "dac-san".
 * Không nêu tên quán, giá: chỗ cụ thể do cán bộ giới thiệu ở phần địa điểm.
 */
import { useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { UtensilsCrossed, Gift, MapPin, Info } from 'lucide-react';
import { DauTrang } from '../../components/du-lich/GiaoDien';
import { layDiaDiem, layMonAn } from '../../services/api';
import { VUNG, lopVung } from '../../utils/hangSo';
import { MON_AN_MAC_DINH } from '../../utils/noiDungMacDinh';
import { useNN } from '../../i18n/NgonNgu';
import type { Vung } from '../../utils/kieu';

export default function AnGiPage() {
  const { t, chon, nn } = useNN();
  const { data: ds = [] } = useQuery({ queryKey: ['dia-diem'], queryFn: layDiaDiem });
  /* Máy chủ chưa có bảng (null) hoặc không trả lời: dùng danh sách dựng sẵn, không để trang trống. */
  const { data: monTuMay, isLoading } = useQuery({ queryKey: ['mon-an'], queryFn: layMonAn, staleTime: 5 * 60_000 });
  const mon = Array.isArray(monTuMay) ? monTuMay : isLoading ? [] : MON_AN_MAC_DINH;
  const [loc, setLoc] = useState<Vung | null>(null);
  const noiAn = ds.filter((p) => p.loai === 'am-thuc' || p.loai === 'dac-san');
  const cacVung = (Object.keys(VUNG) as Vung[]).filter((v) => (!loc || v === loc) && (isLoading || mon.some((m) => m.vung === v) || noiAn.some((p) => p.vung === v)));
  return (
    <div className="animate-page">
      <DauTrang tieuDe={t('anGiTieuDe')} moTa={t('anGiMoTa')}>
        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label={t('vung')}>
          <button type="button" className="chip" aria-pressed={!loc} onClick={() => setLoc(null)}>{t('tatCa')}</button>
          {(Object.keys(VUNG) as Vung[]).map((v) => <button key={v} type="button" className={`chip ${lopVung(v)}`} aria-pressed={loc === v} onClick={() => setLoc(loc === v ? null : v)}>
            <span className="cham-vung" aria-hidden="true" />{nn === 'en' ? VUNG[v].en : VUNG[v].ten}</button>)}
        </div>
      </DauTrang>
      <div className="container-page space-y-14 py-12">
        {cacVung.map((v) => {
          const monVung = mon.filter((m) => m.vung === v && m.loai === 'mon'), qua = mon.filter((m) => m.vung === v && m.loai === 'qua');
          const noi = noiAn.filter((p) => p.vung === v);
          return (
            <section key={v} className={lopVung(v)} aria-labelledby={`an-${v}`}>
              <div className="mb-5 flex items-center gap-3">
                <span className="h-8 w-1.5 rounded-full" style={{ background: 'var(--vm)' }} aria-hidden="true" />
                <h2 id={`an-${v}`} className="tieu-de-vua">{nn === 'en' ? VUNG[v].en : VUNG[v].ten}</h2>
              </div>
              {isLoading && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}</div>}
              {monVung.length > 0 && <>
                <h3 className="mb-3 text-sm font-semibold text-ink-2">{t('monTieuBieu')}</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{monVung.map((m, i) => (
                  <article key={m.id} className="hien-dan the flex gap-4 p-5" style={{ '--i': i % 3 } as CSSProperties}>
                    <span className="o-bieu-tuong h-11 w-11 rounded-xl"><UtensilsCrossed className="h-5 w-5" aria-hidden="true" /></span>
                    <div className="min-w-0"><h4 className="text-[17px] font-semibold leading-snug">{chon(m.ten, m.tenEn)}</h4>
                      {nn === 'en' && m.tenEn && <p className="text-[13px] text-muted">{m.ten}</p>}
                      {chon(m.moTa, m.moTaEn) && <p className="mt-1 text-[15px] leading-relaxed text-ink-2">{chon(m.moTa, m.moTaEn)}</p>}</div>
                  </article>))}</div></>}
              {qua.length > 0 && <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="mr-1 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-2"><Gift className="h-4 w-4" aria-hidden="true" />{t('muaVe')}:</span>
                {qua.map((q) => <span key={q.id} className="rounded-full border border-line bg-paper px-3 py-1.5 text-[14px]" title={chon(q.moTa, q.moTaEn) || undefined}>{chon(q.ten, q.tenEn)}</span>)}
              </div>}
              <h3 className="mb-1 mt-7 text-sm font-semibold text-ink-2">{t('noiAnUong')}</h3>
              {noi.length ? <><p className="mb-3 text-[13px] text-muted">{t('noiAnUongMoTa')}</p>
                <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{noi.map((p) => (
                  <li key={p.id}><Link to={`/dia-diem/${p.id}`} className="the flex min-h-[56px] items-center gap-3 p-3 transition-shadow hover:shadow-sh-2">
                    <MapPin className="h-5 w-5 shrink-0" style={{ color: 'var(--vm)' }} aria-hidden="true" />
                    <span className="min-w-0"><b className="block truncate text-[15px] font-semibold">{chon(p.ten, p.tenEn)}</b>{p.xa && <small className="block truncate text-[13px] text-muted">{p.xa}</small>}</span></Link></li>))}</ul></>
                : <p className="text-[14px] text-muted">{t('chuaCoNoiAn')}</p>}
            </section>); })}
        <p className="flex gap-2 text-[13px] leading-relaxed text-muted"><Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{t('anGiLuuY')}</p>
      </div>
    </div>);
}
