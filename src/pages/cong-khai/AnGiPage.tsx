/**
 * Ăn gì ở Lâm Đồng: món tiêu biểu và quà mang về của ba vùng (giới thiệu chung, viết sẵn), kèm
 * nơi ăn uống, mua đặc sản lấy từ các địa điểm loại "am-thuc", "dac-san" cán bộ đã đăng.
 * Không nêu tên quán, giá: chỗ cụ thể do cán bộ giới thiệu ở phần địa điểm.
 */
import { useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { UtensilsCrossed, Gift, MapPin, Info } from 'lucide-react';
import { DauTrang } from '../../components/du-lich/GiaoDien';
import { layDiaDiem } from '../../services/api';
import { VUNG, lopVung } from '../../utils/hangSo';
import { useNN } from '../../i18n/NgonNgu';
import type { Vung } from '../../utils/kieu';

type Mon = { vi: [string, string]; en: [string, string] };
const MON: Record<Vung, { mon: Mon[]; qua: [string, string][] }> = {
  'cao-nguyen': {
    mon: [
      { vi: ['Bánh căn', 'Bột gạo đổ vào khuôn đất nướng trên than, ăn nóng với nước chấm, xíu mại hoặc trứng. Hợp nhất vào sáng sớm và tối se lạnh.'],
        en: ['Banh can', 'Rice batter cooked in clay moulds over charcoal, eaten hot with dipping sauce, meatballs or egg. Best on chilly mornings and evenings.'] },
      { vi: ['Bánh tráng nướng', 'Bánh tráng nướng giòn trên than với trứng, hành và đủ thứ nhân, món ăn vặt buổi tối quen thuộc của Đà Lạt.'],
        en: ['Grilled rice paper', 'Rice paper grilled crisp over charcoal with egg, spring onion and toppings, Da Lat\'s classic evening snack.'] },
      { vi: ['Bánh mì xíu mại', 'Bánh mì chấm chén xíu mại nước dùng nóng, món ăn sáng của người Đà Lạt.'],
        en: ['Banh mi with meatball soup', 'Bread dipped into a hot bowl of pork meatballs in broth, a Da Lat breakfast.'] },
      { vi: ['Lẩu gà lá é', 'Gà nấu với lá é, loại rau thơm nồng vị cay the, ăn giữa trời lạnh.'],
        en: ['Chicken hotpot with e leaves', 'Chicken cooked with e, a pungent peppery herb, perfect in the cold.'] },
      { vi: ['Nem nướng', 'Nem nướng cuốn rau, chấm nước chấm sệt đậm vị.'],
        en: ['Grilled pork rolls', 'Grilled pork sausage rolled with greens, dipped in a thick savoury sauce.'] },
      { vi: ['Sữa đậu nành nóng', 'Ly sữa đậu nành nóng với bánh ngọt bên lề đường vào buổi tối.'],
        en: ['Hot soy milk', 'A hot cup of soy milk with pastries at a roadside stall in the evening.'] },
    ],
    qua: [['Atiso (trà, cao)', 'Artichoke tea and extract'], ['Mứt Đà Lạt', 'Da Lat candied fruit'], ['Dâu tây', 'Strawberries'],
      ['Hồng treo gió, hồng sấy', 'Dried persimmons'], ['Rau củ cao nguyên', 'Highland vegetables'], ['Cà phê', 'Coffee']],
  },
  'bien-dao': {
    mon: [
      { vi: ['Bánh canh chả cá Phan Thiết', 'Sợi bánh canh trong nước dùng cá, ăn với chả cá chiên thái lát.'],
        en: ['Phan Thiet fishcake noodle soup', 'Thick noodles in fish broth with sliced fried fishcake.'] },
      { vi: ['Lẩu thả', 'Món cầu kỳ của Phan Thiết: cá, trứng, thịt, rau và bún xếp thành hình bông hoa, chan nước lẩu khi ăn.'],
        en: ['Lau tha', 'An elaborate Phan Thiet dish: fish, egg, pork, herbs and noodles arranged like a flower, with hot broth poured over.'] },
      { vi: ['Gỏi cá mai', 'Cá mai tươi trộn thính, cuốn bánh tráng với rau sống, chấm nước chấm đậu phộng.'],
        en: ['Ca mai fish salad', 'Fresh anchovy-like fish tossed with toasted rice powder, wrapped in rice paper with herbs and peanut sauce.'] },
      { vi: ['Bánh xèo khuôn', 'Bánh xèo nhỏ đổ trong khuôn đất, nhân tôm mực, ăn với rau và nước chấm.'],
        en: ['Mini banh xeo', 'Small crispy pancakes cooked in clay moulds with shrimp or squid, eaten with herbs and dipping sauce.'] },
      { vi: ['Dông nướng', 'Dông cát, đặc sản vùng đồi cát ven biển, nướng hoặc xào lăn.'],
        en: ['Grilled sand lizard', 'Sand lizard, a speciality of the coastal dunes, grilled or stir-fried.'] },
      { vi: ['Cua mặt trăng Phú Quý', 'Loại cua có đốm tròn trên mai, đặc sản của đảo Phú Quý.'],
        en: ['Phu Quy moon crab', 'A crab with round spots on its shell, a speciality of Phu Quy island.'] },
    ],
    qua: [['Nước mắm Phan Thiết', 'Phan Thiet fish sauce'], ['Thanh long', 'Dragon fruit'], ['Mực một nắng', 'Sun-dried squid'],
      ['Hải sản khô', 'Dried seafood'], ['Cốm hộc', 'Com hoc sweets']],
  },
  'dai-ngan': {
    mon: [
      { vi: ['Cơm lam', 'Gạo nếp cho vào ống tre, ống nứa nướng trên lửa, ăn với muối vừng hoặc gà nướng.'],
        en: ['Bamboo-tube rice', 'Sticky rice cooked in bamboo tubes over the fire, eaten with sesame salt or grilled chicken.'] },
      { vi: ['Gà nướng', 'Gà thả đồi nướng than, chấm muối ớt, hay ăn cùng cơm lam.'],
        en: ['Grilled chicken', 'Free-range chicken grilled over charcoal with chilli salt, often served with bamboo-tube rice.'] },
      { vi: ['Canh thụt', 'Món của đồng bào bản địa: rau rừng, cà đắng, thịt hoặc cá cho vào ống nứa, dùng que thụt cho nhuyễn rồi nấu.'],
        en: ['Canh thut', 'An indigenous dish: forest greens, bitter eggplant and meat or fish packed into a bamboo tube, pounded and cooked.'] },
      { vi: ['Cà đắng', 'Cà đắng nấu, xào hoặc giã, vị đắng nhẹ rất riêng của núi rừng.'],
        en: ['Bitter eggplant', 'Bitter eggplant stewed, stir-fried or pounded, with a mild, distinctive bitterness.'] },
      { vi: ['Lá bép xào', 'Lá rừng mềm, xào tỏi hoặc nấu canh, món rau quen thuộc của vùng.'],
        en: ['Stir-fried bep leaves', 'Tender forest leaves stir-fried with garlic or cooked in soup.'] },
      { vi: ['Rượu cần', 'Uống chung qua cần trúc trong dịp lễ hội, gắn với văn hoá cồng chiêng.'],
        en: ['Rice wine through straws', 'Shared through bamboo straws at festivals, part of gong culture.'] },
    ],
    qua: [['Cà phê', 'Coffee'], ['Hồ tiêu', 'Black pepper'], ['Hạt mắc ca', 'Macadamia nuts'], ['Sầu riêng (theo mùa)', 'Durian (in season)'], ['Bơ (theo mùa)', 'Avocado (in season)']],
  },
};

export default function AnGiPage() {
  const { t, chon, nn } = useNN();
  const { data: ds = [] } = useQuery({ queryKey: ['dia-diem'], queryFn: layDiaDiem });
  const [loc, setLoc] = useState<Vung | null>(null);
  const noiAn = ds.filter((p) => p.loai === 'am-thuc' || p.loai === 'dac-san');
  const cacVung = (Object.keys(VUNG) as Vung[]).filter((v) => !loc || v === loc);
  const chonCap = ([vi, en]: [string, string]) => (nn === 'en' ? en : vi);
  return (
    <div className="animate-page">
      <DauTrang tieuDe={t('anGiTieuDe')} moTa={t('anGiMoTa')}>
        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label={t('vung')}>
          <button type="button" className="chip" aria-pressed={!loc} onClick={() => setLoc(null)}>{t('tatCa')}</button>
          {(Object.keys(VUNG) as Vung[]).map((v) => <button key={v} type="button" className={`chip ${lopVung(v)}`} aria-pressed={loc === v} onClick={() => setLoc(loc === v ? null : v)}>
            <span className="cham-vung" aria-hidden="true" />{nn === 'en' ? VUNG[v].en : VUNG[v].ten}</button>)}
        </div>
      </DauTrang>
      <div className="container-page space-y-14 py-12">
        {cacVung.map((v) => { const k = MON[v], noi = noiAn.filter((p) => p.vung === v); return (
          <section key={v} className={lopVung(v)} aria-labelledby={`an-${v}`}>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-8 w-1.5 rounded-full" style={{ background: 'var(--vm)' }} aria-hidden="true" />
              <h2 id={`an-${v}`} className="tieu-de-vua">{nn === 'en' ? VUNG[v].en : VUNG[v].ten}</h2>
            </div>
            <h3 className="mb-3 text-sm font-semibold text-ink-2">{t('monTieuBieu')}</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{k.mon.map((m, i) => { const [ten, moTa] = nn === 'en' ? m.en : m.vi; return (
              <article key={m.vi[0]} className="hien-dan the flex gap-4 p-5" style={{ '--i': i % 3 } as CSSProperties}>
                <span className="o-bieu-tuong h-11 w-11 rounded-xl"><UtensilsCrossed className="h-5 w-5" aria-hidden="true" /></span>
                <div className="min-w-0"><h4 className="text-[17px] font-semibold leading-snug">{ten}</h4>
                  {nn === 'en' && <p className="text-[13px] text-muted">{m.vi[0]}</p>}
                  <p className="mt-1 text-[15px] leading-relaxed text-ink-2">{moTa}</p></div>
              </article>); })}</div>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="mr-1 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-2"><Gift className="h-4 w-4" aria-hidden="true" />{t('muaVe')}:</span>
              {k.qua.map((q) => <span key={q[0]} className="rounded-full border border-line bg-paper px-3 py-1.5 text-[14px]">{chonCap(q)}</span>)}
            </div>
            <h3 className="mb-1 mt-7 text-sm font-semibold text-ink-2">{t('noiAnUong')}</h3>
            {noi.length ? <><p className="mb-3 text-[13px] text-muted">{t('noiAnUongMoTa')}</p>
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{noi.map((p) => (
                <li key={p.id}><Link to={`/dia-diem/${p.id}`} className="the flex min-h-[56px] items-center gap-3 p-3 transition-shadow hover:shadow-sh-2">
                  <MapPin className="h-5 w-5 shrink-0" style={{ color: 'var(--vm)' }} aria-hidden="true" />
                  <span className="min-w-0"><b className="block truncate text-[15px] font-semibold">{chon(p.ten, p.tenEn)}</b>{p.xa && <small className="block truncate text-[13px] text-muted">{p.xa}</small>}</span></Link></li>))}</ul></>
              : <p className="text-[14px] text-muted">{t('chuaCoNoiAn')}</p>}
          </section>); })}
        <p className="flex gap-2 text-[13px] leading-relaxed text-muted"><Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{t('anGiLuuY')}</p>
      </div>
    </div>);
}
