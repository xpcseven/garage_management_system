import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  getPublicHomeSliderImages,
  hasConfiguredHomeSliderImages,
} from "@/lib/actions/home_slider.actions";
import { getPublicTourismPlacesForLanding } from "@/lib/actions/tourism_places.actions";
import Tourism_Img_Component from "@/components/Dashboard_Components/Tourism_Img_Component";
import Dashboard_Nav from "@/components/Dashboard_Components/Dashboard_Nav";
import Dashboard_Tourism_Places from "@/components/Dashboard_Components/Dashboard_Tourism_Places";
import Dashboard_Travel_Ads from "@/components/Dashboard_Components/Dashboard_Travel_Ads";
import Dashboard_Details from "@/components/Dashboard_Components/Dashboard_Details";

export default async function LandingPage() {
  const tourismPlaces = await getPublicTourismPlacesForLanding();
  const homeSliderImages = await getPublicHomeSliderImages();
  const hasConfiguredSlider = await hasConfiguredHomeSliderImages();

  return (
    <main className="min-h-screen bg-white text-slate-900">

      <section className="">
        <Dashboard_Nav />
      </section>

      <section>
        <Tourism_Img_Component
          slides={homeSliderImages.map((slide) => ({
            src: slide.imageUrl,
            title: slide.title,
          }))}
          allowFallback={!hasConfiguredSlider}
        />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <Dashboard_Tourism_Places tourismPlaces={tourismPlaces} />
      </section>

      <section className="border-y border-purple-100 bg-purple-50/70">
        <Dashboard_Details />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <Dashboard_Travel_Ads />
      </section>


      <section className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6 lg:px-8">
        <h3 className="text-2xl font-bold sm:text-3xl">
          آشور للسياحة و السفر - Ashuor Tourism and Travel
        </h3>
        <p className="mx-auto mt-4 max-w-2xl text-slate-600">
          انت على بعد خطوة واحدة من تنظيم رحلاتك والسفر.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild className=" px-8">
            <Link href="/auth/register">إنشاء حساب</Link>
          </Button>
          <Button asChild variant="outline" className="border-purple-300 bg-white text-purple-700 hover:bg-purple-50">
            <Link href="/auth/login">الدخول للنظام</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
