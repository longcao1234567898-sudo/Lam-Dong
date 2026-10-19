/**
 * Ba thẻ chuyển giữa Tin tức, Lịch sự kiện và Ưu đãi: ba trang chung một mục "Tin tức" trên
 * đầu trang (đầu trang không đủ chỗ cho cả ba). Kèm cách xác định vùng của một tin.
 */
import { NavLink } from 'react-router-dom';
import { Newspaper, CalendarDays, BadgePercent } from 'lucide-react';
import { useNN } from '../../i18n/NgonNgu';
import type { DiaDiem, TinTuc, Vung } from '../../utils/kieu';

/** Vùng của tin: vùng cán bộ chọn, không có thì vùng của địa điểm gắn kèm, không có nữa là toàn tỉnh (null). */
export const vungTin = (x: TinTuc, ds: DiaDiem[]): Vung | null => x.vung ?? ds.find((p) => p.id === x.diaDiemId)?.vung ?? null;

export default function ThanhTin() {
  const { t } = useNN();
  const MUC: [string, string, typeof Newspaper][] = [['/tin-tuc', t('tinTuc'), Newspaper], ['/lich-su-kien', t('lichSuKien'), CalendarDays], ['/uu-dai', t('uuDai'), BadgePercent]];
  return (
    <nav className="mt-6 flex flex-wrap gap-2" aria-label={t('tinTuc')}>
      {MUC.map(([to, ten, Ic]) => (
        <NavLink key={to} to={to} end className="chip min-h-[42px] gap-2 px-4 text-[15px]"><Ic className="h-4 w-4" aria-hidden="true" />{ten}</NavLink>))}
    </nav>);
}
