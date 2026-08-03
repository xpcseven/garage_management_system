import { getPublicTourismPlacesForGuest } from "@/lib/actions/tourism_places.actions";
import LandingNav from "@/components/landing/LandingNav";
import LandingFooter from "@/components/landing/LandingFooter";
import PublicTourismPlacesCatalog from "@/components/tourism-places-public/PublicTourismPlacesCatalog";

export default async function PublicTourismPlacesPage() {
  const places = await getPublicTourismPlacesForGuest();

  return (
    <main className="min-h-screen bg-mist text-dusk">
      <LandingNav />
      <PublicTourismPlacesCatalog places={places} />
      <LandingFooter />
    </main>
  );
}
