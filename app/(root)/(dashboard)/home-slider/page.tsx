import { currentUser } from "@/lib/auth";
import UnAuthorized from "@/components/UnAuthorized";
import { canManageHomeSlider } from "@/lib/permissions";
import { getHomeSliderSlides } from "@/lib/actions/home_slider.actions";
import Home_Slider_Component from "@/components/Home_Slider/Home_Slider_Component";

export default async function HomeSliderPage() {
  const user = await currentUser();
  if (!user || !canManageHomeSlider(user.role)) {
    return <UnAuthorized />;
  }

  const slides = await getHomeSliderSlides();
  return <Home_Slider_Component slides={slides} />;
}
