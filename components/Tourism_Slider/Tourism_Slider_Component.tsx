import type { TourismSliderSlideRow } from "@/lib/actions/tourism_slider.actions";
import Tourism_Slider_Create from "./Tourism_Slider_Create";
import Tourism_Slider_Table from "./Tourism_Slider_Table";
import Image from "next/image";

type Props = {
  slides: TourismSliderSlideRow[];
};

export default function Tourism_Slider_Component({ slides }: Props) {
  return (
    <div className="space-y-8 p-4">
      <div>
        <h1 className="text-2xl font-bold text-purple-700">
          سلايدر المعالم السياحية
        </h1>
        <p className="mt-1 text-sm text-purple-500">
          إضافة وتعديل وحذف صور السلايدر في الصفحة الرئيسية.
        </p>
      </div>

      <div className="flex items-center justify-between border-b border-purple-200 pb-4">
        <Tourism_Slider_Create />
        <Image
          src="/System/flags.png"
          alt="Tourism Slider"
          className="h-[30px] w-[90px] object-cover"
          width={100}
          height={100}
        />
      </div>

      <Tourism_Slider_Table slides={slides} />
    </div>
  );
}
