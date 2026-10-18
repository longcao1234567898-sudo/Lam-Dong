/**
 * Mảnh hiển thị thời tiết dùng chung: tên và biểu tượng theo mã thời tiết WMO, danh sách bảy
 * ngày, dòng ghi nguồn (bắt buộc theo giấy phép CC BY 4.0 của Open-Meteo) và khối thời tiết
 * gọn cho trang một địa điểm. Số liệu lấy thật mỗi lần (giữ 30 phút), không có số dựng sẵn:
 * chưa tải được thì nói thẳng.
 */
import type { CSSProperties } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sun, Moon, CloudSun, CloudMoon, Cloud, CloudFog, CloudDrizzle, CloudRain, CloudLightning, CloudSnow, CloudHail, Droplets, RefreshCw } from 'lucide-react';
import { layThoiTiet, type DuBao } from '../../services/thoiTiet';
import { useNN } from '../../i18n/NgonNgu';
import type { DiaDiem } from '../../utils/kieu';

type Ic = typeof Sun;
/** Mã thời tiết WMO (Open-Meteo dùng) -> biểu tượng, tên tiếng Việt, tên tiếng Anh. */
export function moTaMa(ma: number, banNgay = true): [Ic, string, string] {
  if (ma === 0) return [banNgay ? Sun : Moon, 'Trời quang', 'Clear sky'];
  if (ma === 1) return [banNgay ? Sun : Moon, 'Ít mây', 'Mostly clear'];
  if (ma === 2) return [banNgay ? CloudSun : CloudMoon, 'Mây rải rác', 'Partly cloudy'];
  if (ma === 3) return [Cloud, 'Nhiều mây', 'Overcast'];
  if (ma === 45 || ma === 48) return [CloudFog, 'Sương mù', 'Fog'];
  if (ma >= 51 && ma <= 57) return [CloudDrizzle, 'Mưa phùn', 'Drizzle'];
  if (ma === 61) return [CloudRain, 'Mưa nhỏ', 'Light rain'];
  if (ma === 63 || ma === 66) return [CloudRain, 'Mưa vừa', 'Rain'];
  if (ma === 65 || ma === 67) return [CloudRain, 'Mưa to', 'Heavy rain'];
  if (ma === 80) return [CloudRain, 'Mưa rào nhẹ', 'Light showers'];
  if (ma === 81) return [CloudRain, 'Mưa rào', 'Showers'];
  if (ma === 82) return [CloudRain, 'Mưa rào rất to', 'Violent showers'];
  if ((ma >= 71 && ma <= 77) || ma === 85 || ma === 86) return [CloudSnow, 'Tuyết', 'Snow'];
  if (ma === 95) return [CloudLightning, 'Dông', 'Thunderstorm'];
  if (ma === 96 || ma === 99) return [CloudHail, 'Dông, có thể có mưa đá', 'Thunderstorm with hail'];
  return [Cloud, 'Nhiều mây', 'Cloudy'];
}

/** Mức tia UV theo thang của WHO. */
export const mucUv = (n: number): [string, string] =>
  n < 3 ? ['thấp', 'low'] : n < 6 ? ['trung bình', 'moderate'] : n < 8 ? ['cao', 'high'] : n < 11 ? ['rất cao', 'very high'] : ['cực cao', 'extreme'];

export const do_ = (n: number) => `${Math.round(n)}°`;

/** Dự báo cho nhiều nơi trong một lần gọi; giữ 30 phút (Open-Meteo cập nhật theo giờ). */
export function useThoiTiet(ds: { lat: number; lng: number }[]) {
  return useQuery({ queryKey: ['thoi-tiet', ds.map((d) => `${d.lat.toFixed(3)},${d.lng.toFixed(3)}`).join(';')],
    queryFn: ({ signal }) => layThoiTiet(ds, signal), enabled: ds.length > 0,
    staleTime: 30 * 60_000, gcTime: 60 * 60_000, retry: 1, refetchOnWindowFocus: false });
}

/** "Hôm nay", rồi thứ trong tuần. Chuỗi ngày dạng 2026-10-18 theo giờ Việt Nam: dựng ngày cục bộ để không lệch múi giờ. */
function useTenNgay() {
  const { t, nn } = useNN();
  return (s: string, i: number) => {
    if (i === 0) return t('homNay');
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(nn === 'en' ? 'en-GB' : 'vi-VN', { weekday: 'short' });
  };
}

/** Bảy dòng: thứ, biểu tượng, khả năng mưa, thấp nhất — thanh khoảng nhiệt — cao nhất (thanh chung một thang cho cả tuần). */
export function BayNgay({ db }: { db: DuBao }) {
  const { t, nn } = useNN();
  const tenNgay = useTenNgay();
  const lo = Math.min(...db.ngay.map((x) => x.thap)), hi = Math.max(...db.ngay.map((x) => x.cao)), rong = Math.max(1, hi - lo);
  return (
    <ul className="divide-y divide-line/50">{db.ngay.map((x, i) => { const [Ic, vi, en] = moTaMa(x.ma); return (
      <li key={x.ngay} className="grid grid-cols-[4.25rem_1.25rem_2.75rem_2rem_minmax(2.5rem,1fr)_2rem] items-center gap-2 py-2 text-[14px]">
        <span className={i === 0 ? 'font-semibold' : 'text-ink-2'}>{tenNgay(x.ngay, i)}</span>
        <Ic className="h-5 w-5 text-[var(--vm,rgb(var(--c-action)))]" aria-hidden="true" /><span className="sr-only">{nn === 'en' ? en : vi}</span>
        <span className={`inline-flex items-center gap-0.5 text-[12.5px] tabular-nums ${x.mua !== null && x.mua >= 50 ? 'font-semibold text-bien-dam' : 'text-muted'}`}>
          {x.mua !== null && <><Droplets className="h-3 w-3" aria-hidden="true" />{x.mua}%<span className="sr-only"> {t('khaNangMua')}</span></>}</span>
        <span className="text-right tabular-nums text-muted">{do_(x.thap)}</span>
        <span className="relative h-1.5 rounded-full bg-line/70" aria-hidden="true">
          <span className="absolute inset-y-0 rounded-full" style={{ left: `${((x.thap - lo) / rong) * 100}%`, right: `${((hi - x.cao) / rong) * 100}%`,
            background: 'linear-gradient(90deg, rgb(var(--c-bien)), rgb(var(--c-quy)))' } as CSSProperties} /></span>
        <span className="tabular-nums font-semibold">{do_(x.cao)}</span>
      </li>); })}</ul>);
}

/** Chưa tải được: nói thẳng, cho thử lại. */
export function LoiThoiTiet({ onThuLai }: { onThuLai: () => void }) {
  const { t } = useNN();
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-muted" role="status">{t('chuaTaiThoiTiet')}
      <button type="button" onClick={onThuLai} className="inline-flex min-h-[36px] items-center gap-1.5 font-semibold text-action"><RefreshCw className="h-4 w-4" aria-hidden="true" />{t('thuLaiThoiTiet')}</button></p>);
}

/** Thời tiết tại một địa điểm (trang riêng và hộp chi tiết): bây giờ, rồi bảy ngày theo cột. */
export function ThoiTietDiem({ p }: { p: DiaDiem }) {
  const { t, nn } = useNN();
  const tenNgay = useTenNgay();
  const { data, isLoading, isError, refetch } = useThoiTiet([{ lat: p.lat, lng: p.lng }]);
  const db = data?.[0];
  return (
    <section className="mt-6 rounded-2xl border border-line/60 bg-sunken/40 p-4 sm:p-5" aria-labelledby={`tt-${p.id}`}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h3 id={`tt-${p.id}`} className="text-[15px] font-semibold">{t('thoiTietTaiDay')}</h3>
        {db && (() => { const [Ic, vi, en] = moTaMa(db.hienTai.ma, db.hienTai.banNgay); return (
          <p className="flex items-center gap-2 text-[14px] text-ink-2"><Ic className="h-5 w-5 text-action" aria-hidden="true" />
            <b className="font-serif text-[22px] font-medium leading-none text-ink">{do_(db.hienTai.nhiet)}</b>{nn === 'en' ? en : vi}</p>); })()}
      </div>
      {isLoading && <div className="skeleton mt-3 h-24 rounded-xl" />}
      {isError && <div className="mt-2"><LoiThoiTiet onThuLai={() => refetch()} /></div>}
      {db && <ol className="khong-thanh-cuon -mx-1 mt-3 grid grid-cols-7 gap-1 overflow-x-auto">{db.ngay.map((x, i) => { const [Ic, vi, en] = moTaMa(x.ma); return (
        <li key={x.ngay} className={`flex min-w-[2.9rem] flex-col items-center gap-1 rounded-xl px-1 py-2 text-center ${i === 0 ? 'bg-paper shadow-sh-1' : ''}`}>
          <span className="text-[12px] font-medium text-muted">{tenNgay(x.ngay, i)}</span>
          <Ic className="h-5 w-5 text-action" aria-hidden="true" /><span className="sr-only">{nn === 'en' ? en : vi}</span>
          <span className="text-[13px] tabular-nums"><b className="font-semibold">{do_(x.cao)}</b> <span className="text-muted">{do_(x.thap)}</span></span>
          {x.mua !== null && <span className={`text-[11.5px] tabular-nums ${x.mua >= 50 ? 'font-semibold text-bien-dam' : 'text-muted'}`}>{x.mua}%<span className="sr-only"> {t('khaNangMua')}</span></span>}
        </li>); })}</ol>}
    </section>);
}
