/**
 * Dự báo thời tiết, hai nguồn miễn phí không cần khoá (cả hai giấy phép CC BY 4.0 — nơi hiện
 * số liệu PHẢI ghi nguồn — ghi ở chân trang, Footer.tsx):
 *  1. Open-Meteo (open-meteo.com): một lần gọi lấy được nhiều nơi, có sẵn số theo ngày.
 *  2. MET Norway (api.met.no, Viện Khí tượng Na Uy): dự phòng khi Open-Meteo lỗi hoặc báo
 *     quá giới hạn (429). Trả số theo giờ, ở đây gộp thành theo ngày.
 * Cả hai đều tính nhiệt độ theo độ cao địa hình của toạ độ, nên Đà Lạt ra đúng khí hậu cao nguyên.
 *
 * Gọi thẳng từ trình duyệt (giới hạn tính theo IP của từng người xem, không dồn vào một máy
 * chủ). Để đỡ gọi lại: kết quả giữ trên máy người xem 30 phút; Open-Meteo báo quá giới hạn
 * thì nghỉ 10 phút, đi thẳng sang MET Norway.
 */
export type NguonTT = 'open-meteo' | 'met-no';
export interface DuBao {
  nguon: NguonTT;
  /** camGiac: nhiệt độ cảm nhận — MET Norway không có thì null. */
  hienTai: { nhiet: number; camGiac: number | null; doAm: number; gio: number; ma: number; banNgay: boolean; luc: string };
  /** Bảy ngày, ngày đầu là hôm nay (giờ Việt Nam). ma: mã thời tiết WMO, lấy hiện tượng nặng nhất
   *  trong ngày. mua: khả năng mưa cao nhất trong ngày (%). */
  ngay: { ngay: string; ma: number; cao: number; thap: number; mua: number | null; uv: number | null }[];
}
type Diem = { lat: number; lng: number };

const GIU = 30 * 60_000, NGHI_429 = 10 * 60_000;
let nghiOpenMeteoDen = 0;

/* ---------- 1. Open-Meteo ---------- */
interface ThoOM {
  current: { time: string; temperature_2m: number; relative_humidity_2m: number; apparent_temperature: number; is_day: number; weather_code: number; wind_speed_10m: number };
  daily: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[];
    precipitation_probability_max?: (number | null)[]; uv_index_max?: (number | null)[] };
}
const tuOpenMeteo = (x: ThoOM): DuBao => ({
  nguon: 'open-meteo',
  hienTai: { nhiet: x.current.temperature_2m, camGiac: x.current.apparent_temperature, doAm: x.current.relative_humidity_2m,
    gio: x.current.wind_speed_10m, ma: x.current.weather_code, banNgay: x.current.is_day === 1, luc: x.current.time },
  ngay: x.daily.time.map((ngay, i) => ({ ngay, ma: x.daily.weather_code[i], cao: x.daily.temperature_2m_max[i], thap: x.daily.temperature_2m_min[i],
    mua: x.daily.precipitation_probability_max?.[i] ?? null, uv: x.daily.uv_index_max?.[i] ?? null })),
});

async function openMeteo(ds: Diem[], signal?: AbortSignal): Promise<DuBao[]> {
  const q = new URLSearchParams({
    latitude: ds.map((d) => d.lat.toFixed(4)).join(','), longitude: ds.map((d) => d.lng.toFixed(4)).join(','),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max',
    timezone: 'Asia/Ho_Chi_Minh', forecast_days: '7',
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${q}`, { signal });
  if (res.status === 429) nghiOpenMeteoDen = Date.now() + NGHI_429;
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  const j = await res.json();
  /* Một nơi thì trả về một đối tượng, nhiều nơi thì trả về mảng theo đúng thứ tự gửi. */
  return (Array.isArray(j) ? j : [j]).map(tuOpenMeteo);
}

/* ---------- 2. MET Norway ---------- */
type Chi = { symbol_code?: string } | undefined;
type ChiTietMet = { precipitation_amount?: number; probability_of_precipitation?: number; air_temperature_max?: number; air_temperature_min?: number } | undefined;
interface MocMet { time: string; data: { instant: { details: { air_temperature: number; relative_humidity: number; wind_speed: number } };
  next_1_hours?: { summary?: Chi; details?: ChiTietMet }; next_6_hours?: { summary?: Chi; details?: ChiTietMet } } }

/** Ký hiệu thời tiết của MET Norway -> mã WMO (để dùng chung tên và biểu tượng). */
function maTuKyHieu(s: string | undefined): number | null {
  if (!s) return null;
  const k = s.replace(/_(day|night|polartwilight)$/, '');
  if (k.includes('thunder')) return 95;
  if (k.includes('snow') || k.includes('sleet')) return 71;
  return ({ heavyrainshowers: 82, rainshowers: 81, lightrainshowers: 80, heavyrain: 65, rain: 63, lightrain: 61,
    fog: 45, cloudy: 3, partlycloudy: 2, fair: 1, clearsky: 0 } as Record<string, number>)[k] ?? 3;
}
/** Giờ Việt Nam (UTC+7, không đổi giờ mùa hè) của một mốc UTC: "2026-10-18T10:00". */
const gioVn = (iso: string) => new Date(Date.parse(iso) + 7 * 3_600_000).toISOString().slice(0, 16);

async function metNo(d: Diem, signal?: AbortSignal): Promise<DuBao> {
  /* Điều khoản của MET Norway: toạ độ tối đa 4 chữ số thập phân. Trình duyệt tự gửi Origin để định danh trang. */
  const res = await fetch(`https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=${d.lat.toFixed(4)}&lon=${d.lng.toFixed(4)}`, { signal });
  if (!res.ok) throw new Error(`MET Norway ${res.status}`);
  const ts: MocMet[] = (await res.json())?.properties?.timeseries || [];
  if (!ts.length) throw new Error('MET Norway: không có số liệu');
  const dau = ts[0].data, kh = dau.next_1_hours?.summary?.symbol_code || dau.next_6_hours?.summary?.symbol_code;
  const theoNgay = new Map<string, { nhiet: number[]; mua: number[]; ma: number[] }>();
  for (const m of ts) {
    const ngay = gioVn(m.time).slice(0, 10);
    if (!theoNgay.has(ngay)) { if (theoNgay.size === 7) break; theoNgay.set(ngay, { nhiet: [], mua: [], ma: [] }); }
    const g = theoNgay.get(ngay)!;
    g.nhiet.push(m.data.instant.details.air_temperature);
    for (const k of [m.data.next_1_hours, m.data.next_6_hours]) {
      const c = k?.details;
      if (c?.air_temperature_max !== undefined) g.nhiet.push(c.air_temperature_max);
      if (c?.air_temperature_min !== undefined) g.nhiet.push(c.air_temperature_min);
      if (c?.probability_of_precipitation !== undefined) g.mua.push(c.probability_of_precipitation);
      const ma = maTuKyHieu(k?.summary?.symbol_code);
      if (ma !== null) g.ma.push(ma);
    }
  }
  const i0 = dau.instant.details;
  return {
    nguon: 'met-no',
    hienTai: { nhiet: i0.air_temperature, camGiac: null, doAm: i0.relative_humidity, gio: i0.wind_speed * 3.6,
      ma: maTuKyHieu(kh) ?? 3, banNgay: !kh?.endsWith('_night'), luc: gioVn(ts[0].time) },
    ngay: [...theoNgay].map(([ngay, g]) => ({ ngay, cao: Math.max(...g.nhiet), thap: Math.min(...g.nhiet),
      ma: g.ma.length ? Math.max(...g.ma) : 3, mua: g.mua.length ? Math.round(Math.max(...g.mua)) : null, uv: null })),
  };
}

/* ---------- Giữ trên máy người xem ---------- */
const khoa = (ds: Diem[]) => 'thoi-tiet:' + ds.map((d) => `${d.lat.toFixed(3)},${d.lng.toFixed(3)}`).join(';');
function docGiu(k: string): DuBao[] | null {
  try { const x = JSON.parse(localStorage.getItem(k) || 'null'); return x && Date.now() - x.luc < GIU ? x.ds : null; } catch { return null; }
}
function ghiGiu(k: string, ds: DuBao[]) { try { localStorage.setItem(k, JSON.stringify({ luc: Date.now(), ds })); } catch { /* đầy hoặc bị chặn: bỏ qua */ } }

/** Dự báo cho các nơi, đúng thứ tự gửi vào. Open-Meteo trước, lỗi thì MET Norway. */
export async function layThoiTiet(ds: Diem[], signal?: AbortSignal): Promise<DuBao[]> {
  const k = khoa(ds);
  const giu = docGiu(k);
  if (giu) return giu;
  let kq: DuBao[];
  try {
    if (Date.now() < nghiOpenMeteoDen) throw new Error('Open-Meteo đang nghỉ sau 429');
    kq = await openMeteo(ds, signal);
  } catch (e) {
    if (signal?.aborted) throw e;
    kq = await Promise.all(ds.map((d) => metNo(d, signal)));
  }
  ghiGiu(k, kq);
  return kq;
}
