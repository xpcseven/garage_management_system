import { currentUser } from "@/lib/auth";
import UnAuthorized from "@/components/UnAuthorized";
import { canManageTourismPlaces } from "@/lib/permissions";
import { getTourismPlaces } from "@/lib/actions/tourism_places.actions";
import Tourism_Places_Component from "@/components/Tourism_Places/Tourism_Places_Component";

export default async function TourismPlacesPage() {
  const user = await currentUser();
  if (!user || !canManageTourismPlaces(user.role)) {
    return <UnAuthorized />;
  }

  const places = await getTourismPlaces();
  return <Tourism_Places_Component places={places} />;
}