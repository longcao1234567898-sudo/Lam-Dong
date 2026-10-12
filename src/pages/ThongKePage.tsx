import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area } from 'recharts';
import { ChartNoAxesColumn } from 'lucide-react';
import { layThongKe } from '../services/api';
import DemSo from '../components/du-lich/DemSo';
import { DauTrang } from '../components/du-lich/GiaoDien';
import { TIEU_CHI, so } from '../utils/hangSo';
import { useNN } from '../i18n/NgonNgu';

/** Một ô biểu đồ. `trong`: chưa có số liệu -> lời nói rõ thay cho trục và hình rỗng (trông như biểu đồ hỏng). */
const Khung = ({ tieuDe, moTa, rong = false, trong, children }: {
  tieuDe: string; moTa: string; rong?: boolean; trong?: { tieuDe: string; moTa: string } | false; children: React.ReactElement;
}) => (
  <div className={`hien-dan the p-5 ${rong ? 'md:col-span-2' : ''}`}>
    <h2 className="text-[17px] font-semibold">{tieuDe}</h2><p className="mb-3 text-[13px] text-muted">{moTa}</p>
    {trong
      ? <div className="nen-dong-muc grid h-[270px] place-content-center justify-items-center gap-2 overflow-hidden rounded-xl bg-sunken/60 px-6 text-center">
          <ChartNoAxesColumn className="h-8 w-8 text-muted" strokeWidth={1.5} aria-hidden="true" />
          <b className="text-[15px] font-semibold text-ink-2">{trong.tieuDe}</b>
          <span className="max-w-xs text-[13px] leading-relaxed text-muted">{trong.moTa}</span></div>
      : <div className="h-[270px]"><ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer></div>}
  </div>);
const truc = { fontSize: 12, fill: 'rgb(var(--c-muted))' };
/* Màu biểu đồ lấy từ ba sắc (đã kiểm bằng công cụ kiểm bảng màu, đạt cả nền sáng lẫn tối,
   kể cả người mù màu): trong nước = biển, quốc tế = mai anh đào. Số sao 1→5: một sắc dã quỳ
   từ nhạt tới đậm (thang tuần tự, không dùng đỏ-xanh). */
const M = { nd: '#1E88C8', qt: '#E0457B', mot: '#1E88C8', luoi: 'rgb(var(--c-line))', sao: ['#F7D9A6', '#F4BF6B', '#F29A1F', '#C47A08', '#8F5E00'] };

const CHU: Record<string, [string, string]> = {
  tieuDe: ['Khách đến và đánh giá', 'Visitors and reviews'], moTa: ['Số liệu lượt khách do cán bộ nhập; đánh giá do du khách gửi.', 'Visitor numbers are entered by officials; reviews come from visitors.'],
  nam: ['Năm', 'Year'], luotNam: ['lượt khách trong năm', 'visits this year'], luotQt: ['lượt khách quốc tế', 'international visits'], dg: ['đánh giá của du khách', 'visitor reviews'],
  saoTb: ['số sao trung bình', 'average rating'], theoThang: ['Lượt khách theo tháng', 'Visits by month'], theoThangMoTa: ['Khách trong nước và quốc tế, cộng mọi địa điểm.', 'Domestic and international, all places combined.'],
  tiLe: ['Tỉ lệ khách trong nước và quốc tế', 'Domestic vs international'], trongNam: ['Trong năm đã chọn.', 'In the selected year.'], chuaCo: ['Chưa có số liệu', 'No data yet'],
  top: ['Địa điểm đón nhiều khách nhất', 'Most visited places'], topMoTa: ['Tổng lượt khách trong năm đã chọn.', 'Total visits in the selected year.'], luot: ['Lượt khách', 'Visits'],
  tieuChi: ['Điểm từng tiêu chí', 'Score by aspect'], tieuChiMoTa: ['Trung bình các tiêu chí du khách đã chấm.', 'Average of the aspects visitors rated.'], diem: ['Điểm', 'Score'],
  phanBo: ['Du khách chấm bao nhiêu sao', 'How many stars visitors gave'], phanBoMoTa: ['Số đánh giá ở mỗi mức từ 1 đến 5 sao.', 'Number of reviews at each level, 1 to 5 stars.'], soDg: ['Số đánh giá', 'Reviews'],
  saoDiaDiem: ['Số sao trung bình theo địa điểm', 'Average rating by place'], saoDiaDiemMoTa: ['Chỉ tính địa điểm đã có đánh giá.', 'Rated places only.'], saoTbNgan: ['Sao trung bình', 'Average'],
  dgThang: ['Số đánh giá theo tháng', 'Reviews by month'], dgThangMoTa: ['Mười hai tháng gần nhất.', 'Last twelve months.'], danhGia: ['Đánh giá', 'Reviews'],
  chuaCoLuot: ['Năm này chưa có số liệu lượt khách', 'No visitor numbers for this year yet'],
  chuaCoLuotMoTa: ['Cán bộ du lịch nhập lượt khách theo từng tháng; biểu đồ tự hiện khi có số liệu.', 'Tourism officials enter visitor numbers monthly; the chart appears once there is data.'],
  chuaCoDg: ['Chưa có đánh giá nào', 'No reviews yet'], chuaCoDg12: ['Mười hai tháng gần đây chưa có đánh giá', 'No reviews in the last twelve months'],
  chuaCoDgMoTa: ['Biểu đồ hiện khi du khách bắt đầu chấm điểm các địa điểm.', 'The chart appears once visitors start rating places.'],
  chuaTai: ['Chưa tải được thống kê', 'Could not load statistics'], dangTai: ['Đang tải thống kê…', 'Loading statistics…'],
};

export default function ThongKePage() {
  const { nn, t } = useNN();
  const c = (k: string) => CHU[k][nn === 'en' ? 1 : 0];
  const [nam, setNam] = useState<string>();
  const { data: tk, isLoading, error } = useQuery({ queryKey: ['thong-ke', nam || ''], queryFn: () => layThongKe(nam) });
  if (error) return <div className="container-page py-20 text-center text-[15px]"><b className="block">{c('chuaTai')}</b>{(error as Error).message}</div>;
  if (isLoading || !tk) return <div className="container-page py-20 text-center text-muted">{c('dangTai')}</div>;
  const tongNd = tk.thang.reduce((s, t) => s + t.noiDia, 0), tongQt = tk.thang.reduce((s, t) => s + t.quocTe, 0);
  const khongLuot = tongNd + tongQt === 0 && { tieuDe: c('chuaCoLuot'), moTa: c('chuaCoLuotMoTa') };
  const khongDg = !tk.danhGia.so && { tieuDe: c('chuaCoDg'), moTa: c('chuaCoDgMoTa') };
  const nay = new Date();
  const th12 = Array.from({ length: 12 }, (_, i) => { const d = new Date(nay.getFullYear(), nay.getMonth() - 11 + i, 1);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; return { ten: `${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}`, so: tk.danhGiaTheoThang.find((x) => x.thang === k)?.so || 0 }; });
  return (
    <div className="animate-page">
      <DauTrang tieuDe={c('tieuDe')} moTa={c('moTa')}
        phai={<label className="flex items-center gap-2 text-sm font-semibold text-ink-2">{c('nam')} <select value={tk.nam} onChange={(e) => setNam(e.target.value)} className="o-nhap w-auto py-2">
          {tk.nams.map((n) => <option key={n}>{n}</option>)}</select></label>} />
    <section className="container-page py-12">
      <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[[<DemSo key="a" gt={tongNd + tongQt} />, c('luotNam')], [<DemSo key="b" gt={tongQt} />, c('luotQt')],
          [<DemSo key="c" gt={tk.danhGia.so} />, c('dg')], [tk.danhGia.saoTb ? tk.danhGia.saoTb.toFixed(1) : '–', c('saoTb')]].map(([gt, nhan], i) => (
          <div key={i} className="hien-dan the p-5" style={{ '--i': i } as React.CSSProperties}><b className="so-lon block">{gt}</b><small className="mt-2 block text-[13px] text-muted">{nhan}</small></div>))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {tk.khachTheoXa && tk.khachTheoXa.ds.length > 0 && <Khung rong tieuDe={t('khachTheoXa')} moTa={t('khachTheoXaMoTa', { ky: tk.khachTheoXa.ky })}>
          <BarChart data={tk.khachTheoXa.ds.map((x) => ({ ...x, ten: x.xa.replace(/^(Xã|Phường|Đặc khu) /, '') }))} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid horizontal={false} stroke={M.luoi} /><XAxis type="number" tick={truc} tickFormatter={(v) => so(v)} /><YAxis type="category" dataKey="ten" tick={truc} width={120} />
            <Tooltip formatter={(v) => so(Number(v))} /><Legend />
            <Bar dataKey="noiDia" name={t('trongNuoc')} stackId="k" fill={M.nd} stroke="rgb(var(--c-surface))" strokeWidth={2} maxBarSize={24} />
            <Bar dataKey="quocTe" name={t('quocTe')} stackId="k" fill={M.qt} stroke="rgb(var(--c-surface))" strokeWidth={2} radius={[0, 4, 4, 0]} maxBarSize={24} /></BarChart></Khung>}
        <Khung rong tieuDe={c('theoThang')} moTa={c('theoThangMoTa')} trong={khongLuot}>
          <BarChart data={tk.thang.map((x) => ({ ...x, ten: (nn === 'en' ? 'M' : 'T') + Number(x.thang.slice(5)) }))}>
            <CartesianGrid vertical={false} stroke={M.luoi} /><XAxis dataKey="ten" tick={truc} /><YAxis tick={truc} tickFormatter={(v) => so(v)} width={64} />
            <Tooltip formatter={(v) => so(Number(v))} /><Legend /><Bar dataKey="noiDia" name={t('trongNuoc')} stackId="k" fill={M.nd} stroke="rgb(var(--c-surface))" strokeWidth={2} /><Bar dataKey="quocTe" name={t('quocTe')} stackId="k" fill={M.qt} stroke="rgb(var(--c-surface))" strokeWidth={2} radius={[4, 4, 0, 0]} />
          </BarChart></Khung>
        <Khung tieuDe={c('tiLe')} moTa={c('trongNam')} trong={khongLuot}>
          <PieChart><Pie data={tongNd + tongQt ? [{ ten: t('trongNuoc'), gt: tongNd }, { ten: t('quocTe'), gt: tongQt }] : [{ ten: c('chuaCo'), gt: 1 }]} dataKey="gt" nameKey="ten" innerRadius="58%" outerRadius="85%" paddingAngle={2} stroke="rgb(var(--c-surface))" strokeWidth={2}>
            {(tongNd + tongQt ? [M.nd, M.qt] : ['rgb(var(--c-line))']).map((m) => <Cell key={m} fill={m} />)}</Pie><Tooltip formatter={(v) => (tongNd + tongQt ? so(Number(v)) : '')} /><Legend /></PieChart></Khung>
        <Khung tieuDe={c('top')} moTa={c('topMoTa')} trong={!tk.topDiaDiem.some((x) => x.tong > 0) && { tieuDe: c('chuaCoLuot'), moTa: c('chuaCoLuotMoTa') }}>
          <BarChart data={tk.topDiaDiem} layout="vertical" margin={{ left: 8 }}><XAxis type="number" tick={truc} tickFormatter={(v) => so(v)} /><YAxis type="category" dataKey="ten" tick={truc} width={130} />
            <Tooltip formatter={(v) => so(Number(v))} /><Bar dataKey="tong" name={c('luot')} fill={M.mot} radius={[0, 4, 4, 0]} /></BarChart></Khung>
        <Khung tieuDe={c('tieuChi')} moTa={c('tieuChiMoTa')} trong={khongDg}>
          <RadarChart data={TIEU_CHI.map(([k, vi, en]) => ({ ten: nn === 'en' ? en : vi, gt: Number(tk.danhGia.tieuChi[k] || 0) }))}><PolarGrid stroke={M.luoi} /><PolarAngleAxis dataKey="ten" tick={truc} />
            <PolarRadiusAxis domain={[0, 5]} tickCount={6} tick={{ fontSize: 10 }} /><Radar dataKey="gt" name={c('diem')} stroke={M.mot} strokeWidth={2} fill={M.mot} fillOpacity={0.2} /><Tooltip /></RadarChart></Khung>
        <Khung tieuDe={c('phanBo')} moTa={c('phanBoMoTa')} trong={khongDg}>
          <BarChart data={tk.danhGia.phanBo.map((gt, i) => ({ ten: `${i + 1} ${t('sao')}`, gt }))}><XAxis dataKey="ten" tick={truc} /><YAxis allowDecimals={false} tick={truc} /><Tooltip />
            <Bar dataKey="gt" name={c('soDg')} radius={[4, 4, 0, 0]}>{M.sao.map((m) => <Cell key={m} fill={m} />)}</Bar></BarChart></Khung>
        <Khung tieuDe={c('saoDiaDiem')} moTa={c('saoDiaDiemMoTa')} trong={!tk.saoTheoDiaDiem.length && { tieuDe: c('chuaCoDg'), moTa: c('chuaCoDgMoTa') }}>
          <BarChart data={tk.saoTheoDiaDiem.map((x) => ({ ...x, ten: `${x.ten} (${x.so})`, tb: Number(x.tb.toFixed(2)) }))} layout="vertical" margin={{ left: 8 }}>
            <XAxis type="number" domain={[0, 5]} tick={truc} /><YAxis type="category" dataKey="ten" tick={truc} width={150} /><Tooltip /><Bar dataKey="tb" name={c('saoTbNgan')} fill="#F29A1F" radius={[0, 4, 4, 0]} /></BarChart></Khung>
        <Khung tieuDe={c('dgThang')} moTa={c('dgThangMoTa')} trong={th12.every((x) => !x.so) && { tieuDe: c('chuaCoDg12'), moTa: c('chuaCoDgMoTa') }}>
          <AreaChart data={th12}><XAxis dataKey="ten" tick={truc} /><YAxis allowDecimals={false} tick={truc} /><Tooltip />
            <Area type="monotone" dataKey="so" name={c('danhGia')} stroke={M.qt} strokeWidth={2} fill={M.qt} fillOpacity={0.14} /></AreaChart></Khung>
      </div>
    </section>
    </div>
  );
}
