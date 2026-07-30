import { UserRole } from "@/prisma/UserRole.enum";

export function canManageCities(role: UserRole | string | undefined) {
  return role === UserRole.SUPER_ADMIN;
}

/** إدارة سلايدر الصفحة الرئيسية */
export function canManageHomeSlider(role: UserRole | string | undefined) {
  return role === UserRole.SUPER_ADMIN;
}

/** عرض وإدارة المستخدمين */
export function canManageUsers(role: UserRole | string | undefined) {
  return role === UserRole.SUPER_ADMIN;
}

export function canManageGarages(role: UserRole | string | undefined) {
  return (
    role === UserRole.SUPER_ADMIN ||
    role === UserRole.GARAGE_OWNER ||
    role === UserRole.DRIVER
  );
}

export function canCreateGarage(role: UserRole | string | undefined) {
  return role === UserRole.SUPER_ADMIN || role === UserRole.GARAGE_OWNER;
}

export function canManageVehicles(role: UserRole | string | undefined) {
  return (
    role === UserRole.SUPER_ADMIN ||
    role === UserRole.GARAGE_OWNER ||
    role === UserRole.DRIVER
  );
}

/** إنشاء وإدارة الرحلات (كراج، سائق مستقل، أو مشرف) */
export function canManageTrips(role: UserRole | string | undefined) {
  return (
    role === UserRole.SUPER_ADMIN ||
    role === UserRole.GARAGE_OWNER ||
    role === UserRole.DRIVER
  );
}

/** بوابة المسافر: كراجات مسجّلة + بحث رحلات */
export function canUsePassengerPortal(role: UserRole | string | undefined) {
  return role === UserRole.USER;
}

export function canViewBookings(role: UserRole | string | undefined) {
  return !!role;
}

/** إدارة الأماكن السياحية */
export function canManageTourismPlaces(role: UserRole | string | undefined) {
  return (
    role === UserRole.SUPER_ADMIN ||
    role === UserRole.TOURISM_OWNER ||
    role === UserRole.GARAGE_OWNER
  );
}

export function canManageHotels(role: UserRole | string | undefined) {
  return role === UserRole.SUPER_ADMIN || role === UserRole.HOTEL_OWNER;
}

export function canManageRestaurants(role: UserRole | string | undefined) {
  return role === UserRole.SUPER_ADMIN || role === UserRole.RESTAURANT_OWNER;
}

export function canManageFarms(role: UserRole | string | undefined) {
  return role === UserRole.SUPER_ADMIN || role === UserRole.FARM_OWNER;
}

export type DashboardSectionId =
  | "overview"
  | "cities"
  | "home_slider"
  | "tourism_places"
  | "garages"
  | "vehicles"
  | "trips"
  | "bookings"
  | "hotels"
  | "hotel_rooms"
  | "hotel_bookings"
  | "restaurants"
  | "restaurant_bookings"
  | "farms"
  | "farm_bookings"
  | "passenger_garages"
  | "passenger_trips"
  | "passenger_tourism_places"
  | "passenger_hotels"
  | "passenger_restaurants"
  | "passenger_farms"
  | "tourism_place_requests";

export function dashboardSectionsForRole(
  role: UserRole | string | undefined
): DashboardSectionId[] {
  const base: DashboardSectionId[] = ["overview"];
  if (!role) return base;
  if (role === UserRole.SUPER_ADMIN) {
    return [
      "overview",
      "cities",
      "home_slider",
      "tourism_places",
      "garages",
      "vehicles",
      "trips",
      "hotels",
      "restaurants",
      "farms",
      "bookings",
      "tourism_place_requests",
    ];
  }
  if (role === UserRole.TOURISM_OWNER) {
    return ["overview", "tourism_places", "bookings"];
  }
  if (role === UserRole.HOTEL_OWNER) {
    return ["overview", "hotels", "hotel_rooms", "hotel_bookings"];
  }
  if (role === UserRole.RESTAURANT_OWNER) {
    return ["overview", "restaurants", "restaurant_bookings"];
  }
  if (role === UserRole.FARM_OWNER) {
    return ["overview", "farms", "farm_bookings"];
  }
  if (role === UserRole.GARAGE_OWNER) {
    return ["overview", "garages", "vehicles", "trips", "bookings"];
  }
  if (role === UserRole.DRIVER) {
    return ["overview", "garages", "vehicles", "trips"];
  }
  if (role === UserRole.USER) {
    return [
      "overview",
      "passenger_garages",
      "passenger_trips",
      "passenger_tourism_places",
      "passenger_hotels",
      "passenger_restaurants",
      "passenger_farms",
      "bookings",
    ];
  }
  return [...base, "bookings"];
}
