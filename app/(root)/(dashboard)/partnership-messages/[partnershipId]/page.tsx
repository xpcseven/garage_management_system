import { notFound } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { getPartnershipThread } from "@/lib/actions/partnership-message.actions";
import PartnershipChat from "@/components/partnership/PartnershipChat";
import UnAuthorized from "@/components/UnAuthorized";

type Props = { params: { partnershipId: string } };

export default async function PartnershipMessageThreadPage({ params }: Props) {
  const user = await currentUser();
  if (!user) return <UnAuthorized />;

  const thread = await getPartnershipThread(params.partnershipId);
  if (!thread) notFound();

  return (
    <PartnershipChat
      partnershipId={thread.partnershipId}
      garageName={thread.garageName}
      partnerName={thread.partnerName}
      partnerType={thread.partnerType}
      messages={thread.messages}
    />
  );
}
