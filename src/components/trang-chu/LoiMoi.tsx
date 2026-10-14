/**
 * Khối kết trang chủ: lời mời lên đường trên mảng rừng đêm, cánh hoa ba sắc xoáy theo chuột.
 * Hai lối đi tiếp: xem lộ trình gợi ý, hoặc tự xếp lộ trình của mình.
 */
import { Link } from 'react-router-dom';
import { Route, Plus } from 'lucide-react';
import { useNN } from '../../i18n/NgonNgu';
import TruongHat from '../hieu-ung/TruongHat';
import CucQuang from '../hieu-ung/CucQuang';
import { ChuDoMau } from './VungSac';

export default function LoiMoi() {
  const { t } = useNN();
  return (
    <section className="nen-toi relative isolate overflow-hidden py-16 sm:py-24 lg:py-32" aria-labelledby="loi-moi-tieu-de">
      <CucQuang toi />
      <TruongHat toi matDo={0.7} className="hat-loi-moi" />
      <div className="container-page relative text-center">
        <span className="ba-sac mx-auto mb-7 w-fit" aria-hidden="true"><i /><i /><i /></span>
        <h2 id="loi-moi-tieu-de" className="tieu-de-lon mx-auto max-w-[18ch]"><ChuDoMau chu={t('loiMoiTieuDe')} className="chu-do-mau-toi" /></h2>
        <p className="mx-auto mt-5 max-w-[46ch] text-[17px] leading-relaxed text-[#DCE4E0] sm:text-lg">{t('loiMoiMoTa')}</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link to="/lo-trinh" className="nut nut-coral"><Route className="h-[18px] w-[18px]" />{t('goiYLoTrinh')}</Link>
          <Link to="/tu-tao-lo-trinh" className="nut nut-tren-toi"><Plus className="h-[18px] w-[18px]" />{t('tuTaoLoTrinh')}</Link>
        </div>
      </div>
    </section>);
}
