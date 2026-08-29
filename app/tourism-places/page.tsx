import { currentUser } from "@/lib/auth";
import { canSuggestTourismPlaces } from "@/lib/permissions";
import { getPublicTourismPlacesForGuest } from "@/lib/actions/tourism_places.actions";
import { getActiveCitiesPublic } from "@/lib/actions/city.actions";
import LandingNav from "@/components/landing/LandingNav";
import LandingFooter from "@/components/landing/LandingFooter";
import PublicTourismPlacesCatalog from "@/components/tourism-places-public/PublicTourismPlacesCatalog";

export default async function PublicTourismPlacesPage() {
  const [places, cities, user] = await Promise.all([
    getPublicTourismPlacesForGuest(),
    getActiveCitiesPublic(),
    currentUser(),
  ]);

  return (
    <main className="min-h-screen bg-mist text-dusk">
      <LandingNav />
      <PublicTourismPlacesCatalog
        places={places}
        cities={cities}
        canSuggest={canSuggestTourismPlaces(user?.role)}
      />
      <LandingFooter />
    </main>
  );
}
