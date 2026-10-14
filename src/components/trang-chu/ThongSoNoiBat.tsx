/**
 * Thanh thống kê nổi bật: 4 con số chính hiện ngay dưới hero.
 * Số chạy dần lên bằng DemSo; chưa có dữ liệu thì hiện dấu gạch.
 */
import type { CSSProperties } from 'react';
import { MapPin, Route, MessageSquare, Star } from 'lucide-react';
import DemSo from '../du-lich/DemSo';
import { useNN } from '../../i18n/NgonNgu';
import type { DiaDiem, LoTrinh, ThongKe } from '../../utils/kieu';

interface ThongSoProps {
  ds: DiaDiem[];
  loTrinh: LoTrinh[];
  tk: ThongKe | undefined;
}

const THONG_SO = [
  { khoa: 'nhanDiemDen' as const, Ic: MapPin, layGt: (p: ThongSoProps) => p.ds.length, laSoLe: false },
  { khoa: 'soLoTrinh' as const, Ic: Route, layGt: (p: ThongSoProps) => p.loTrinh.length, laSoLe: false },
  { khoa: 'soDanhGia' as const, Ic: MessageSquare, layGt: (p: ThongSoProps) => p.tk?.danhGia?.so ?? 0, laSoLe: false },
  { khoa: 'diemTrungBinh' as const, Ic: Star, layGt: (p: ThongSoProps) => p.tk?.danhGia?.saoTb ?? 0, laSoLe: true },
] as const;

export default function ThongSoNoiBat({ ds, loTrinh, tk }: ThongSoProps) {
  const { t } = useNN();
  return (
    <div className="border-b border-t border-line/60 bg-sunken/50">
      <div className="container-page grid grid-cols-2 gap-px sm:grid-cols-4">
        {THONG_SO.map(({ khoa, Ic, layGt, laSoLe }, i) => {
          const gt = layGt({ ds, loTrinh, tk });
          return (
            <div key={khoa} className="hien-dan flex items-center gap-3 px-4 py-5 sm:px-5 sm:py-6"
              style={{ '--i': i } as CSSProperties}>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-forest/10 text-forest dark:bg-white/10 dark:text-[#F7F5EF]">
                <Ic className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <b className="so-lon block text-[24px] leading-tight sm:text-[28px]">
                  {gt > 0 ? (laSoLe
                    ? <>{gt.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} <span className="text-gold">★</span></>
                    : <DemSo gt={gt} />
                  ) : '—'}
                </b>
                <span className="block text-[13px] text-muted">{t(khoa)}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
