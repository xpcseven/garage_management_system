import { getApprovedFarmsForPassenger } from "@/lib/actions/farm.actions";
import PassengerFarmsList from "@/components/passenger/PassengerFarmsList";

export default async function PassengerFarmsPage() {
  const farms = await getApprovedFarmsForPassenger();
  return <PassengerFarmsList farms={farms} />;
}
