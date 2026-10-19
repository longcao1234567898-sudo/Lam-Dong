/**
 * Ưu đãi du lịch: tin loại "uu-dai" cán bộ đăng (chương trình kích cầu, khuyến mãi của khu,
 * điểm du lịch, cơ sở lưu trú, nhà xe). Sắp hết hạn xếp trước; hết hạn thì máy chủ tự thôi trả về.
 * Lọc theo vùng: vùng cán bộ chọn, không có thì vùng của địa điểm gắn kèm, còn lại là toàn tỉnh.
 */
import { useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BadgePercent, ArrowUpRight, ExternalLink, MapPin, Clock } from 'lucide-react';
import { DauTrang, TrongRong } from '../../components/du-lich/GiaoDien';
import ThanhTin, { vungTin } from '../../components/du-lich/ThanhTin';
import { layTinTuc, layDiaDiem } from '../../services/api';
import { VUNG, lopVung } from '../../utils/hangSo';
import { useNN } from '../../i18n/NgonNgu';
import type { Vung } from '../../utils/kieu';

/** Ngày dạng 2026-10-31 -> số ngày còn lại tính từ hôm nay (giờ máy người xem). */
function conLai(s: string) {
  const [y, m, d] = s.split('-').map(Number);
  const nay = new Date(); nay.setHours(0, 0, 0, 0);
  return Math.round((new Date(y, m - 1, d).getTime() - nay.getTime()) / 86_400_000);
}

export default function UuDaiPage() {
  const { t, chon, nn, ngay } = useNN();
  const { data: tin = [], isLoading } = useQuery({ queryKey: ['tin-tuc'], queryFn: layTinTuc });
  const { data: ds = [] } = useQuery({ queryKey: ['dia-diem'], queryFn: layDiaDiem });
  const [loc, setLoc] = useState<Vung | 'toan-tinh' | null>(null);
  const uu = tin.filter((x) => x.loai === 'uu-dai')
    .map((x) => ({ x, v: vungTin(x, ds), con: x.denNgay ? conLai(x.denNgay) : null }))
    .sort((a, b) => (a.con ?? 1e9) - (b.con ?? 1e9) || b.x.id - a.x.id);
  const dem = (k: Vung | 'toan-tinh') => uu.filter((u) => (k === 'toan-tinh' ? !u.v : u.v === k)).length;
  const cacNhom = [...(Object.keys(VUNG) as Vung[]).filter((v) => dem(v)), ...(dem('toan-tinh') ? ['toan-tinh' as const] : [])];
  const hien = loc ? uu.filter((u) => (loc === 'toan-tinh' ? !u.v : u.v === loc)) : uu;
  return (
    <div className="animate-page">
      <DauTrang tieuDe={t('uuDaiTieuDe')} moTa={t('uuDaiMoTa')}><ThanhTin /></DauTrang>
      <section className="container-page py-12">
        {isLoading && <p className="py-10 text-center text-muted">{t('dangTai')}</p>}
        {!isLoading && !uu.length && <TrongRong Ic={BadgePercent} mau="vung-hoa" tieuDe={t('khongCoUuDai')} moTa={t('khongCoUuDaiMoTa')}>
          <Link to="/lich-su-kien" className="nut nut-vien">{t('lichSuKien')}<ArrowUpRight className="h-4 w-4" /></Link>
        </TrongRong>}
        {cacNhom.length > 1 && <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label={t('vung')}>
          <button type="button" className="chip" aria-pressed={!loc} onClick={() => setLoc(null)}>{t('tatCa')}<span className="chip-so">{uu.length}</span></button>
          {cacNhom.map((k) => (
            <button key={k} type="button" className={`chip ${k === 'toan-tinh' ? '' : lopVung(k)}`} aria-pressed={loc === k} onClick={() => setLoc(loc === k ? null : k)}>
              {k !== 'toan-tinh' && <span className="cham-vung" aria-hidden="true" />}
              {k === 'toan-tinh' ? t('toanTinh') : nn === 'en' ? VUNG[k].nganEn : VUNG[k].ngan}<span className="chip-so">{dem(k)}</span></button>))}
        </div>}
        <div className="grid gap-4 md:grid-cols-2">{hien.map(({ x, v, con }, i) => {
          const p = ds.find((d) => d.id === x.diaDiemId);
          const gap = con !== null && con <= 7;
          return (
            <article key={x.id} className={`hien-dan the flex flex-col p-6 ${gap ? 'border-[#E0B54A]' : ''}`} style={{ '--i': i % 2 } as CSSProperties}>
              <div className="flex flex-wrap items-center gap-2 text-[13px] font-medium">
                <span className="o-bieu-tuong mau-uu-dai h-9 w-9 rounded-xl"><BadgePercent className="h-[18px] w-[18px]" aria-hidden="true" /></span>
                {v ? <span className={`nhan-vung ${lopVung(v)}`}>{nn === 'en' ? VUNG[v].nganEn : VUNG[v].ngan}</span> : <span className="text-muted">{t('toanTinh')}</span>}
                <span className={`ml-auto inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${gap ? 'bg-[#FCEFC7] font-semibold text-[#5c3d00] dark:bg-[#3a3216] dark:text-[#F4D27A]' : 'bg-sunken text-ink-2'}`}>
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {con === null ? t('khongGhiHan') : gap ? `${t('sapHetHan')} · ${con <= 0 ? t('conHomNay') : t('conNgay', { n: con })}` : t('denNgayHan', { d: ngay(x.denNgay) })}</span>
              </div>
              <h2 className="mt-3 text-[20px] font-semibold leading-snug"><Link to={`/tin-tuc/${x.id}`} className="underline-offset-2 hover:text-action hover:underline">{chon(x.tieuDe, x.tieuDeEn)}</Link></h2>
              {chon(x.noiDung, x.noiDungEn) && <p className="mt-2 line-clamp-4 flex-1 whitespace-pre-line text-[15.5px] leading-relaxed text-ink-2">{chon(x.noiDung, x.noiDungEn)}</p>}
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-line/70 pt-3 text-[15px] font-semibold">
                <Link to={`/tin-tuc/${x.id}`} className="inline-flex min-h-[40px] items-center gap-1.5 text-action">{t('chiTietUuDai')}<ArrowUpRight className="h-4 w-4" /></Link>
                {p && <Link to={`/dia-diem/${p.id}`} className="inline-flex min-h-[40px] items-center gap-1.5 text-action"><MapPin className="h-4 w-4" />{chon(p.ten, p.tenEn)}</Link>}
                {x.lienKet && <a href={x.lienKet} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[40px] items-center gap-1.5 text-muted hover:text-action"><ExternalLink className="h-4 w-4" />{t('xemNguon')}</a>}
              </div>
            </article>); })}</div>
      </section>
    </div>);
}
