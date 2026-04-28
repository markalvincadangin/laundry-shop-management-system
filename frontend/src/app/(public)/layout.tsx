import { UI_LABELS } from "@/constants/ui";
import { MeshBackground } from "@/components/ui";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-neutral-50 overflow-x-hidden flex flex-col selection:bg-brand-blue/10 selection:text-brand-blue">
      {/* Subtle Ambient Layer */}
      <MeshBackground />
      
      <main className="relative z-10 w-full flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
