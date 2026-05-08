import { currentUser } from "@/lib/auth";
import { UserRole } from "@/prisma/UserRole.enum";
import UnAuthorized from "@/components/UnAuthorized";
import { getTourismPlaceRequests } from "@/lib/actions/tourism_places.actions";
import Tourism_Place_Requests_Component from "@/components/Tourism_Places/Tourism_Place_Requests_Component";

export default async function TourismRequestsPage() {
  const user = await currentUser();
  if (!user || user.role !== UserRole.SUPER_ADMIN) {
    return <UnAuthorized />;
  }

  const requests = await getTourismPlaceRequests();
  return <Tourism_Place_Requests_Component requests={requests} />;
}

