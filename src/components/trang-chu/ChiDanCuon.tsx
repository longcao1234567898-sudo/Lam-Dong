/** Mũi tên nhấp nháy ở đáy hero: gợi người dùng cuộn xuống. Ẩn trên điện thoại (chật quá). */
import { ChevronDown } from 'lucide-react';
import { useNN } from '../../i18n/NgonNgu';

export default function ChiDanCuon({ onClick }: { onClick: () => void }) {
  const { t } = useNN();
  return (
    <button type="button" onClick={onClick} aria-label={t('cuonXuong')}
      className="hero-hien absolute bottom-16 left-1/2 z-10 hidden h-11 w-11 -translate-x-1/2 animate-bounce place-items-center rounded-full text-[#F7F5EF]/60 transition-colors hover:text-[#F7F5EF] sm:grid"
      style={{ '--tre': '1200ms' } as React.CSSProperties}>
      <ChevronDown className="h-6 w-6" aria-hidden="true" />
    </button>
  );
}
