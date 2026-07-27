import { Metadata } from "next";
import RwaDashboard from "@/components/rwa/RwaDashboard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ societyId: string }>;
}): Promise<Metadata> {
  const { societyId } = await params;
  return {
    title: `RWA Admin Portal | Lokul`,
    description: `Manage notices, visitors, polls and members for your society on Lokul.`,
    robots: { index: false, follow: false }, // admin page — no indexing
    openGraph: {
      title: "Lokul RWA Admin Portal",
      url: `https://lokul.club/rwa/${societyId}`,
    },
  };
}

export default async function RwaPage({
  params,
}: Readonly<{
  params: Promise<{ societyId: string }>;
}>) {
  const { societyId } = await params;
  return <RwaDashboard societyId={societyId} />;
}
