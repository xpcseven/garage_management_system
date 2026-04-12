"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/prisma/UserRole.enum";

export type DashboardSnapshot = {
  garages: number;
  vehicles: number;
  tripsActive: number;
  bookingsPending: number;
  /** صاحب كراج: يوجد كراج ومركبات فيه لكن لا رحلة مجدولة بعد */
  showGarageOwnerTripReminder?: boolean;
};

export async function getDashboardSnapshot(): Promise<DashboardSnapshot | null> {
  const session = await auth();
  if (!session?.user) return null;

  const role = session.user.role;
  const userId = session.user.id;

  if (role === UserRole.SUPER_ADMIN) {
    const [garages, vehicles, tripsActive, bookingsPending] = await Promise.all([
      prisma.garage.count({ where: { isDeleted: false } }),
      prisma.vehicle.count(),
      prisma.trip.count({
        where: { status: { in: ["SCHEDULED", "IN_PROGRESS"] } },
      }),
      prisma.booking.count({ where: { status: "PENDING" } }),
    ]);
    return { garages, vehicles, tripsActive, bookingsPending };
  }

  if (role === UserRole.GARAGE_OWNER) {
    const garageIds = (
      await prisma.garage.findMany({
        where: { ownerId: userId, isDeleted: false },
        select: { id: true },
      })
    ).map((g) => g.id);

    const vehicles = await prisma.vehicle.count({
      where: {
        OR: [
          { ownerId: userId },
          ...(garageIds.length ? [{ garageId: { in: garageIds } }] : []),
        ],
      },
    });

    const tripsActive =
      garageIds.length === 0
        ? 0
        : await prisma.trip.count({
            where: {
              garageId: { in: garageIds },
              status: { in: ["SCHEDULED", "IN_PROGRESS"] },
            },
          });

    const bookingsPending =
      garageIds.length === 0
        ? 0
        : await prisma.booking.count({
            where: {
              status: "PENDING",
              trip: { garageId: { in: garageIds } },
            },
          });

    const fleetInGarages =
      garageIds.length === 0
        ? 0
        : await prisma.vehicle.count({
            where: {
              garageId: { in: garageIds },
              isActive: true,
            },
          });

    const garages = garageIds.length;
    const showGarageOwnerTripReminder =
      garages > 0 && fleetInGarages > 0 && tripsActive === 0;

    return {
      garages,
      vehicles,
      tripsActive,
      bookingsPending,
      showGarageOwnerTripReminder,
    };
  }

  if (role === UserRole.DRIVER) {
    const [vehicles, tripsActive] = await Promise.all([
      prisma.vehicle.count({ where: { ownerId: userId } }),
      prisma.trip.count({
        where: {
          driverId: userId,
          status: { in: ["SCHEDULED", "IN_PROGRESS"] },
        },
      }),
    ]);
    return {
      garages: 0,
      vehicles,
      tripsActive,
      bookingsPending: 0,
    };
  }

  if (role === UserRole.USER) {
    const [bookingsPending, openTrips, garageCount] = await Promise.all([
      prisma.booking.count({
        where: { userId, status: "PENDING" },
      }),
      prisma.trip.count({
        where: {
          status: "SCHEDULED",
          availableSeats: { gt: 0 },
          departureTime: { gte: new Date() },
        },
      }),
      prisma.garage.count({ where: { isDeleted: false, isActive: true } }),
    ]);
    return {
      garages: garageCount,
      vehicles: 0,
      tripsActive: openTrips,
      bookingsPending,
    };
  }

  return {
    garages: 0,
    vehicles: 0,
    tripsActive: 0,
    bookingsPending: 0,
  };
}
