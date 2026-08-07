import { currentUser } from "@/lib/auth";
import { canUsePassengerPortal } from "@/lib/permissions";
import { getTourismProgramsForPassenger } from "@/lib/actions/tourism_program.actions";
import Passenger_Tourism_Programs_Component from "@/components/passenger/Passenger_Tourism_Programs_Component";

export default async function PassengerTourismProgramsPage() {
  const user = await currentUser();
  const isLoggedIn = Boolean(user && canUsePassengerPortal(user.role));
  const programs = await getTourismProgramsForPassenger();
  return (
    <Passenger_Tourism_Programs_Component
      programs={programs}
      isLoggedIn={isLoggedIn}
    />
  );
}
