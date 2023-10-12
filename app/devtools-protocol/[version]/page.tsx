import { devToolsProtocolsByVersionSlug } from "@/data/protocols";
import { redirect } from "next/navigation";

export default async function Page({
  params: { version },
}) {
  const protocol = devToolsProtocolsByVersionSlug.get(version)!;
  const firstDomain = protocol.protocol.domains[0];
  return redirect(`/devtools-protocol/${encodeURIComponent(version)}/${encodeURIComponent(firstDomain.domain)}`);
}
