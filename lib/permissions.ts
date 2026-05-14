import { UserRole } from "@/prisma/UserRole.enum";

export function canManageCities(role: UserRole | string | undefined) {
  return role === UserRole.SUPER_ADMIN;
}

export function canManageHomeSlider(role: UserRole | string | undefined) {
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

/** إدارة الأماكن السياحية (حالياً: المشرف العام فقط) */
export function canManageTourismPlaces(role: UserRole | string | undefined) {
  return (
    role === UserRole.SUPER_ADMIN ||
    role === UserRole.TOURISM_OWNER ||
    role === UserRole.GARAGE_OWNER
  );
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
  | "passenger_garages"
  | "passenger_trips"
  | "passenger_tourism_places"
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
      "bookings",
      "tourism_place_requests",
    ];
  }
  if (role === UserRole.TOURISM_OWNER) {
    return ["overview", "tourism_places", "bookings"];
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
      "bookings",
    ];
  }
  return [...base, "bookings"];
}
