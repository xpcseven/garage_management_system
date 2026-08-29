import { currentUser } from "@/lib/auth";
import UnAuthorized from "@/components/UnAuthorized";
import { canManageTourismPlaces } from "@/lib/permissions";
import { getTourismPlaces } from "@/lib/actions/tourism_places.actions";
import { getActiveCitiesPublic } from "@/lib/actions/city.actions";
import Tourism_Places_Component from "@/components/Tourism_Places/Tourism_Places_Component";

export default async function TourismPlacesPage() {
  const user = await currentUser();
  if (!user || !canManageTourismPlaces(user.role)) {
    return <UnAuthorized />;
  }

  const [places, cities] = await Promise.all([
    getTourismPlaces(),
    getActiveCitiesPublic(),
  ]);
  return <Tourism_Places_Component places={places} cities={cities} />;
}
