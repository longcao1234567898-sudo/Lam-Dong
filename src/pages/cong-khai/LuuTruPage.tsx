/** Resort, khu nghỉ dưỡng cán bộ đã xác nhận (bảng 3, chỉ cơ sở được đánh dấu hiện cho người dân). */
import { useState, type CSSProperties } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MapPin, Info, BedDouble, Compass, Route, Search, ArrowUpRight } from 'lucide-react';
import { DauTrang, HienSao, TrongRong } from '../../components/du-lich/GiaoDien';
import { layLuuTru } from '../../services/api';
import { useNN } from '../../i18n/NgonNgu';
import { boDau } from '../../utils/timDiem';
import type { LuuTru } from '../../utils/kieu';

const diaChiDu = (x: LuuTru) => [x.diaChi, x.xaPhuong].filter(Boolean).join(', ');
/** Tìm trên Google Maps theo tên + địa chỉ: không cần toạ độ (cơ sở lưu trú không lưu toạ độ). */
const banDoUrl = (x: LuuTru) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${x.ten}, ${diaChiDu(x)}, Lâm Đồng`)}`;

export default function LuuTruPage() {
  const { t } = useNN();
  const { data: ds = [], isLoading } = useQuery({ queryKey: ['luu-tru'], queryFn: layLuuTru });
  const [q, setQ] = useState('');
  const [sao, setSao] = useState<number | null>(null);
  /* Nút lọc chỉ có cho hạng sao đang có trong danh sách (0 = chưa xếp hạng), cao xuống thấp. */
  const cacHang = [...new Set(ds.map((x) => x.hangSao || 0))].sort((a, b) => b - a);
  const tu = boDau(q).split(/\s+/).filter(Boolean);
  const dsHien = ds.filter((x) => (sao === null || (x.hangSao || 0) === sao)
    && tu.every((w) => boDau(`${x.ten} ${diaChiDu(x)}`).includes(w)));
  const coLoc = ds.length > 6;
  return (
    <div className="animate-page">
      <DauTrang tieuDe={t('luuTruTieuDe')} moTa={t('luuTruMoTa')}>
        <p className="mt-6 flex max-w-3xl items-start gap-2.5 rounded-2xl border border-line bg-paper/70 px-4 py-3 text-[15px] text-ink-2"><Info className="mt-0.5 h-4 w-4 shrink-0 text-action" />{t('luuYTamTru')}</p>
      </DauTrang>
      <section className="container-page py-12">
        {isLoading && <p className="py-10 text-center text-muted">{t('dangTai')}</p>}
        {!isLoading && !ds.length && <TrongRong Ic={BedDouble} mau="vung-hoa" tieuDe={t('khongCoLuuTru')} moTa={t('khongCoLuuTruMoTa')}>
          <Link to="/" className="nut nut-chinh"><Compass className="h-4 w-4" />{t('khamPhaTieuDe')}</Link>
          <Link to="/lo-trinh" className="nut nut-vien"><Route className="h-4 w-4" />{t('goiYLoTrinh')}</Link>
        </TrongRong>}
        {/* Ít cơ sở thì nhìn là thấy hết, không cần ô tìm. */}
        {coLoc && <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full lg:max-w-sm"><span className="sr-only">{t('timLuuTru')}</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('timLuuTru')} autoComplete="off" spellCheck={false} className="o-nhap pl-10" /></label>
          {cacHang.length > 1 && <div className="flex flex-wrap gap-2" role="group" aria-label={t('locHangSao')}>
            <button type="button" className="chip" aria-pressed={sao === null} onClick={() => setSao(null)}>{t('tatCa')}</button>
            {cacHang.map((n) => (
              <button key={n} type="button" className="chip" aria-pressed={sao === n} onClick={() => setSao(sao === n ? null : n)}>
                {n ? `${n} ★` : t('chuaXepHangSao')}<span className="chip-so">{ds.filter((x) => (x.hangSao || 0) === n).length}</span></button>))}
          </div>}
        </div>}
        {coLoc && !dsHien.length && <p className="the p-6 text-center text-[15px] text-muted" role="status">{t('khongKhopLuuTru')}</p>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{dsHien.map((x, i) => (
          <div key={x.id} className="hien-dan" style={{ '--i': i % 3 } as CSSProperties}>
            <article className="fx-the the relative flex h-full flex-col p-6" data-nghieng="5">
              <b className="block text-[19px] font-semibold leading-snug">{x.ten}</b>
              <span className="mt-2 flex items-center gap-2 text-sm" aria-label={x.hangSao ? `${x.hangSao} ${t('sao')}` : t('chuaXepHangSao')}>
                {x.hangSao ? <HienSao gt={x.hangSao} /> : <span className="text-muted">{t('chuaXepHangSao')}</span>}</span>
              <p className="mt-4 flex flex-1 gap-2 border-t border-line/70 pt-4 text-[15px] text-ink-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted" />{diaChiDu(x)}</p>
              <a href={banDoUrl(x)} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-[40px] w-fit items-center gap-1.5 text-[15px] font-semibold text-action">
                {t('timTrenGoogleMaps')}<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>
            </article>
          </div>))}</div>
      </section>
    </div>);
}
