/**
 * Lịch sự kiện: tin loại "su-kien" có ngày bắt đầu, xếp lên lưới tháng (tuần bắt đầu thứ Hai).
 * Bấm một ngày để xem sự kiện ngày đó; tháng đang xem nằm trên đường dẫn (?thang=2026-12) để
 * gửi cho người khác. Máy chủ chỉ trả sự kiện chưa kết thúc, nên lịch là lịch sắp tới.
 * Danh sách bên phải đổi theo ngày, tháng đang chọn nên không dùng hiệu ứng hiện dần khi cuộn.
 */
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, ChevronLeft, ChevronRight, CalendarPlus, MapPin, ArrowUpRight } from 'lucide-react';
import { DauTrang } from '../../components/du-lich/GiaoDien';
import ThanhTin, { vungTin } from '../../components/du-lich/ThanhTin';
import { layTinTuc, layDiaDiem } from '../../services/api';
import { VUNG, lopVung } from '../../utils/hangSo';
import { useNN } from '../../i18n/NgonNgu';
import type { TinTuc, Vung } from '../../utils/kieu';

const hai = (n: number) => String(n).padStart(2, '0');
const khoa = (d: Date) => `${d.getFullYear()}-${hai(d.getMonth() + 1)}-${hai(d.getDate())}`;
const docNgay = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };

/** Đường dẫn mở Google Lịch với sự kiện điền sẵn (cả ngày; ngày kết thúc tính "đến hết ngày"). */
function linkGoogleLich(ten: string, tu: string, den: string, moTa: string, noi: string) {
  const sau = docNgay(den); sau.setDate(sau.getDate() + 1);
  const q = new URLSearchParams({ action: 'TEMPLATE', text: ten, dates: `${tu.replace(/-/g, '')}/${khoa(sau).replace(/-/g, '')}`, details: moTa, location: noi });
  return `https://calendar.google.com/calendar/render?${q}`;
}

type Sk = { x: TinTuc; tu: string; den: string; v: Vung | null };

export default function LichSuKienPage() {
  const { t, chon, nn, ngay } = useNN();
  const [tham, datTham] = useSearchParams();
  const { data: tin = [], isLoading } = useQuery({ queryKey: ['tin-tuc'], queryFn: layTinTuc });
  const { data: ds = [] } = useQuery({ queryKey: ['dia-diem'], queryFn: layDiaDiem });
  const [chonNgay, setChonNgay] = useState<string | null>(null);
  const [loc, setLoc] = useState<Vung | null>(null);

  const homNay = khoa(new Date());
  const thang = /^\d{4}-\d{2}$/.test(tham.get('thang') || '') ? tham.get('thang')! : homNay.slice(0, 7);
  const [y, m] = thang.split('-').map(Number);
  const doiThang = (buoc: number) => { const d = new Date(y, m - 1 + buoc, 1); setChonNgay(null); datTham({ thang: `${d.getFullYear()}-${hai(d.getMonth() + 1)}` }, { replace: true }); };

  const tatCa: Sk[] = useMemo(() => tin.filter((x) => x.loai === 'su-kien' && x.tuNgay)
    .map((x) => ({ x, tu: x.tuNgay!, den: x.denNgay && x.denNgay >= x.tuNgay! ? x.denNgay : x.tuNgay!, v: vungTin(x, ds) }))
    .sort((a, b) => a.tu.localeCompare(b.tu)), [tin, ds]);
  const chuaNgay = tin.filter((x) => x.loai === 'su-kien' && !x.tuNgay);
  const cacVung = (Object.keys(VUNG) as Vung[]).filter((v) => tatCa.some((s) => s.v === v));
  const sk = loc ? tatCa.filter((s) => s.v === loc) : tatCa;
  const trongNgay = (k: string) => sk.filter((s) => s.tu <= k && k <= s.den);

  /* Lưới: từ thứ Hai của tuần chứa ngày 1 tới Chủ nhật của tuần chứa ngày cuối tháng. */
  const dau = new Date(y, m - 1, 1), cuoi = new Date(y, m, 0);
  const batDau = new Date(dau); batDau.setDate(1 - ((dau.getDay() + 6) % 7));
  const soO = Math.ceil(((dau.getDay() + 6) % 7 + cuoi.getDate()) / 7) * 7;
  const o = Array.from({ length: soO }, (_, i) => { const d = new Date(batDau); d.setDate(batDau.getDate() + i); return d; });
  const dauThang = `${thang}-01`, cuoiThang = khoa(cuoi);
  const trongThang = sk.filter((s) => s.tu <= cuoiThang && s.den >= dauThang);
  const dsHien = chonNgay ? trongNgay(chonNgay) : trongThang;
  const tenThang = (() => { const s = dau.toLocaleDateString(nn === 'en' ? 'en-GB' : 'vi-VN', { month: 'long', year: 'numeric' }); return s.charAt(0).toUpperCase() + s.slice(1); })();
  const thu = t('thuNgan').split(',');
  const khoang = (s: Sk) => (s.tu === s.den ? ngay(s.tu) : `${ngay(s.tu)} – ${ngay(s.den)}`);

  return (
    <div className="animate-page">
      <DauTrang tieuDe={t('lichSuKien')} moTa={t('lichMoTa')}><ThanhTin /></DauTrang>
      <section className="container-page grid items-start gap-8 py-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="tieu-de-vua" aria-live="polite">{tenThang}</h2>
            <div className="flex items-center gap-1.5">
              <button type="button" className="grid h-11 w-11 place-items-center rounded-full border border-line-strong/50 hover:bg-sunken" onClick={() => doiThang(-1)} aria-label={t('thangTruoc')}><ChevronLeft className="h-5 w-5" /></button>
              {thang !== homNay.slice(0, 7) && <button type="button" className="chip min-h-[44px]" onClick={() => { setChonNgay(null); datTham({}, { replace: true }); }}>{t('thangNay')}</button>}
              <button type="button" className="grid h-11 w-11 place-items-center rounded-full border border-line-strong/50 hover:bg-sunken" onClick={() => doiThang(1)} aria-label={t('thangSau')}><ChevronRight className="h-5 w-5" /></button>
            </div>
          </div>
          {cacVung.length > 1 && <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label={t('vung')}>
            <button type="button" className="chip" aria-pressed={!loc} onClick={() => setLoc(null)}>{t('tatCa')}</button>
            {cacVung.map((v) => <button key={v} type="button" className={`chip ${lopVung(v)}`} aria-pressed={loc === v} onClick={() => setLoc(loc === v ? null : v)}>
              <span className="cham-vung" aria-hidden="true" />{nn === 'en' ? VUNG[v].nganEn : VUNG[v].ngan}</button>)}
          </div>}
          <div className="the overflow-hidden p-2 sm:p-3">
            <div className="grid grid-cols-7 text-center text-[12px] font-semibold text-muted" aria-hidden="true">{thu.map((x) => <span key={x} className="py-2">{x}</span>)}</div>
            <div className="grid grid-cols-7 gap-1">{o.map((d) => {
              const k = khoa(d), ngoai = d.getMonth() !== m - 1, qua = k < homNay, cac = ngoai ? [] : trongNgay(k), dangChon = chonNgay === k;
              return (
                <button key={k} type="button" disabled={ngoai} onClick={() => setChonNgay(dangChon ? null : k)} aria-pressed={dangChon}
                  aria-label={`${ngay(k)}${cac.length ? `: ${cac.length} ${t('suKien').toLowerCase()}` : ''}`}
                  className={`flex min-h-[52px] flex-col items-stretch rounded-xl p-1 text-left transition-colors sm:min-h-[84px] sm:p-1.5 ${ngoai ? 'invisible' : dangChon ? 'bg-forest text-[#F7F5EF] dark:bg-action dark:text-[#192522]' : 'hover:bg-sunken'} ${qua && !dangChon ? 'opacity-50' : ''}`}>
                  <span className={`grid h-7 w-7 place-items-center self-center rounded-full text-[13px] tabular-nums sm:self-start ${k === homNay && !dangChon ? 'bg-action font-bold text-white' : ''}`}>{d.getDate()}</span>
                  {/* Màn nhỏ: chấm màu. Màn rộng: tên sự kiện rút gọn. */}
                  {cac.length > 0 && <span className="mt-0.5 flex justify-center gap-0.5 sm:hidden" aria-hidden="true">{cac.slice(0, 3).map((s) => <span key={s.x.id} className={`h-1.5 w-1.5 rounded-full ${s.v ? lopVung(s.v) : 'mau-uu-dai'}`} style={{ background: 'var(--vm)' }} />)}</span>}
                  <span className="mt-0.5 hidden flex-col gap-0.5 sm:flex" aria-hidden="true">{cac.slice(0, 2).map((s) => (
                    <span key={s.x.id} className={`truncate rounded-md px-1.5 py-0.5 text-[11px] font-medium text-white ${s.v ? lopVung(s.v) : 'mau-uu-dai'}`} style={{ background: 'var(--vm)' }}>{chon(s.x.tieuDe, s.x.tieuDeEn)}</span>))}
                    {cac.length > 2 && <span className="px-1 text-[11px] font-semibold">+{cac.length - 2}</span>}</span>
                </button>); })}</div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:col-span-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-[17px] font-semibold">{chonNgay ? t('suKienNgay', { d: ngay(chonNgay) }) : t('suKienThang')}</h2>
            {chonNgay && <button type="button" className="text-sm font-semibold text-action" onClick={() => setChonNgay(null)}>{t('xemCaThang')}</button>}
          </div>
          {isLoading && <p className="text-muted">{t('dangTai')}</p>}
          {!isLoading && !dsHien.length && <p className="the p-5 text-[15px] text-muted">{chonNgay ? t('khongCoSuKienNgay') : t('khongCoSuKienThang')}</p>}
          <ol className="space-y-3">{dsHien.map((s) => {
            const p = ds.find((d) => d.id === s.x.diaDiemId), dang = s.tu <= homNay && homNay <= s.den;
            const ten = chon(s.x.tieuDe, s.x.tieuDeEn);
            return (
              <li key={s.x.id} className={`the overflow-hidden ${s.v ? lopVung(s.v) : 'mau-uu-dai'}`}>
                <div className="flex">
                  <span className="w-1.5 shrink-0" style={{ background: 'var(--vm)' }} aria-hidden="true" />
                  <div className="min-w-0 flex-1 p-4">
                    <p className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-muted"><CalendarDays className="h-4 w-4" aria-hidden="true" />{khoang(s)}
                      {dang && <span className="rounded-full bg-[#FCEFC7] px-2 py-0.5 text-[12px] font-semibold text-[#5c3d00] dark:bg-[#3a3216] dark:text-[#F4D27A]">{t('dangDienRa')}</span>}
                      {s.v && <span className={`nhan-vung ${lopVung(s.v)}`}>{nn === 'en' ? VUNG[s.v].nganEn : VUNG[s.v].ngan}</span>}</p>
                    <h3 className="mt-1.5 text-[17px] font-semibold leading-snug"><Link to={`/tin-tuc/${s.x.id}`} className="underline-offset-2 hover:text-action hover:underline">{ten}</Link></h3>
                    <div className="mt-2 flex flex-wrap gap-x-4 text-[14px] font-semibold">
                      {p && <Link to={`/dia-diem/${p.id}`} className="inline-flex min-h-[36px] items-center gap-1.5 text-action"><MapPin className="h-4 w-4" />{chon(p.ten, p.tenEn)}</Link>}
                      <a href={linkGoogleLich(ten, s.tu, s.den, `${window.location.origin}/tin-tuc/${s.x.id}`, p ? chon(p.ten, p.tenEn) : 'Lâm Đồng')} target="_blank" rel="noopener noreferrer"
                        className="inline-flex min-h-[36px] items-center gap-1.5 text-action"><CalendarPlus className="h-4 w-4" />{t('themVaoLich')}</a>
                      <Link to={`/tin-tuc/${s.x.id}`} className="inline-flex min-h-[36px] items-center gap-1.5 text-muted hover:text-action">{t('chiTietUuDai')}<ArrowUpRight className="h-4 w-4" /></Link>
                    </div>
                  </div>
                </div>
              </li>); })}</ol>
          {chuaNgay.length > 0 && <div className="mt-6">
            <h3 className="text-[15px] font-semibold text-ink-2">{t('chuaCoNgay')}</h3>
            <ul className="mt-2 space-y-1">{chuaNgay.map((x) => <li key={x.id}><Link to={`/tin-tuc/${x.id}`} className="inline-flex min-h-[36px] items-center gap-1.5 text-[15px] text-action underline-offset-2 hover:underline">{chon(x.tieuDe, x.tieuDeEn)}</Link></li>)}</ul>
          </div>}
        </aside>
      </section>
    </div>);
}
