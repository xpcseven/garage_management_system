import { currentUser } from "@/lib/auth";
import { canManageHotels } from "@/lib/permissions";
import {
  getHotelOptionsForRooms,
  getHotelRoomsForOwner,
} from "@/lib/actions/hotel.actions";
import HotelRoomsManager from "@/components/hotel/HotelRoomsManager";
import UnAuthorized from "@/components/UnAuthorized";

export default async function HotelRoomsPage() {
  const user = await currentUser();
  if (!user || !canManageHotels(user.role)) return <UnAuthorized />;
  const [rooms, hotels] = await Promise.all([
    getHotelRoomsForOwner(),
    getHotelOptionsForRooms(),
  ]);
  return <HotelRoomsManager rooms={rooms} hotels={hotels} />;
}
