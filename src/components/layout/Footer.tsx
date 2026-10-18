import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Phone } from 'lucide-react';
import { layTinTuc } from '../../services/api';
import { useNN } from '../../i18n/NgonNgu';
import { DauHieu } from './Header';
import CucQuang from '../hieu-ung/CucQuang';
import { SO_KHAN } from '../../utils/hangSo';

/** Chân trang trên mảng rừng đêm: số điện thoại cần biết (cán bộ quản lý), lối đi nhanh, nguồn bản đồ. */
export default function Footer() {
  const { t, chon, nn } = useNN();
  const { data: tin = [] } = useQuery({ queryKey: ['tin-tuc'], queryFn: layTinTuc });
  const lienHe = tin.filter((x) => x.loai === 'lien-he');
  const NHOM: [string, string[][]][] = [
    [t('nhomLenKeHoach'), [['/', t('khamPha')], ['/lo-trinh', t('goiYLoTrinh')], ['/tu-tao-lo-trinh', t('tuTaoLoTrinh')], ['/luu-tru', t('luuTru')]]],
    [t('nhomCanBiet'), [['/tin-tuc', t('tinTuc')], ['/khach-quoc-te', t('khachQuocTe')], ['/thong-ke', t('thongKe')], ['/phan-anh', t('phanAnh')]]]];
  return (
    <footer className="nen-toi nen-dong-muc relative overflow-hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <CucQuang toi />
      <div className="container-page grid gap-10 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <span className="ba-sac mb-6" aria-hidden="true"><i /><i /><i /></span>
          <div className="flex items-center gap-3"><DauHieu co={40} /><b className="font-serif text-[24px] font-medium">{t('tenTrang')}</b></div>
          <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-[#B9C7C1]">{t('chanTrangMoTa')}</p>
          <p className="mt-5 flex flex-wrap items-center gap-2 text-[13px] text-[#B9C7C1]"><Phone className="h-3.5 w-3.5" aria-hidden="true" />{t('khanCapNgan')}
            {SO_KHAN.map(([so, vi, en]) => <a key={so} href={`tel:${so}`} title={nn === 'en' ? en : vi} aria-label={`${so}: ${nn === 'en' ? en : vi}`}
              className="inline-flex min-h-[32px] items-center rounded-full bg-white/10 px-3 font-semibold tabular-nums text-[#F7F5EF] ring-1 ring-white/15 hover:bg-white/20">{so}</a>)}</p>
        </div>
        <nav className="grid grid-cols-2 gap-6 md:col-span-4" aria-label={t('tenTrang')}>
          {NHOM.map(([tieuDe, ds]) => <div key={tieuDe}>
            <h2 className="mb-1 text-[13px] font-semibold text-[#B9C7C1]">{tieuDe}</h2>
            <ul>{ds.map(([to, ten]) => (
              <li key={to}><Link to={to} className="inline-flex min-h-[40px] items-center text-[15px] leading-snug text-[#F7F5EF] underline-offset-4 hover:underline">{ten}</Link></li>))}</ul>
          </div>)}
        </nav>
        {lienHe.length > 0 && <div className="order-first md:order-none md:col-span-4">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold"><Phone className="h-4 w-4" />{t('soCanBiet')}</h2>
          <ul className="mt-3 divide-y divide-white/10">{lienHe.map((x) => (
            <li key={x.id}><a href={`tel:${String(x.noiDung || '').replace(/[^0-9+]/g, '')}`} className="flex min-h-[48px] items-center justify-between gap-4 text-[15px] hover:text-coral">
              <span>{chon(x.tieuDe, x.tieuDeEn)}</span><b className="font-serif text-[24px] font-medium tabular-nums">{x.noiDung}</b></a></li>))}</ul>
        </div>}
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-5 text-[13px] text-[#B9C7C1]">
          {/* Ghi nguồn bắt buộc (OpenStreetMap: ODbL; Open-Meteo, MET Norway: CC BY 4.0). */}
          <span>{t('nguonBanDo')} {t('nguonThoiTiet')}: <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">Open-Meteo</a>, <a href="https://api.met.no/" target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">MET Norway</a>.</span>
          {/* Mạng xã hội — cán bộ thêm đường dẫn thật sau */}
          <div className="flex items-center gap-2">
            {([['Facebook', 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z'],
              ['YouTube', 'm10 15 5-3-5-3z M21.6 7.2s-.2-1.5-.8-2.1C20 4.2 19 4.2 18.6 4.2 15.5 4 12 4 12 4s-3.5 0-6.6.2c-.5 0-1.4 0-2.2.9-.6.6-.8 2.1-.8 2.1S2 9 2 10.8v1.4c0 1.8.4 3.6.4 3.6s.2 1.5.8 2.1c.8.9 1.9.9 2.4 1 1.7.1 6.4.2 6.4.2s3.5 0 6.6-.2c.5-.1 1.4-.1 2.2-.9.6-.6.8-2.1.8-2.1s.4-1.8.4-3.6v-1.4c0-1.8-.4-3.6-.4-3.6z'],
            ] as const).map(([ten, d]) => (
              <a key={ten} href="#" className="grid h-9 w-9 place-items-center rounded-lg text-[#B9C7C1] transition-colors hover:bg-white/10 hover:text-[#F7F5EF]" aria-label={ten}>
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
              </a>
            ))}
          </div>
          <Link to="/dang-nhap" className="inline-flex min-h-[40px] items-center text-[#F7F5EF] underline-offset-4 hover:underline">{t('choCanBo')}</Link>
        </div>
      </div>
    </footer>
  );
}
