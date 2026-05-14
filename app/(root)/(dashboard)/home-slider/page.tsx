import { currentUser } from "@/lib/auth";
import UnAuthorized from "@/components/UnAuthorized";
import Home_Slider_Component from "@/components/Home_Slider/Home_Slider_Component";
import { getHomeSliderImages } from "@/lib/actions/home_slider.actions";
import { UserRole } from "@/prisma/UserRole.enum";

export default async function HomeSliderPage() {
  const user = await currentUser();
  if (!user || user.role !== UserRole.SUPER_ADMIN) {
    return <UnAuthorized />;
  }

  const slides = await getHomeSliderImages();
  return <Home_Slider_Component slides={slides} />;
}
