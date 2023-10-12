import { devToolsProtocolsByVersionSlug } from "@/data/protocols";
import { redirect } from "next/navigation";

export default async function Page() {
  const firstVersionSlug = devToolsProtocolsByVersionSlug.keys().next().value;
  return redirect(`/devtools-protocol/${encodeURIComponent(firstVersionSlug)}`);
}
