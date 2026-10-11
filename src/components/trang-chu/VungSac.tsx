/**
 * "Ba sắc Lâm Đồng": ba vùng du lịch của tỉnh sau hợp nhất, mỗi vùng một màu và một ảnh
 * thật. Rê chuột (hoặc Tab tới) một vùng thì vùng đó mở rộng; bấm vào là lọc khối Khám phá
 * theo vùng đó. Số điểm đếm từ dữ liệu thật, chưa tải xong thì không hiện số.
 */
import type { CSSProperties } from 'react';
import { useNN } from '../../i18n/NgonNgu';
import { VUNG } from '../../utils/hangSo';
import { anhUrl } from '../../services/api';
import { anhMacDinh } from '../../utils/anhMacDinh';
import type { DiaDiem, Vung } from '../../utils/kieu';

/** Câu chữ đổ màu dần theo nhịp cuộn, từng chữ một. */
export function ChuDoMau({ chu, className = '' }: { chu: string; className?: string }) {
  return <span className={`chu-do-mau ${className}`}>{chu.split(' ').map((c, i) => (
    <span key={i} style={{ '--i': i } as CSSProperties}>{c}{' '}</span>))}</span>;
}

function anhVung(ds: DiaDiem[]) {
  const sx = [...ds].sort((a, b) => Number(b.noiBat) - Number(a.noiBat));
  for (const p of sx) {
    const a = p.anh?.[0];
    if (a) return { src: anhUrl(a.id), viTri: `${a.tieuDiemX ?? 50}% ${a.tieuDiemY ?? 50}%` };
    const m = anhMacDinh(p.id);
    if (m) return { src: m.nho, viTri: '50% 50%' };
  }
  return null;
}

export default function VungSac({ ds, dangTai, onChon }: { ds: DiaDiem[]; dangTai: boolean; onChon: (v: Vung) => void }) {
  const { t, nn, chon } = useNN();
  return (
    <section className="py-20 sm:py-28" aria-labelledby="vung-sac-tieu-de">
      <div className="container-page">
        <div className="mb-10 max-w-3xl">
          <h2 id="vung-sac-tieu-de" className="tieu-de-muc"><ChuDoMau chu={t('vungSacTieuDe')} /></h2>
          <p className="mt-3 text-[17px] leading-relaxed text-muted">{t('vungSacMoTa')}</p>
        </div>
        <div className="vung-sac flex flex-col gap-3 lg:h-[30rem] lg:flex-row">
          {(Object.keys(VUNG) as Vung[]).map((v, i) => {
            const k = VUNG[v], cua = ds.filter((p) => p.vung === v), anh = anhVung(cua);
            return (
              <button key={v} type="button" onClick={() => onChon(v)} className={`vung-o hien-dan vung-${k.token}`} style={{ '--i': i } as CSSProperties}
                aria-label={`${t('xemDiemVung')}: ${nn === 'en' ? k.en : k.ten}`}>
                {anh && <img src={anh.src} alt="" loading="lazy" decoding="async" className="vung-anh" style={{ objectPosition: anh.viTri }} />}
                <span className="vung-man" aria-hidden="true" />
                <span className="relative z-[1] flex h-full flex-col justify-end p-6 text-left sm:p-8">
                  <span className="vung-ten font-serif font-medium leading-[1.1] tracking-[-0.02em]">{nn === 'en' ? k.nganEn : k.ngan}</span>
                  <span className="mt-1 text-[15px] opacity-90">{nn === 'en' ? k.en : k.ten}</span>
                  {!dangTai && <span className="vung-them mt-4 block text-[15px]">
                    <b className="font-semibold">{t('soDiemDen', { n: cua.length })}</b>
                    {cua.length > 0 && <span className="mt-1 block opacity-90">{cua.slice(0, 3).map((p) => chon(p.ten, p.tenEn)).join(', ')}</span>}
                  </span>}
                </span>
              </button>);
          })}
        </div>
      </div>
    </section>);
}
