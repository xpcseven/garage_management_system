import { apiOk, getBaseUrl, handleOptions } from "@/lib/api/http";

export function OPTIONS() {
  return handleOptions();
}

export async function GET(req: Request) {
  const base = getBaseUrl(req);
  return apiOk({
    version: "v1",
    baseUrl: `${base}/api/v1`,
    auth: {
      login: "POST /auth/login",
      refresh: "POST /auth/refresh",
      logout: "POST /auth/logout",
      me: "GET /auth/me",
    },
    public: {
      slider: "GET /public/slider",
      tourismPlaces: "GET /public/tourism-places",
      tourismPlaceCards: "GET /public/tourism-places/cards?limit=6",
      tourismPlace: "GET /public/tourism-places/:placeId",
      cities: "GET /public/cities",
    },
    passenger: {
      garages: "GET /garages",
      garage: "GET /garages/:garageId",
      garageTrips: "GET /garages/:garageId/trips",
      tripsSearch: "GET /trips/search?fromCityId=&toCityId=&q=&scope=",
      tripsFreelance: "GET /trips/freelance",
      tripSeats: "GET /trips/:tripId/seats",
      tourismPrograms: "GET /tourism-programs",
      bookings: "GET /bookings",
      bookTrip: "POST /bookings/trip",
      bookProgram: "POST /bookings/tourism-program",
      cancelBooking: "DELETE /bookings/:bookingId",
    },
    health: "GET /health",
    docs: `${base}/docs/API.md`,
  });
}
