import { UserRole } from "@/prisma/UserRole.enum";

export function canManageCities(role: UserRole | string | undefined) {
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

export type DashboardSectionId =
  | "overview"
  | "cities"
  | "garages"
  | "vehicles"
  | "trips"
  | "bookings"
  | "passenger_garages"
  | "passenger_trips";

export function dashboardSectionsForRole(
  role: UserRole | string | undefined
): DashboardSectionId[] {
  const base: DashboardSectionId[] = ["overview"];
  if (!role) return base;
  if (role === UserRole.SUPER_ADMIN) {
    return [
      "overview",
      "cities",
      "garages",
      "vehicles",
      "trips",
      "bookings",
    ];
  }
  if (role === UserRole.GARAGE_OWNER) {
    return ["overview", "garages", "vehicles", "trips", "bookings"];
  }
  if (role === UserRole.DRIVER) {
    return ["overview", "garages", "vehicles", "trips"];
  }
  if (role === UserRole.USER) {
    return ["overview", "passenger_garages", "passenger_trips", "bookings"];
  }
  return [...base, "bookings"];
}
