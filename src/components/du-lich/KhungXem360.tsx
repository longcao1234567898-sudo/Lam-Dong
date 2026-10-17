/**
 * Khung xem ảnh 360° — dùng Pannellum (MIT, không phụ thuộc thư viện khác), tải sau
 * khi cần nên trang không nặng thêm nếu điểm chưa có ảnh 360°.
 *
 * Kéo chuột / vuốt để nhìn quanh, cuộn hoặc chụm hai ngón để phóng; trên điện thoại
 * có nút xoay máy để nhìn (cảm biến hướng). Thanh công cụ kính mờ ở đáy khung: tự xoay,
 * về hướng ban đầu, toàn màn hình (cả khung lẫn thanh công cụ cùng vào toàn màn hình).
 * Bật "giảm chuyển động" thì không tự xoay lúc mở.
 *   gocNgang 360: ảnh 360° trọn vòng (tỉ lệ 2:1). Nhỏ hơn: ảnh panorama một phần.
 *   huongDau: hướng nhìn lúc mở (độ).
 */
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Loader2, Maximize2, Minimize2, Pause, Play, RotateCcw } from 'lucide-react';
import { useNN } from '../../i18n/NgonNgu';
import { giamChuyenDong } from '../../utils/hangSo';

interface Pannellum { viewer: (el: HTMLElement, cfg: Record<string, unknown>) => ViewerPnlm }
export interface ViewerPnlm { destroy: () => void; getYaw: () => number; on: (su: string, fn: (...a: unknown[]) => void) => void;
  startAutoRotate: (tocDo?: number) => void; stopAutoRotate: () => void; lookAt: (pitch?: number, yaw?: number, hfov?: number, thoiGian?: number) => void; resize: () => void }
declare global { interface Window { pannellum?: Pannellum } }

let napThuVien: Promise<Pannellum> | null = null;
function napPannellum(): Promise<Pannellum> {
  napThuVien ||= Promise.all([import('pannellum/build/pannellum.js'), import('pannellum/build/pannellum.css')])
    .then(() => { if (!window.pannellum) throw new Error('Không nạp được trình xem 360°.'); return window.pannellum; });
  return napThuVien;
}

export interface KhungXem360Ref { huongDangNhin: () => number | null }

const KhungXem360 = forwardRef<KhungXem360Ref, {
  src: string; gocNgang: number; huongDau: number; rong?: number | null; cao?: number | null; tuXoay?: boolean; nhan?: string; en?: boolean; className?: string;
}>(function KhungXem360({ src, gocNgang, huongDau, rong, cao, tuXoay = false, nhan, en = false, className = '' }, ref) {
  const { t } = useNN();
  const vo = useRef<HTMLDivElement>(null);
  const khung = useRef<HTMLDivElement>(null);
  const viewer = useRef<ViewerPnlm | null>(null);
  const [loi, setLoi] = useState('');
  const [dangTai, setDangTai] = useState(true);
  const coXoay = tuXoay && !giamChuyenDong();
  const [dangXoay, setDangXoay] = useState(coXoay);
  const [toanMan, setToanMan] = useState(false);
  const coToanMan = typeof document !== 'undefined' && !!document.fullscreenEnabled;
  useEffect(() => {
    const f = () => { setToanMan(document.fullscreenElement === vo.current); setTimeout(() => viewer.current?.resize(), 60); };
    document.addEventListener('fullscreenchange', f);
    return () => document.removeEventListener('fullscreenchange', f);
  }, []);
  useImperativeHandle(ref, () => ({ huongDangNhin: () => (viewer.current ? Math.round(viewer.current.getYaw()) : null) }), []);

  useEffect(() => {
    let huy = false;
    setLoi(''); setDangTai(true);
    napPannellum().then((pnlm) => {
      if (huy || !khung.current) return;
      const toanVong = gocNgang >= 359;
      /* Ảnh một phần: góc dọc suy từ tỉ lệ ảnh, để ảnh không bị kéo méo. */
      const gocDoc = toanVong ? 180 : Math.min(180, rong && cao ? (gocNgang * cao) / rong : gocNgang / 3);
      const v = pnlm.viewer(khung.current, {
        type: 'equirectangular', panorama: src, autoLoad: true, crossOrigin: 'anonymous',
        haov: gocNgang, vaov: gocDoc, yaw: huongDau, hfov: 100, minHfov: 40, maxHfov: 120,
        ...(toanVong ? {} : { minYaw: -gocNgang / 2, maxYaw: gocNgang / 2, minPitch: -gocDoc / 2, maxPitch: gocDoc / 2 }),
        autoRotate: coXoay ? -2 : 0, autoRotateInactivityDelay: coXoay ? 4000 : -1,
        showFullscreenCtrl: false, showZoomCtrl: true, compass: false, mouseZoom: 'fullscreenonly',
        strings: en ? undefined : { loadButtonLabel: 'Bấm để xem ảnh 360°', loadingLabel: 'Đang tải…', bylineLabel: '',
          noPanoramaError: 'Chưa có ảnh 360°.', fileAccessError: 'Không tải được ảnh 360°.', malformedURLError: 'Đường dẫn ảnh không đúng.',
          iOS8WebGLError: 'Trình duyệt không hỗ trợ xem 360°.', genericWebGLError: 'Trình duyệt không hỗ trợ WebGL để xem 360°.',
          textureSizeError: 'Ảnh quá lớn với máy này (rộng hơn %s px).', unknownError: 'Có lỗi khi hiện ảnh 360°.' },
      });
      v.on('load', () => !huy && setDangTai(false));
      v.on('error', (m) => { if (!huy) { setDangTai(false); setLoi(String(m || 'Không hiện được ảnh 360°.')); } });
      viewer.current = v;
      setDangXoay(coXoay);
    }).catch((e: Error) => { if (!huy) { setDangTai(false); setLoi(e.message); } });
    return () => { huy = true; try { viewer.current?.destroy(); } catch { /* bỏ qua */ } viewer.current = null; };
  }, [src, gocNgang, huongDau, rong, cao, coXoay, en]);

  const doiXoay = () => {
    const v = viewer.current; if (!v) return;
    if (dangXoay) v.stopAutoRotate(); else v.startAutoRotate(-2);
    setDangXoay(!dangXoay);
  };
  const veDau = () => { viewer.current?.lookAt(0, huongDau, 100, giamChuyenDong() ? 0 : 900); };
  const doiToanMan = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
    else vo.current?.requestFullscreen().catch(() => undefined);
  };
  const nut = 'grid h-10 w-10 place-items-center rounded-full text-[#F7F5EF] transition-colors hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F7F5EF]';
  return (
    <div ref={vo} className={`relative overflow-hidden rounded-[20px] bg-[#0C2925] ${toanMan ? 'rounded-none' : ''} ${className}`}>
      <div ref={khung} className="absolute inset-0" aria-label={nhan} role="img" />
      {dangTai && !loi && <div className="pointer-events-none absolute inset-0 grid place-items-center text-[#F7F5EF]/80"><Loader2 className="h-7 w-7 animate-spin" /></div>}
      {!dangTai && !loi && <div className="thanh-360 absolute bottom-3 left-1/2 z-[3] flex -translate-x-1/2 items-center gap-0.5 rounded-full p-1" role="toolbar" aria-label={nhan}>
        <button type="button" className={nut} onClick={doiXoay} aria-pressed={dangXoay} aria-label={dangXoay ? t('dungXoay') : t('tuXoay')} title={dangXoay ? t('dungXoay') : t('tuXoay')}>
          {dangXoay ? <Pause className="h-[18px] w-[18px]" aria-hidden="true" /> : <Play className="h-[18px] w-[18px]" aria-hidden="true" />}</button>
        <button type="button" className={nut} onClick={veDau} aria-label={t('veHuongDau')} title={t('veHuongDau')}><RotateCcw className="h-[18px] w-[18px]" aria-hidden="true" /></button>
        {coToanMan && <button type="button" className={nut} onClick={doiToanMan} aria-label={toanMan ? t('thoatToanMan') : t('toanManHinh')} title={toanMan ? t('thoatToanMan') : t('toanManHinh')}>
          {toanMan ? <Minimize2 className="h-[18px] w-[18px]" aria-hidden="true" /> : <Maximize2 className="h-[18px] w-[18px]" aria-hidden="true" />}</button>}
      </div>}
      {loi && <p className="absolute inset-x-4 bottom-4 rounded-xl bg-[#FDECEA] px-4 py-3 text-sm text-[#8A1C12]">{loi}</p>}
    </div>);
});
export default KhungXem360;
