/** Tin tức, sự kiện, cảnh báo, số điện thoại cần biết — cán bộ đăng ở khu quản trị. */
import { useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CalendarDays, Megaphone, Phone, ArrowUpRight, BadgePercent } from 'lucide-react';
import { DauTrang, TrongRong } from '../../components/du-lich/GiaoDien';
import BangTinNoiBat from '../../components/du-lich/BangTinNoiBat';
import ThanhTin from '../../components/du-lich/ThanhTin';
import { layTinTuc, layDiaDiem, anhTinUrl } from '../../services/api';
import { useNN } from '../../i18n/NgonNgu';
import type { TinTuc } from '../../utils/kieu';

export default function TinTucPage() {
  const { t, chon, ngay } = useNN();
  const { data: tin = [], isLoading } = useQuery({ queryKey: ['tin-tuc'], queryFn: layTinTuc });
  const { data: ds = [] } = useQuery({ queryKey: ['dia-diem'], queryFn: layDiaDiem });
  const [loc, setLoc] = useState<TinTuc['loai'] | null>(null);
  const ds2 = tin.filter((x) => x.loai !== 'lien-he'), lienHe = tin.filter((x) => x.loai === 'lien-he');
  /* Chỉ hiện nút lọc cho loại tin đang có; một loại thì không cần lọc. */
  const cacLoai = (['canh-bao', 'su-kien', 'thong-bao', 'uu-dai'] as const).filter((k) => ds2.some((x) => x.loai === k));
  const dsHien = loc ? ds2.filter((x) => x.loai === loc) : ds2;
  const noiBat = ds2.filter((x) => x.noiBat);
  const IC = { 'canh-bao': AlertTriangle, 'su-kien': CalendarDays, 'thong-bao': Megaphone, 'uu-dai': BadgePercent, 'lien-he': Phone };
  /* Màu theo loại tin: cảnh báo vàng dã quỳ, sự kiện hồng, thông báo xanh biển. Luôn kèm chữ. */
  const MAU = { 'canh-bao': 'vung-quy', 'su-kien': 'vung-hoa', 'thong-bao': 'vung-bien', 'uu-dai': 'mau-uu-dai', 'lien-he': 'vung-bien' };
  const NHAN = { 'canh-bao': t('canhBao'), 'su-kien': t('suKien'), 'thong-bao': t('thongBao'), 'uu-dai': t('uuDai'), 'lien-he': '' };
  return (
    <div className="animate-page">
      <DauTrang tieuDe={t('tinTuc')} moTa={t('tinTucMoTa')}><ThanhTin /></DauTrang>
      {noiBat.length > 0 && <div className="container-page pt-10"><BangTinNoiBat ds={noiBat} /></div>}
      <section className="container-page grid items-start gap-8 py-12 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          {isLoading && <p className="text-muted">{t('dangTai')}</p>}
          {!isLoading && !ds2.length && <TrongRong Ic={Megaphone} mau="vung-bien" tieuDe={t('khongCoTin')} moTa={t('khongCoTinMoTa')}>
            <Link to="/lo-trinh" className="nut nut-vien">{t('goiYLoTrinh')}<ArrowUpRight className="h-4 w-4" /></Link>
          </TrongRong>}
          {cacLoai.length > 1 && <div className="flex flex-wrap gap-2" role="group" aria-label={t('locLoaiTin')}>
            <button type="button" className="chip" aria-pressed={!loc} onClick={() => setLoc(null)}>{t('tatCa')}<span className="chip-so">{ds2.length}</span></button>
            {cacLoai.map((k) => (
              <button key={k} type="button" className={`chip ${MAU[k]}`} aria-pressed={loc === k} onClick={() => setLoc(loc === k ? null : k)}>
                <span className="cham-vung" aria-hidden="true" />{NHAN[k]}<span className="chip-so">{ds2.filter((x) => x.loai === k).length}</span></button>))}
          </div>}
          {dsHien.map((x, i) => { const Ic = IC[x.loai]; const p = ds.find((d) => d.id === x.diaDiemId); const canh = x.loai === 'canh-bao'; return (
            <article key={x.id} className={`group hien-dan the overflow-hidden ${x.anh?.length ? 'sm:grid sm:grid-cols-[minmax(0,240px)_1fr]' : ''} ${canh ? 'border-[#E0B54A] border-l-4 bg-[#FCEFC7] dark:bg-[#3a3216]' : ''}`} style={{ '--i': i % 3 } as CSSProperties}>
              {x.anh?.[0] && <Link to={`/tin-tuc/${x.id}`} tabIndex={-1} aria-hidden="true" className="block aspect-[16/9] overflow-hidden bg-sunken sm:aspect-auto">
                <img src={anhTinUrl(x.anh[0].id)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-105" /></Link>}
              <div className="p-6">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-medium text-muted"><span className={`o-bieu-tuong h-8 w-8 rounded-[10px] ${MAU[x.loai]}`}><Ic className="h-4 w-4" aria-hidden="true" /></span><span className={canh ? 'font-semibold text-ink' : ''}>{NHAN[x.loai]}</span>
                {(x.tuNgay || x.denNgay) && <span>{x.tuNgay ? `${t('tu')} ${ngay(x.tuNgay)} ` : ''}{x.denNgay ? `${t('den')} ${ngay(x.denNgay)}` : ''}</span>}</p>
              <h2 className="mt-2 text-[21px] font-semibold leading-snug"><Link to={`/tin-tuc/${x.id}`} className="underline-offset-2 hover:text-action hover:underline">{chon(x.tieuDe, x.tieuDeEn)}</Link></h2>
              {chon(x.noiDung, x.noiDungEn) && <p className="mt-2 line-clamp-3 whitespace-pre-line text-[16px] leading-relaxed text-ink-2">{chon(x.noiDung, x.noiDungEn)}</p>}
              <div className="mt-3 flex flex-wrap gap-x-5">
                <Link to={`/tin-tuc/${x.id}`} className="inline-flex min-h-[40px] items-center gap-1.5 text-[15px] font-semibold text-action">{t('docTin')}<ArrowUpRight className="h-4 w-4" /></Link>
                {p && <Link to={`/dia-diem/${p.id}`} className="inline-flex min-h-[40px] items-center gap-1.5 text-[15px] font-semibold text-action">{chon(p.ten, p.tenEn)}<ArrowUpRight className="h-4 w-4" /></Link>}
              </div></div>
            </article>); })}
        </div>
        {lienHe.length > 0 && <aside className="hien-dan nen-toi rounded-[20px] p-6 shadow-sh-2 lg:sticky lg:top-24 lg:col-span-4">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold"><Phone className="h-4 w-4" />{t('soCanBiet')}</h2>
          <ul className="mt-3 divide-y divide-white/10">{lienHe.map((x) => (
            <li key={x.id}><a href={`tel:${String(x.noiDung || '').replace(/[^0-9+]/g, '')}`} className="flex min-h-[52px] items-center justify-between gap-3 text-[15px] hover:text-coral">
              <span>{chon(x.tieuDe, x.tieuDeEn)}</span><b className="font-serif text-[26px] font-medium tabular-nums">{x.noiDung}</b></a></li>))}</ul>
        </aside>}
      </section>
    </div>);
}
