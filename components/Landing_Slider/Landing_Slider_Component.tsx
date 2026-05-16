import type { LandingSliderSlideRow } from "@/lib/actions/landing_slider.actions";
import { DEFAULT_LANDING_SLIDER } from "@/lib/constants/landing-slider";
import Landing_Slider_Create from "./Landing_Slider_Create";
import Landing_Slider_Table from "./Landing_Slider_Table";

type Props = {
  slides: LandingSliderSlideRow[];
};

export default function Landing_Slider_Component({ slides }: Props) {
  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-purple-700">سلايدر الصفحة الرئيسية</h1>
        <p className="text-sm text-purple-500">
          إضافة وتعديل وحذف صور السلايدر. تبقى الشريحة الافتراضية «
          {DEFAULT_LANDING_SLIDER.title}» دائماً ولا يمكن حذفها.
        </p>
      </div>
      <Landing_Slider_Create />
      <Landing_Slider_Table slides={slides} />
    </div>
  );
}
