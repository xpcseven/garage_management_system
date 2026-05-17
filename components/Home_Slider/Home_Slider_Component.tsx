import type { HomeSliderSlideRow } from "@/lib/actions/home_slider.actions";
import Home_Slider_Create from "./Home_Slider_Create";
import Home_Slider_Table from "./Home_Slider_Table";

type Props = {
  slides: HomeSliderSlideRow[];
};

export default function Home_Slider_Component({ slides }: Props) {
  return (
    <div className="space-y-8 p-4 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-purple-700">سلايدر الصفحة الرئيسية</h1>
        <p className="text-muted-foreground text-sm mt-1 text-purple-500">
          إضافة وتعديل وحذف صور السلايدر في الواجهة العامة (صلاحية المشرف العام فقط).
        </p>
      </div>
      <Home_Slider_Create />
      <Home_Slider_Table slides={slides} />
    </div>
  );
}
