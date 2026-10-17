/** Khối mở đầu: trình chiếu ảnh thật các điểm nổi bật, tiêu đề, ô tìm kiếm, hai lối vào chính. */
import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Map as IcBanDo, Route, Pause, Play, X, ArrowRight, MapPin } from 'lucide-react';
import { useNN } from '../../i18n/NgonNgu';
import { LOAI, VUNG, giamChuyenDong } from '../../utils/hangSo';
import { timDiem, toDam } from '../../utils/timDiem';
import { anhUrl } from '../../services/api';
import { anhMacDinh, srcSetMacDinh } from '../../utils/anhMacDinh';
import TruongHat from '../hieu-ung/TruongHat';
import ChiDanCuon from './ChiDanCuon';
import type { DiaDiem, LoTrinh } from '../../utils/kieu';

const CHUYEN_SAU = 7000;   // mỗi ảnh đứng 7 giây
const SO_GOI_Y = 6;

/** Ảnh nhỏ cho dòng gợi ý: ảnh cán bộ tải lên, không thì ảnh mặc định (bản nhỏ). */
const anhNho = (p: DiaDiem) => (p.anh?.[0] ? anhUrl(p.anh[0].id) : anhMacDinh(p.id)?.nho || null);

/**
 * Ô tìm đầu trang: gõ là hiện gợi ý ngay (có ảnh, tô đậm chỗ khớp); mũi tên lên/xuống
 * để chọn, Enter để mở. Enter khi chưa chọn dòng nào: chỉ một điểm khớp thì mở luôn,
 * nhiều điểm thì cuộn xuống danh sách Khám phá đã lọc sẵn.
 */
function TimKiem({ ds, onTim }: { ds: DiaDiem[]; onTim: (q: string) => void }) {
  const { t, chon, nn } = useNN();
  const di = useNavigate();
  const id = useId();
  const o = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [q, setQ] = useState(''); const [mo, setMo] = useState(false); const [hl, setHl] = useState(-1);
  const khop = useMemo(() => timDiem(ds, q), [q, ds]);
  const goiY = khop.slice(0, SO_GOI_Y);
  const coChu = q.trim().length > 0;
  const hienDs = mo && coChu;
  const moDiem = (p: DiaDiem) => { setMo(false); di(`/dia-diem/${p.id}`); };
  const xemHet = () => { onTim(q.trim()); setMo(false); setHl(-1); o.current?.blur(); };
  const gui = () => {
    if (hl >= 0 && goiY[hl]) moDiem(goiY[hl]);
    else if (khop.length === 1) moDiem(khop[0]);
    else if (coChu) xemHet();
  };
  const phu = (p: DiaDiem) => [p.vung ? (nn === 'en' ? VUNG[p.vung].nganEn : VUNG[p.vung].ngan) : null,
    nn === 'en' ? LOAI[p.loai]?.en : LOAI[p.loai]?.ten].filter(Boolean).join(' · ');
  return (
    <form ref={formRef} role="search" className="relative mt-7 max-w-[36rem] scroll-mt-20" onSubmit={(e) => { e.preventDefault(); gui(); }}>
      <div className="kinh flex items-center gap-1 rounded-2xl p-1.5 pl-4 shadow-sh-3 focus-within:ring-2 focus-within:ring-[#F7F5EF] focus-within:ring-offset-2 focus-within:ring-offset-[#123C35]">
        <Search className="h-5 w-5 shrink-0 text-[#3E4C48]" aria-hidden="true" />
        {/* Ô kiểu search nhưng tắt nút xoá sẵn của trình duyệt (mỗi trình duyệt một kiểu,
            Chrome còn tô xanh) — dùng nút xoá riêng cùng kiểu với trang. */}
        <input ref={o} type="search" value={q} placeholder={t('timGoiY')} aria-label={t('timGoiY')} enterKeyHint="search"
          autoComplete="off" spellCheck={false}
          role="combobox" aria-autocomplete="list" aria-expanded={hienDs} aria-controls={id + 'ds'}
          aria-activedescendant={hienDs && hl >= 0 ? `${id}-${hl}` : undefined}
          onChange={(e) => { setQ(e.target.value); setMo(true); setHl(-1); }} onFocus={() => {
            setMo(true);
            /* Điện thoại: ô tìm nằm sát đáy ảnh, bàn phím bật lên che mất gợi ý — đẩy ô lên gần đầu màn hình. */
            if (window.matchMedia('(max-width: 639px)').matches) {
              setTimeout(() => formRef.current?.scrollIntoView({ block: 'start', behavior: giamChuyenDong() ? 'auto' : 'smooth' }), 50);
            }
          }} onBlur={() => setTimeout(() => setMo(false), 150)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setMo(true); setHl((h) => (goiY.length ? (h + 1) % goiY.length : -1)); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setHl((h) => (h <= 0 ? goiY.length - 1 : h - 1)); }
            else if (e.key === 'Escape') { if (hienDs) { e.preventDefault(); setMo(false); setHl(-1); } else setQ(''); }
          }}
          className="min-h-[46px] w-full min-w-0 bg-transparent text-[16px] text-[#192522] outline-none placeholder:text-[#3E4C48] [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none" />
        {coChu && <button type="button" aria-label={t('xoaTuKhoa')} title={t('xoaTuKhoa')}
          onMouseDown={(e) => e.preventDefault()} onClick={() => { setQ(''); setHl(-1); o.current?.focus(); }}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[#3E4C48] transition-colors hover:bg-[#192522]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#123C35]">
          <X className="h-[18px] w-[18px]" aria-hidden="true" /></button>}
        <button type="submit" className="nut nut-chinh min-h-[46px] rounded-xl px-5">{t('tim')}</button>
      </div>
      {hienDs && <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl bg-[#FFFEFB] text-[#192522] shadow-sh-3 ring-1 ring-[#192522]/5">
        {goiY.length > 0 && <p className="px-4 pb-1 pt-3 text-[12px] font-semibold uppercase tracking-wide text-[#5B6B66]" aria-hidden="true">{t('goiYTim')}</p>}
        <ul id={id + 'ds'} role="listbox" aria-label={t('goiYTim')} className="max-h-[min(22rem,50svh)] overflow-y-auto overscroll-contain px-1.5 pb-1.5">
          {goiY.map((p, i) => {
            const a = anhNho(p);
            return (
              <li key={p.id} id={`${id}-${i}`} role="option" aria-selected={hl === i}>
                <button type="button" tabIndex={-1} onMouseDown={(e) => e.preventDefault()} onClick={() => moDiem(p)} onMouseEnter={() => setHl(i)}
                  className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors ${hl === i ? 'bg-[#EFEBE1]' : ''}`}>
                  <span className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-[#EFEBE1]">
                    {a ? <img src={a} alt="" width={44} height={44} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                      : <MapPin className="m-auto mt-3 h-5 w-5 text-[#5B6B66]" aria-hidden="true" />}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px]">
                      {toDam(chon(p.ten, p.tenEn), q).map((d, k) => (d.khop ? <b key={k} className="font-bold">{d.chu}</b> : <span key={k}>{d.chu}</span>))}</span>
                    <span className="block truncate text-[13px] text-[#5B6B66]">{p.xa || phu(p)}</span>
                  </span>
                  <ArrowRight className={`h-4 w-4 shrink-0 text-[#5B6B66] transition-opacity ${hl === i ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true" />
                </button></li>);
          })}
          {!goiY.length && <li className="px-3 py-3 text-sm text-[#3E4C48]">
            <span className="block font-semibold">{t('khongThayDiem', { q: q.trim() })}</span>
            <span className="mt-0.5 block text-[#5B6B66]">{t('khongThayDiemGoiY')}</span></li>}
        </ul>
        {khop.length > 1 && <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={xemHet}
          className="flex w-full items-center justify-between gap-3 border-t border-[#192522]/10 px-4 py-3 text-left text-[14px] font-semibold text-[#123C35] hover:bg-[#EFEBE1]">
          {t('xemHetKetQua', { n: khop.length })}<ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" /></button>}
      </div>}
    </form>);
}

export default function Hero({ ds, loTrinh, onTim, onToiBanDo, onToiLoTrinh, onCuonXuong }: {
  ds: DiaDiem[]; loTrinh: LoTrinh[]; onTim: (q: string) => void; onToiBanDo: () => void; onToiLoTrinh: () => void; onCuonXuong?: () => void;
}) {
  const { t, chon } = useNN();
  /* Ảnh trình chiếu: điểm nổi bật trước, mỗi điểm một ảnh — ảnh cán bộ tải lên, không thì ảnh mặc định. */
  const chieu = useMemo(() => ds.map((p) => {
    const a = p.anh?.[0], m = anhMacDinh(p.id);
    if (a) return { p, src: anhUrl(a.id), nho: anhUrl(a.id), srcSet: undefined as string | undefined, tieuDiem: `${a.tieuDiemX ?? 50}% ${a.tieuDiemY ?? 50}%` };
    /* Ảnh mặc định hẹp (dưới 1280px) chỉ dùng cho thẻ: phóng ra cả màn hình sẽ nhoè. */
    if (m && m.rong >= 1280) return { p, src: m.tep, nho: m.nho, srcSet: srcSetMacDinh(m), tieuDiem: '50% 50%' };
    return null;
  }).filter((x): x is NonNullable<typeof x> => !!x).sort((a, b) => Number(b.p.noiBat) - Number(a.p.noiBat)).slice(0, 5), [ds]);
  const [i, setI] = useState(0);
  const [dung, setDung] = useState(() => giamChuyenDong());
  useEffect(() => {
    if (dung || chieu.length < 2) return;
    const h = window.setInterval(() => setI((x) => (x + 1) % chieu.length), CHUYEN_SAU);
    return () => window.clearInterval(h);
  }, [dung, chieu.length]);
  const hienTai = chieu.length ? chieu[i % chieu.length] : null;
  const tre = (ms: number) => ({ '--tre': `${ms}ms` }) as CSSProperties;

  return (
    /* Không cắt tràn ở cả khối (chỉ cắt lớp nền bên dưới) và z-10: danh sách gợi ý của ô tìm
       được thò xuống dưới mép ảnh, nổi trên phần tiếp theo của trang — trên điện thoại ô tìm
       nằm sát đáy ảnh, cắt tràn ở đây là danh sách chỉ còn hai dòng. */
    <section className="relative isolate z-10 flex min-h-[max(620px,min(94svh,920px))] flex-col bg-[#0C2925] text-[#F7F5EF]"
      style={{ marginTop: 'calc(-4.25rem - env(safe-area-inset-top))' }} aria-labelledby="hero-tieu-de">
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="hero-nen absolute inset-0" />
      {/* Lớp ảnh trôi chậm hơn trang khi cuộn (thị sai); ảnh đang chiếu phóng chậm (Ken Burns). */}
      <div className="hero-troi absolute inset-0" aria-hidden="true">
        {chieu.map((c, k) => (
          <div key={c.p.id} className={`hero-anh absolute inset-0 transition-opacity duration-[1600ms] ease-out ${k === i ? 'dang-chieu opacity-100' : 'opacity-0'}`}>
            <img src={c.src} srcSet={c.srcSet} sizes="100vw" alt="" className="h-full w-full object-cover" style={{ objectPosition: c.tieuDiem, transformOrigin: c.tieuDiem }}
              loading={k === 0 ? 'eager' : 'lazy'} fetchPriority={k === 0 ? 'high' : 'auto'} decoding="async" />
          </div>))}
      </div>
      <div className="hero-man pointer-events-none absolute inset-0" aria-hidden="true" />
      {/* Cánh hoa ba sắc trôi trên ảnh, xoáy quanh con trỏ. */}
      </div>
      {/* Ngoài lớp cắt tràn: trường hạt lắng nghe con trỏ trên phần tử cha (cả khối hero). */}
      <TruongHat toi matDo={0.55} doDam={0.9} className="hat-hero" />

      <div className="container-page relative z-10 flex flex-1 flex-col justify-end pb-24 pt-36 sm:pb-28">
        <div className="max-w-[50rem]">
          <span className="hero-hien ba-sac mb-6" aria-hidden="true"><i /><i /><i /></span>
          <h1 id="hero-tieu-de" className="tieu-de-lon tieu-de-hero hero-chu">
            <span className="dong" style={tre(60)}>{t('heroDong1')}</span>
            <span className="dong" style={tre(190)}>{t('heroDong2')}</span>
          </h1>
          {ds.length > 0 && <p className="hero-hien mt-5 max-w-[34rem] text-[17px] leading-relaxed text-[#E4EAE7] sm:text-lg" style={tre(420)}>
            {t('heroDan', { diem: ds.length, tuyen: loTrinh.length })}</p>}
          {/* relative z-20: mỗi khối hero-hien có hiệu ứng transform nên là một lớp xếp chồng
              riêng; không nâng khối tìm thì hàng nút ngay sau đè lên danh sách gợi ý. */}
          <div className="hero-hien relative z-20" style={tre(520)}><TimKiem ds={ds} onTim={onTim} /></div>
          <div className="hero-hien mt-4 flex flex-wrap gap-3" style={tre(620)}>
            <button type="button" onClick={onToiBanDo} className="nut nut-chinh"><IcBanDo className="h-[18px] w-[18px]" />{t('xemBanDo')}</button>
            {loTrinh.length > 0 && <button type="button" onClick={onToiLoTrinh} className="nut nut-coral"><Route className="h-[18px] w-[18px]" />{t('goiYLoTrinh')}</button>}
          </div>
        </div>
      </div>

      {onCuonXuong && <ChiDanCuon onClick={onCuonXuong} />}

      {/* Tên điểm trong ảnh đang chiếu + điều khiển: nội dung tự chạy quá 5 giây phải dừng được. */}
      {hienTai && <div className="container-page absolute inset-x-0 bottom-0 z-10 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 pb-5">
        <p className="max-w-[70%] text-[13px] leading-snug text-[#F7F5EF]/85" aria-live="polite">
          <Link to={`/dia-diem/${hienTai.p.id}`} className="font-semibold text-[#F7F5EF] underline-offset-2 hover:underline">{t('trongAnh')}: {chon(hienTai.p.ten, hienTai.p.tenEn)}</Link></p>
        {chieu.length > 1 && <div className="flex items-center gap-1 sm:gap-2">
          {/* Điện thoại: chấm. Màn rộng hơn: ảnh nhỏ của chính điểm đang chiếu, bấm để chuyển;
              ảnh đang chiếu có thanh chạy báo bao lâu nữa sang ảnh sau. */}
          {chieu.map((c, k) => (
            <button key={c.p.id} type="button" onClick={() => setI(k)} aria-label={`${t('anhSo', { n: k + 1 })}: ${chon(c.p.ten, c.p.tenEn)}`} aria-current={k === i}
              className={`hero-o-nho group grid h-9 w-7 place-items-center sm:block sm:h-auto sm:w-[5.5rem] ${k === i ? 'dang-chon' : ''}`}>
              <span className={`block h-1.5 rounded-full transition-[width,background-color] duration-500 sm:hidden ${k === i ? 'w-5 bg-[#F7F5EF]' : 'w-1.5 bg-[#F7F5EF]/50'}`} />
              <span className="relative hidden aspect-[3/2] w-full overflow-hidden rounded-xl sm:block">
                <img src={c.nho} alt="" width={88} height={59} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" style={{ objectPosition: c.tieuDiem }} />
                {k === i && <span key={i} className={`hero-tien-trinh ${dung ? 'dung' : ''}`} style={{ animationDuration: `${CHUYEN_SAU}ms` }} aria-hidden="true" />}
              </span>
              <span className="mt-1 hidden w-full truncate text-left text-[12px] font-medium leading-tight text-[#F7F5EF]/80 group-hover:text-[#F7F5EF] lg:block">{chon(c.p.ten, c.p.tenEn)}</span>
            </button>))}
          <button type="button" onClick={() => setDung((d) => !d)} aria-label={dung ? t('chayTiep') : t('tamDung')} title={dung ? t('chayTiep') : t('tamDung')}
            className="ml-1 grid h-9 w-9 place-items-center rounded-full border border-[#F7F5EF]/40 hover:bg-white/10">{dung ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}</button>
        </div>}
      </div>}
    </section>);
}
