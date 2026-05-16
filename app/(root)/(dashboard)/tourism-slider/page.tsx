import { currentUser } from "@/lib/auth";
import UnAuthorized from "@/components/UnAuthorized";
import { canManageTourismSlider } from "@/lib/permissions";
import { getTourismSliderSlides } from "@/lib/actions/tourism_slider.actions";
import Tourism_Slider_Component from "@/components/Tourism_Slider/Tourism_Slider_Component";

export default async function TourismSliderPage() {
  const user = await currentUser();
  if (!user || !canManageTourismSlider(user.role)) {
    return <UnAuthorized />;
  }

  const slides = await getTourismSliderSlides();
  return <Tourism_Slider_Component slides={slides} />;
}
