import { UserRole } from "@/prisma/UserRole.enum";

/** تسمية الصلاحية بالعربية */
export function roleLabelAr(role: string): string {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return "مشرف عام";
    case UserRole.GARAGE_OWNER:
      return "صاحب شركة سياحية";
    case UserRole.DRIVER:
      return "سائق";
    case UserRole.TOURISM_OWNER:
      return "صاحب مكان سياحي";
    case UserRole.HOTEL_OWNER:
      return "صاحب فندق";
    case UserRole.RESTAURANT_OWNER:
      return "صاحب مطعم";
    case UserRole.FARM_OWNER:
      return "صاحب مزرعة";
    case UserRole.USER:
      return "مسافر";
    default:
      return role;
  }
}
