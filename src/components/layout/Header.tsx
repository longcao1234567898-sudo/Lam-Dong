import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ShieldCheck, Moon, Sun, Menu, X, Route } from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { useNN } from '../../i18n/NgonNgu';

/** Dấu hiệu: ô vuông màu rừng, dòng sông san hô, đường núi. Trùng với biểu tượng tab. */
export const DauHieu = ({ co = 36 }: { co?: number }) => (
  <svg width={co} height={co} viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
    <rect width="32" height="32" rx="9" fill="#123C35" />
    <path d="M6 13l5-5 4 3 3-2 8 6" fill="none" stroke="#F7F5EF" strokeWidth="1.6" strokeLinejoin="round" opacity=".7" />
    <path d="M6 22c5-1 6-7 11-8s6 3 9-1" fill="none" stroke="#F17C5B" strokeWidth="2.6" strokeLinecap="round" />
  </svg>);

/** Đầu trang: viên thuốc kính mờ nổi cách mép trên. Ở trang chủ, khi chưa cuộn, kính tối trong
 *  suốt trên ảnh đầu trang; cuộn xuống (và ở trang con) thì thành kính sáng. */
export default function Header() {
  const { staff } = useAdminAuth();
  const { t, nn, doi } = useNN();
  const { pathname } = useLocation();
  const [toi, setToi] = useState(() => { try { return localStorage.getItem('dldn_giao_dien') === 'dark'; } catch { return false; } });
  const [cuon, setCuon] = useState(false);
  const [moMenu, setMoMenu] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', toi);
    try { localStorage.setItem('dldn_giao_dien', toi ? 'dark' : 'light'); } catch { /* bỏ qua */ }
  }, [toi]);
  /* Đã cuộn quá 40px chưa: theo dõi một mốc 1px bằng IntersectionObserver, không nghe sự kiện cuộn từng khung hình. */
  useEffect(() => {
    const moc = document.createElement('div');
    moc.setAttribute('aria-hidden', 'true');
    moc.style.cssText = 'position:absolute;top:40px;left:0;width:1px;height:1px;pointer-events:none;visibility:hidden';
    document.body.prepend(moc);
    const io = new IntersectionObserver(([m]) => setCuon(!m.isIntersecting));
    io.observe(moc);
    return () => { io.disconnect(); moc.remove(); };
  }, []);
  useEffect(() => { setMoMenu(false); }, [pathname]);
  useEffect(() => { if (!moMenu) return; const k = (e: KeyboardEvent) => e.key === 'Escape' && setMoMenu(false); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [moMenu]);
  const trenCanh = pathname === '/' && !cuon && !moMenu;
  const MUC = [
    { to: '/', ten: t('khamPha'), end: true },
    { to: '/lo-trinh', ten: t('loTrinh') },
    { to: '/an-gi', ten: t('anGi') },
    { to: '/luu-tru', ten: t('luuTru') },
    { to: '/tin-tuc', ten: t('tinTuc') },
    { to: '/phan-anh', ten: t('phanAnh') },
    { to: '/thong-ke', ten: t('thongKe') },
  ];
  const lop = ({ isActive }: { isActive: boolean }) => `gach-ba-sac relative inline-flex min-h-[44px] items-center whitespace-nowrap rounded-full px-3 text-[14.5px] font-medium transition-colors ${trenCanh ? 'hover:bg-white/10' : 'hover:bg-sunken/80'}
    after:absolute after:inset-x-3 after:bottom-1.5 after:h-[2px] after:rounded-full after:transition-transform after:duration-300 ${isActive ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-50'}
    ${trenCanh ? 'text-[#F7F5EF]' : 'text-ink'}`;
  const nutPhu = `grid h-11 min-w-[44px] place-items-center rounded-full px-2 text-[13px] font-semibold transition-colors ${trenCanh ? 'text-[#F7F5EF] hover:bg-white/10' : 'text-ink-2 hover:bg-sunken'}`;
  return (
    /* Cao tổng cộng 4.25rem (0.75rem khoảng hở + 3.5rem viên thuốc): đầu trang chủ kéo lên đúng chừng đó để ảnh nằm dưới. */
    <header className="dau-trang pointer-events-none sticky top-0 z-[600] px-2 sm:px-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}>
      <div className={`vien-dau pointer-events-auto mx-auto flex h-14 max-w-[1280px] items-center gap-1 rounded-full pl-2 pr-1.5 sm:pl-3 ${trenCanh ? 'vien-dau-toi' : 'vien-dau-sang'}`}>
        <Link to="/" className="mr-auto flex min-w-0 items-center gap-2.5 rounded-full py-1 pr-2" aria-label={t('tenTrang')}>
          <DauHieu co={36} />
          <span className={`truncate font-serif text-[19px] font-medium tracking-[-0.01em] sm:text-[21px] ${trenCanh ? 'text-[#F7F5EF]' : 'text-forest dark:text-ink'}`}>{t('tenTrang')}</span>
        </Link>
        <nav className="hidden lg:flex" aria-label={t('tenTrang')}>
          {MUC.map((m) => <NavLink key={m.to} to={m.to} end={m.end} className={lop}>{m.ten}</NavLink>)}
        </nav>
        <Link to="/lo-trinh" className={`nut ${trenCanh ? 'nut-coral' : 'nut-chinh'} ml-1 hidden min-h-[40px] rounded-full px-4 text-[13px] xl:inline-flex`}>
          <Route className="h-4 w-4" />{t('goiYLoTrinh')}
        </Link>
        {staff && <Link to="/quan-tri" className={`${nutPhu} gap-1.5`} title={t('quanTri')}><ShieldCheck className="h-[18px] w-[18px]" /><span className="sr-only">{t('quanTri')}</span></Link>}
        <button type="button" onClick={doi} title={t('doiNgonNgu')} aria-label={t('doiNgonNgu')} className={nutPhu}>{nn === 'vi' ? 'EN' : 'VI'}</button>
        <button type="button" onClick={() => setToi((x) => !x)} aria-label={t('doiGiaoDien')} className={nutPhu}>{toi ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</button>
        <button type="button" onClick={() => setMoMenu((m) => !m)} aria-expanded={moMenu} aria-controls="menu-nho" aria-label={t('danhMuc')} className={`${nutPhu} lg:hidden`}>
          {moMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button>
      </div>
      {moMenu && <nav id="menu-nho" className="hop-thoai vien-dau vien-dau-sang vien-menu pointer-events-auto mx-auto mt-2 max-w-[1280px] overflow-y-auto overscroll-contain rounded-[28px] p-2 lg:hidden"
        style={{ maxHeight: 'calc(100svh - 6rem)' }} aria-label={t('tenTrang')}>
        <div className="flex flex-col">
          {MUC.map((m) => <NavLink key={m.to} to={m.to} end={m.end} className={({ isActive }) => `flex min-h-[52px] items-center rounded-2xl px-4 font-serif text-[22px] ${isActive ? 'bg-sunken text-action' : 'text-ink'}`}>{m.ten}</NavLink>)}
          <Link to="/lo-trinh" className="nut nut-chinh mx-2 mb-2 mt-2 rounded-full"><Route className="h-4 w-4" />{t('goiYLoTrinh')}</Link>
        </div></nav>}
    </header>
  );
}
