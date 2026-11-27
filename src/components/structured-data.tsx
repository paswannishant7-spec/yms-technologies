import { structuredData } from "@/content/metadata";

export function StructuredData({ path }: { path: string }) {
  return structuredData(path).map((data) => <script key={String(data["@type"])} type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />);
}
