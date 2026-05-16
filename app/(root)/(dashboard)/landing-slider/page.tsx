import { currentUser } from "@/lib/auth";
import { canManageLandingSlider } from "@/lib/permissions";
import { getLandingSliderSlides } from "@/lib/actions/landing_slider.actions";
import Landing_Slider_Component from "@/components/Landing_Slider/Landing_Slider_Component";
import UnAuthorized from "@/components/UnAuthorized";

export default async function LandingSliderPage() {
  const user = await currentUser();
  if (!user || !canManageLandingSlider(user.role)) {
    return <UnAuthorized />;
  }

  const slides = await getLandingSliderSlides();
  return <Landing_Slider_Component slides={slides} />;
}
