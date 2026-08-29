import { getTourismCompaniesForPassengerBrowse } from "@/lib/actions/tourism_program.actions";
import Passenger_Tourism_Programs_Component from "@/components/passenger/Passenger_Tourism_Programs_Component";

export default async function PassengerTourismProgramsPage() {
  const companies = await getTourismCompaniesForPassengerBrowse();
  return <Passenger_Tourism_Programs_Component companies={companies} />;
}
