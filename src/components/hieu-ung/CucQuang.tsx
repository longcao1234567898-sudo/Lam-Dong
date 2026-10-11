/**
 * Nền cực quang: ba vầng màu của ba vùng (mai anh đào, biển, dã quỳ) loang chậm như ánh
 * chiều trên cao nguyên, mỗi vòng 10–14 giây. Chỉ đổi transform nên nhẹ máy; bật "giảm
 * chuyển động" thì đứng yên. Khung cha cần position: relative và isolation: isolate
 * (hoặc overflow: hidden) để lớp này nằm dưới nội dung.
 */
export default function CucQuang({ toi = false, className = '' }: { toi?: boolean; className?: string }) {
  return (
    <div className={`cuc-quang ${toi ? 'cuc-quang-toi' : ''} ${className}`} aria-hidden="true">
      <i /><i /><i />
    </div>);
}
