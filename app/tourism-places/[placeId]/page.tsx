import { notFound } from "next/navigation";
import { getPublicTourismPlaceByIdForGuest } from "@/lib/actions/tourism_places.actions";
import LandingNav from "@/components/landing/LandingNav";
import LandingFooter from "@/components/landing/LandingFooter";
import PublicTourismPlaceDetail from "@/components/tourism-places-public/PublicTourismPlaceDetail";

type Props = {
  params: { placeId: string };
};

export default async function PublicTourismPlaceDetailPage({ params }: Props) {
  const place = await getPublicTourismPlaceByIdForGuest(params.placeId);
  if (!place) notFound();

  return (
    <main className="min-h-screen bg-mist text-dusk">
      <LandingNav />
      <PublicTourismPlaceDetail place={place} />
      <LandingFooter />
    </main>
  );
}
