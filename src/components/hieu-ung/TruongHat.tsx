/**
 * Trường hạt: hàng trăm cánh hoa nhỏ (mai anh đào, biển, dã quỳ, hoa sim, lá rừng) trôi nhẹ
 * như gió trên cao nguyên. Rê chuột tới đâu, cánh hoa dạt ra thành vòng xoáy quanh con trỏ,
 * cánh gần to và đậm hơn, cánh xa nhỏ và mờ. Không có chuột (điện thoại, để yên) thì một
 * "cơn gió" ảo tự đi chậm qua khung.
 *
 * Canvas 2D, không thư viện. Khuất màn hình hoặc tab ẩn thì dừng. Bật "giảm chuyển động":
 * vẽ đúng một khung tĩnh. Canvas không nhận chuột (pointer-events: none); lắng nghe trên
 * khung cha nên nút, ô nhập phía trên vẫn bấm bình thường.
 */
import { useEffect, useRef, useState } from 'react';
import { giamChuyenDong } from '../../utils/hangSo';

const MAU_SANG = ['#E0457B', '#1E88C8', '#F29A1F', '#7B5CD6', '#1C8C72'];
const MAU_TOI = ['#F480A8', '#66B6E8', '#F5B454', '#A48BEA', '#4FC7A3'];

/** Đang ở chế độ tối (lớp .dark trên <html>, Header bật tắt) — theo dõi để đổi bộ màu hạt. */
export function useCheDoToi() {
  const [toi, setToi] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const mo = new MutationObserver(() => setToi(document.documentElement.classList.contains('dark')));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);
  return toi;
}

interface Hat { hx: number; hy: number; x: number; y: number; vx: number; vy: number; dai: number; pha: number }

export default function TruongHat({ toi = false, matDo = 1, doDam = 1, className = '' }: {
  /** Nền tối: dùng bản màu sáng hơn. */ toi?: boolean;
  /** Hệ số mật độ hạt (1 = khoảng một hạt mỗi 26px). */ matDo?: number;
  /** Độ đậm tổng thể 0–1. */ doDam?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current, cha = cv?.parentElement;
    const ctx = cv?.getContext('2d');
    if (!cv || !cha || !ctx) return;
    const mau = toi ? MAU_TOI : MAU_SANG;
    const tinh = giamChuyenDong();
    let w = 0, h = 0, dpr = 1, R = 200;
    let nhom: Hat[][] = [];
    let chay = false, hien = true, khung = 0;
    /* Con trỏ thật (mx, my), tâm xoáy đang đuổi theo (cx, cy), lần cuối con trỏ động. */
    let mx = -1, my = -1, cx = 0, cy = 0, cuoiDong = -1e9;

    const dung = () => {
      const r = cha.getBoundingClientRect();
      w = Math.max(1, r.width); h = Math.max(1, r.height);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      R = Math.max(150, Math.min(260, Math.min(w, h) * 0.32));
      /* Lưới so le: hạt phân bố đều mà không thành hàng lối. */
      const g = 26 / Math.sqrt(matDo);
      const so = Math.min(1400, Math.ceil((w / g) * (h / g)));
      nhom = mau.map(() => []);
      let k = 0;
      for (let y = g / 2; y < h; y += g) for (let x = g / 2; x < w; x += g) {
        if (k++ > so) break;
        const hx = x + (Math.random() - 0.5) * g * 0.9, hy = y + (Math.random() - 0.5) * g * 0.9;
        nhom[Math.floor(Math.random() * mau.length)].push({ hx, hy, x: hx, y: hy, vx: 0, vy: 0, dai: 3 + Math.random() * 4, pha: Math.random() * 6.28 });
      }
      if (cx === 0 && cy === 0) { cx = w * 0.62; cy = h * 0.45; }
    };

    const ve = (t: number) => {
      khung = 0;
      /* Không có con trỏ trong 2,5 giây: cơn gió ảo đi theo đường cong chậm. */
      const ao = t - cuoiDong > 2500 || mx < 0;
      const tx0 = ao ? w * (0.55 + 0.3 * Math.sin(t * 0.00019)) : mx;
      const ty0 = ao ? h * (0.5 + 0.3 * Math.sin(t * 0.00031 + 1.3)) : my;
      cx += (tx0 - cx) * (ao ? 0.02 : 0.1); cy += (ty0 - cy) * (ao ? 0.02 : 0.1);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = 'round';
      const R2 = R * 1.9;
      for (let c = 0; c < nhom.length; c++) {
        ctx.strokeStyle = mau[c];
        for (const p of nhom[c]) {
          /* Gió: mỗi hạt lắc quanh chỗ của nó theo một trường sóng. */
          let tx = p.hx + Math.sin(p.hy * 0.012 + t * 0.0006 + p.pha) * 7;
          let ty = p.hy + Math.cos(p.hx * 0.011 + t * 0.0005 + p.pha) * 7;
          let dx = tx - cx, dy = ty - cy;
          let d = Math.hypot(dx, dy) || 1;
          if (d < R) {
            /* Trong vòng xoáy: dạt ra ngoài và quay theo chiều tiếp tuyến. */
            const k = 1 - d / R;
            tx += (dx / d) * k * 64 - (dy / d) * k * 46;
            ty += (dy / d) * k * 64 + (dx / d) * k * 46;
          }
          if (tinh) { p.x = tx; p.y = ty; } else {
            p.vx = (p.vx + (tx - p.x) * 0.055) * 0.82; p.vy = (p.vy + (ty - p.y) * 0.055) * 0.82;
            p.x += p.vx; p.y += p.vy;
          }
          dx = p.x - cx; dy = p.y - cy; d = Math.hypot(dx, dy) || 1;
          const gan = Math.max(0, 1 - d / R2);
          const s = 0.55 + gan * 1.15;
          const l = p.dai * s;
          /* Cánh hoa hướng về tâm xoáy, như mạt sắt quanh nam châm. */
          const ux = (dx / d) * l, uy = (dy / d) * l;
          ctx.globalAlpha = (0.28 + gan * 0.72) * doDam;
          ctx.lineWidth = 1.6 * s + 0.4;
          ctx.beginPath(); ctx.moveTo(p.x - ux / 2, p.y - uy / 2); ctx.lineTo(p.x + ux / 2, p.y + uy / 2); ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      if (chay) khung = requestAnimationFrame(ve);
    };

    const batDau = () => { if (tinh || chay || !hien || document.hidden) return; chay = true; khung = requestAnimationFrame(ve); };
    const tamDung = () => { chay = false; cancelAnimationFrame(khung); khung = 0; };
    const veMot = () => { if (!chay) ve(performance.now()); };

    dung(); veMot(); batDau();

    const ro = new ResizeObserver(() => { dung(); veMot(); });
    ro.observe(cha);
    const io = new IntersectionObserver(([m]) => { hien = m.isIntersecting; if (hien) batDau(); else tamDung(); });
    io.observe(cv);
    const khiAn = () => (document.hidden ? tamDung() : batDau());
    document.addEventListener('visibilitychange', khiAn);
    const khiDi = (e: PointerEvent) => {
      const r = cha.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top; cuoiDong = performance.now();
    };
    const khiRoi = () => { mx = -1; my = -1; };
    if (!tinh) { cha.addEventListener('pointermove', khiDi, { passive: true }); cha.addEventListener('pointerleave', khiRoi); }
    return () => {
      tamDung(); ro.disconnect(); io.disconnect();
      document.removeEventListener('visibilitychange', khiAn);
      cha.removeEventListener('pointermove', khiDi); cha.removeEventListener('pointerleave', khiRoi);
    };
  }, [toi, matDo, doDam]);

  return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
