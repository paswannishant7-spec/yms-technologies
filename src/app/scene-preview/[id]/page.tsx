import { notFound } from "next/navigation";
import SceneView from "@/components/scene-view";
import { scenes } from "@/content/scenes";

export const metadata = { robots: { index: false, follow: false } };

export default async function ScenePreview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scene = scenes.find((entry) => entry.id === id);
  if (process.env.NODE_ENV !== "development" || !scene) notFound();
  return <div className="scene-capture"><SceneView id={scene.id} capture /></div>;
}
