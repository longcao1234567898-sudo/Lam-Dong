/**
 * Chuyển trang mượt bằng View Transitions của trình duyệt (không thêm thư viện):
 *  - Bấm một liên kết nội bộ: trang cũ mờ đi nhanh, trang mới trồi lên; ảnh thẻ điểm đến
 *    "bay" thành ảnh lớn ở trang chi tiết (cùng view-transition-name anh-<id>).
 *  - Sang trang mới thì về đầu trang (trước đây giữ nguyên chỗ cuộn của trang cũ).
 * Trình duyệt chưa hỗ trợ hoặc bật "giảm chuyển động" thì chuyển ngay như thường.
 */
import { useEffect, useLayoutEffect } from 'react';
import { flushSync } from 'react-dom';
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import { giamChuyenDong } from '../utils/hangSo';

type CoChuyenCanh = Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } };

export function useChuyenTrang() {
  const di = useNavigate();
  const { pathname } = useLocation();
  const kieu = useNavigationType();

  /* Mở trang mới (không phải bấm Quay lại) thì về đầu trang, trừ khi đường dẫn có #neo. */
  useLayoutEffect(() => {
    if (kieu === 'PUSH' && !window.location.hash) window.scrollTo(0, 0);
  }, [pathname, kieu]);

  useEffect(() => {
    const d = document as CoChuyenCanh;
    const khiBam = (e: MouseEvent) => {
      if (!d.startViewTransition || giamChuyenDong()) return;
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      const u = new URL(a.href, window.location.href);
      if (u.origin !== window.location.origin) return;
      const den = u.pathname + u.search + u.hash;
      if (u.pathname === window.location.pathname && u.search === window.location.search) return;   // cùng trang: để mặc định
      /* Khu cán bộ không cần hiệu ứng. */
      if (u.pathname.startsWith('/quan-tri') || window.location.pathname.startsWith('/quan-tri')) return;
      e.preventDefault();
      const goc = document.documentElement;
      goc.classList.add('chuyen-trang');
      const vt = d.startViewTransition(() => flushSync(() => di(den)));
      vt.finished.finally(() => goc.classList.remove('chuyen-trang'));
    };
    /* Pha bắt (capture): chạy trước Link của React Router, chặn mặc định rồi tự điều hướng. */
    document.addEventListener('click', khiBam, true);
    return () => document.removeEventListener('click', khiBam, true);
  }, [di]);
}

/** Tải sẵn mã các trang con khi máy rảnh, để chuyển trang không phải chờ "Đang tải…". */
export function taiSanTrang(ds: (() => Promise<unknown>)[]) {
  const chay = () => ds.forEach((f) => { f().catch(() => undefined); });
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
  if (w.requestIdleCallback) w.requestIdleCallback(chay, { timeout: 4000 }); else window.setTimeout(chay, 2500);
}
