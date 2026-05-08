import { currentUser } from "@/lib/auth";
import { canUsePassengerPortal } from "@/lib/permissions";
import { getTourismProgramsForPassenger } from "@/lib/actions/tourism_program.actions";
import Passenger_Tourism_Programs_Component from "@/components/passenger/Passenger_Tourism_Programs_Component";
import UnAuthorized from "@/components/UnAuthorized";

export default async function PassengerTourismProgramsPage() {
  const user = await currentUser();
  if (!user || !canUsePassengerPortal(user.role)) {
    return <UnAuthorized />;
  }

  const programs = await getTourismProgramsForPassenger();
  return <Passenger_Tourism_Programs_Component programs={programs} />;
}

