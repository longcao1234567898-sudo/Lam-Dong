import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import BaoLoi from './components/common/BaoLoi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';
import HomePage from './pages/HomePage';
import { AdminAuthProvider, useAdminAuth } from './hooks/useAdminAuth';
import { NgonNguProvider, useNN } from './i18n/NgonNgu';
import { batHienDan, batNghieng } from './utils/hieuUng';
import { cheDoMinhHoa } from './minh-hoa/cheDo';
import CongXacMinh from './components/common/CongXacMinh';
import { useChuyenTrang, taiSanTrang } from './hooks/useChuyenTrang';

/* Trang thống kê và trang quản trị tách gói riêng: du khách mở trang chủ
   không phải tải thư viện biểu đồ hay mã quản trị. */
const napThongKe = () => import('./pages/ThongKePage');
const napDiaDiem = () => import('./pages/cong-khai/DiaDiemPage');
const napLoTrinh = () => import('./pages/cong-khai/LoTrinhPage');
const napLuuTru = () => import('./pages/cong-khai/LuuTruPage');
const napPhanAnh = () => import('./pages/cong-khai/PhanAnhPage');
const napTinTuc = () => import('./pages/cong-khai/TinTucPage');
const napTinChiTiet = () => import('./pages/cong-khai/TinChiTietPage');
const napKhachQuocTe = () => import('./pages/cong-khai/KhachQuocTePage');
const napUuDai = () => import('./pages/cong-khai/UuDaiPage');
const napLichSuKien = () => import('./pages/cong-khai/LichSuKienPage');
const napAnGi = () => import('./pages/cong-khai/AnGiPage');
const ThongKePage = lazy(napThongKe);
const DiaDiemPage = lazy(napDiaDiem);
const LoTrinhDanhSach = lazy(() => napLoTrinh().then((m) => ({ default: m.LoTrinhDanhSach })));
const LoTrinhChiTiet = lazy(() => napLoTrinh().then((m) => ({ default: m.LoTrinhChiTiet })));
const TuTaoLoTrinh = lazy(() => napLoTrinh().then((m) => ({ default: m.TuTaoLoTrinh })));
const LuuTruPage = lazy(napLuuTru);
const PhanAnhPage = lazy(napPhanAnh);
const TinTucPage = lazy(napTinTuc);
const TinChiTietPage = lazy(napTinChiTiet);
const KhachQuocTePage = lazy(napKhachQuocTe);
const UuDaiPage = lazy(napUuDai);
const LichSuKienPage = lazy(napLichSuKien);
const AnGiPage = lazy(napAnGi);
/* Trang quản trị: mỗi trang một gói riêng; cán bộ đăng nhập xong thì tải sẵn tất cả (CanDangNhap)
   để bấm chuyển mục không phải chờ tải mã. */
const NAP_QT = {
  AdminNguonAnh: () => import('./pages/admin/AdminNguonAnh'),
  AdminLoTrinh: () => import('./pages/admin/AdminLoTrinh'),
  AdminTinTuc: () => import('./pages/admin/AdminTinTuc'),
  AdminPhanAnh: () => import('./pages/admin/AdminPhanAnh'),
  AdminLoginPage: () => import('./pages/admin/AdminLoginPage'),
  AdminTongQuan: () => import('./pages/admin/AdminTongQuan'),
  AdminDiaDiem: () => import('./pages/admin/AdminDiaDiem'),
  AdminLuotKhach: () => import('./pages/admin/AdminLuotKhach'),
  AdminDanhGia: () => import('./pages/admin/AdminDanhGia'),
  AdminCanBo: () => import('./pages/admin/AdminCanBo'),
  AdminNhatKy: () => import('./pages/admin/AdminNhatKy'),
  AdminBaoCao: () => import('./pages/admin/AdminBaoCao'),
  AdminBang: () => import('./pages/admin/AdminBang'),
  AdminThongKe: () => import('./pages/admin/AdminThongKe'),
  AdminXaPhuong: () => import('./pages/admin/AdminXaPhuong'),
  AdminTaiKhoan: () => import('./pages/admin/AdminTaiKhoan'),
  AdminAnGi: () => import('./pages/admin/AdminAnGi'),
  AdminDiemThoiTiet: () => import('./pages/admin/AdminDiemThoiTiet'),
};
const AdminNguonAnh = lazy(NAP_QT.AdminNguonAnh);
const AdminLoTrinh = lazy(NAP_QT.AdminLoTrinh);
const AdminTinTuc = lazy(NAP_QT.AdminTinTuc);
const AdminPhanAnh = lazy(NAP_QT.AdminPhanAnh);
const AdminLoginPage = lazy(NAP_QT.AdminLoginPage);
const AdminTongQuan = lazy(NAP_QT.AdminTongQuan);
const AdminDiaDiem = lazy(NAP_QT.AdminDiaDiem);
const AdminLuotKhach = lazy(NAP_QT.AdminLuotKhach);
const AdminDanhGia = lazy(NAP_QT.AdminDanhGia);
const AdminCanBo = lazy(NAP_QT.AdminCanBo);
const AdminNhatKy = lazy(NAP_QT.AdminNhatKy);
const AdminBaoCao = lazy(NAP_QT.AdminBaoCao);
const AdminBang = lazy(NAP_QT.AdminBang);
const AdminThongKe = lazy(NAP_QT.AdminThongKe);
const AdminXaPhuong = lazy(NAP_QT.AdminXaPhuong);
const AdminTaiKhoan = lazy(NAP_QT.AdminTaiKhoan);
const AdminAnGi = lazy(NAP_QT.AdminAnGi);
const AdminDiemThoiTiet = lazy(NAP_QT.AdminDiemThoiTiet);

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } } });

function KhungChung() {
  const { t } = useNN();
  const { pathname } = useLocation();
  /* Chuyển động dùng chung: hiện khi cuộn (3D) và thẻ nghiêng theo chuột — bật một lần cho cả trang. */
  useEffect(() => { const a = batHienDan(), b = batNghieng(); return () => { a(); b(); }; }, []);
  /* Chuyển trang mượt + về đầu trang; tải sẵn các trang con phía người dân khi máy rảnh. */
  useChuyenTrang();
  useEffect(() => { taiSanTrang([napDiaDiem, napLoTrinh, napTinTuc, napLuuTru, napPhanAnh, napKhachQuocTe, napTinChiTiet, napThongKe, napUuDai, napLichSuKien, napAnGi]); }, []);
  return (<div className="flex min-h-screen flex-col text-ink">
    <a href="#noi-dung" className="sr-only z-[2000] rounded-xl bg-paper px-4 py-3 font-semibold text-ink shadow-sh-3 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">{t('boQuaNoiDung')}</a>
    {cheDoMinhHoa && <div role="status" className="bg-[#FCEFC7] px-4 py-2 text-center text-sm font-semibold text-[#192522]">{t('dangXemMinhHoa')}</div>}
    <Header /><main id="noi-dung" tabIndex={-1} className="flex-1 outline-none"><BaoLoi khoaDatLai={pathname}><Suspense fallback={<div className="py-20 text-center text-muted">{t('dangTai')}</div>}><Outlet /></Suspense></BaoLoi></main><Footer /></div>);
}
/** Chỉ cho vào khu quản trị khi đã khôi phục được phiên đăng nhập. */
function CanDangNhap() {
  const { staff, loading } = useAdminAuth();
  useEffect(() => { if (staff) taiSanTrang(Object.values(NAP_QT)); }, [staff]);
  if (loading) return <div className="py-20 text-center text-slate-500">Đang kiểm tra phiên đăng nhập...</div>;
  return staff ? <AdminLayout /> : <Navigate to="/dang-nhap" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NgonNguProvider>
      <AdminAuthProvider>
        <BrowserRouter>
        <CongXacMinh>
          <Routes>
            <Route element={<KhungChung />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/thong-ke" element={<ThongKePage />} />
              <Route path="/dia-diem/:id" element={<DiaDiemPage />} />
              <Route path="/lo-trinh" element={<LoTrinhDanhSach />} />
              <Route path="/lo-trinh/:id" element={<LoTrinhChiTiet />} />
              <Route path="/tu-tao-lo-trinh" element={<TuTaoLoTrinh />} />
              <Route path="/luu-tru" element={<LuuTruPage />} />
              <Route path="/phan-anh" element={<PhanAnhPage />} />
              <Route path="/tin-tuc" element={<TinTucPage />} />
              <Route path="/tin-tuc/:id" element={<TinChiTietPage />} />
              <Route path="/khach-quoc-te" element={<KhachQuocTePage />} />
              <Route path="/uu-dai" element={<UuDaiPage />} />
              <Route path="/lich-su-kien" element={<LichSuKienPage />} />
              <Route path="/an-gi" element={<AnGiPage />} />
              <Route path="/dang-nhap" element={<AdminLoginPage />} />
              <Route path="/quan-tri" element={<CanDangNhap />}>
                <Route index element={<AdminTongQuan />} />
                <Route path="luot-khach" element={<AdminLuotKhach />} />
                <Route path="dia-diem" element={<AdminDiaDiem />} />
                <Route path="danh-gia" element={<AdminDanhGia />} />
                <Route path="nhat-ky" element={<AdminNhatKy />} />
                <Route path="can-bo" element={<AdminCanBo />} />
                <Route path="bao-cao" element={<AdminBaoCao />} />
                <Route path="bang/:bang" element={<AdminBang />} />
                <Route path="thong-ke" element={<AdminThongKe />} />
                <Route path="xa-phuong" element={<AdminXaPhuong />} />
                <Route path="tai-khoan" element={<AdminTaiKhoan />} />
                <Route path="lo-trinh" element={<AdminLoTrinh />} />
                <Route path="tin-tuc" element={<AdminTinTuc />} />
                <Route path="phan-anh" element={<AdminPhanAnh />} />
                <Route path="nguon-anh" element={<AdminNguonAnh />} />
                <Route path="an-gi" element={<AdminAnGi />} />
                <Route path="diem-thoi-tiet" element={<AdminDiemThoiTiet />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </CongXacMinh>
        </BrowserRouter>
        <Toaster position="top-center" toastOptions={{ style: { borderRadius: 14, fontFamily: 'inherit', background: '#FFFEFB', color: '#192522', boxShadow: '0 4px 10px rgb(18 60 53 / .08), 0 24px 50px -20px rgb(18 60 53 / .4)' } }} />
      </AdminAuthProvider>
      </NgonNguProvider>
    </QueryClientProvider>
  );
}
