import { currentUser } from "@/lib/auth";
import { getCities } from "@/lib/actions/city.actions";
import { canManageCities } from "@/lib/permissions";
import City_Component from "@/components/garage/city/City_Component";
import UnAuthorized from "@/components/UnAuthorized";

export default async function CitiesPage() {
  const user = await currentUser();
  if (!user || !canManageCities(user.role)) {
    return <UnAuthorized />;
  }
  const cities = await getCities();
  return <City_Component cities={cities} />;
}
