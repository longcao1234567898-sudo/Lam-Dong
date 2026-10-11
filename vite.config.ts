import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/* Địa chỉ máy chủ Render, KHÔNG có dấu / ở cuối. Điền sẵn ở đây nên bản dựng
   (npm run build) ở bất kỳ đâu cũng gọi đúng máy chủ, kể cả khi quên khai
   VITE_API_URL. Khai VITE_API_URL (.env hoặc netlify.toml) thì giá trị đó được ưu tiên. */
const MAY_CHU_RENDER = 'https://lam-dong.onrender.com';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  /* Chạy trên máy (npm run dev) để trống: Vite chuyển /api sang localhost:4000 bên dưới. */
  const apiUrl = (process.env.VITE_API_URL || env.VITE_API_URL || (command === 'build' ? MAY_CHU_RENDER : '')).trim();
  return {
    plugins: [react()],
    define: { 'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl) },
    /* Cổng 5173 khớp danh sách CORS mặc định của máy chủ (server/src/index.js).
       Chạy trên máy: chuyển /api sang máy chủ cổng 4000, nên để trống
       VITE_API_URL là gọi được ngay (README hướng dẫn vậy, trước đây thiếu dòng này). */
    server: { port: 5173, open: true, proxy: { '/api': 'http://localhost:4000' } },
    build: {
      sourcemap: false,
      /* Gói cảnh 3D (three.js, ~140 kB nén) chỉ tải sau khi trang chủ đã hiện chữ, không chặn lần vẽ đầu. */
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          /* Tách thư viện lớn thành gói riêng: bản đồ và biểu đồ chỉ tải khi cần. */
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-query': ['@tanstack/react-query'],
            'vendor-ban-do': ['leaflet', 'react-leaflet'],
            'vendor-bieu-do': ['recharts'],
          },
        },
      },
    },
  };
});
