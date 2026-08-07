import { getApprovedHotelsForPassenger } from "@/lib/actions/hotel.actions";
import PassengerHotelsList from "@/components/passenger/PassengerHotelsList";

export default async function PassengerHotelsPage() {
  const hotels = await getApprovedHotelsForPassenger();
  return <PassengerHotelsList hotels={hotels} />;
}
