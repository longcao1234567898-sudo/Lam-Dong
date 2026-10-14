/** Nút tròn nổi: bấm cuộn về đầu trang. Hiện khi đã cuộn quá 600px. */
import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { giamChuyenDong } from '../../utils/hangSo';
import { useNN } from '../../i18n/NgonNgu';

export default function NutLenDau() {
  const { t } = useNN();
  const [hien, setHien] = useState(false);

  useEffect(() => {
    /* Dùng IntersectionObserver theo dõi một mốc ở 600px — không nghe cuộn từng khung hình. */
    const moc = document.createElement('div');
    moc.setAttribute('aria-hidden', 'true');
    moc.style.cssText = 'position:absolute;top:600px;left:0;width:1px;height:1px;pointer-events:none;visibility:hidden';
    document.body.prepend(moc);
    const io = new IntersectionObserver(([m]) => setHien(!m.isIntersecting));
    io.observe(moc);
    return () => { io.disconnect(); moc.remove(); };
  }, []);

  if (!hien) return null;

  return (
    <button type="button" aria-label={t('lenDau')}
      onClick={() => window.scrollTo({ top: 0, behavior: giamChuyenDong() ? 'auto' : 'smooth' })}
      className="fixed bottom-6 right-6 z-[500] grid h-12 w-12 animate-page place-items-center rounded-full bg-forest/90 text-[#F7F5EF] shadow-sh-2 backdrop-blur-sm transition-all hover:bg-forest hover:shadow-sh-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
      style={{ bottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
