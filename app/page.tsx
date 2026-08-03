import { getPublicTourismPlacesForLanding } from "@/lib/actions/tourism_places.actions";
import { getPublicHomeSliderSlides } from "@/lib/actions/home_slider.actions";
import LandingNav from "@/components/landing/LandingNav";
import LandingHero from "@/components/landing/LandingHero";
import LandingServices from "@/components/landing/LandingServices";
import LandingPlaces from "@/components/landing/LandingPlaces";
import LandingAudiences from "@/components/landing/LandingAudiences";
import LandingHighlights from "@/components/landing/LandingHighlights";
import LandingJourney from "@/components/landing/LandingJourney";
import LandingNetwork from "@/components/landing/LandingNetwork";
import LandingCta from "@/components/landing/LandingCta";
import LandingFooter from "@/components/landing/LandingFooter";

export default async function LandingPage() {
  const [tourismPlaces, sliderSlides] = await Promise.all([
    getPublicTourismPlacesForLanding(),
    getPublicHomeSliderSlides(),
  ]);

  const slides = sliderSlides.map((s) => ({
    id: s.id,
    src: s.imageUrl,
    title: s.title,
  }));

  return (
    <main className="min-h-screen bg-mist text-dusk">
      <LandingNav />
      <LandingHero slides={slides} />
      <LandingServices />
      <LandingPlaces places={tourismPlaces} />
      <LandingAudiences />
      <LandingHighlights />
      <LandingJourney />
      <LandingNetwork />
      <LandingCta />
      <LandingFooter />
    </main>
  );
}
