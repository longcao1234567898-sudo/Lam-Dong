import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
/* Phông chữ tự lưu, đi cùng bản dựng (giấy phép OFL), thay cho Google Fonts: chữ đúng ngay lần
   đầu mở trang, không phụ thuộc máy ngoài, và Google không biết IP, giờ giấc người xem trang.
   Chỉ nạp các độ đậm trang đang dùng; Newsreader bản biến thiên có trục cỡ quang học (opsz). */
import '@fontsource/be-vietnam-pro/400.css';
import '@fontsource/be-vietnam-pro/500.css';
import '@fontsource/be-vietnam-pro/600.css';
import '@fontsource/be-vietnam-pro/700.css';
import '@fontsource/be-vietnam-pro/800.css';
import '@fontsource-variable/newsreader/opsz.css';
import './styles/globals.css';
import BaoLoi, { taiLaiLayBanMoi } from './components/common/BaoLoi';

/* Vite báo tải trước tệp mã hỏng (thường do vừa có bản mới): tải lại trang lấy bản mới. */
window.addEventListener('vite:preloadError', (e) => { if (taiLaiLayBanMoi()) e.preventDefault(); });

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><BaoLoi toanTrang><App /></BaoLoi></React.StrictMode>);
