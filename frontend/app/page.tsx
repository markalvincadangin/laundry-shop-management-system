import { HealthCheckButton } from "@/components/HealthCheckButton";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold text-blue-600">Faith Laundry Shop</h1>
      <p className="mt-2 text-gray-600">Phase 7 — Frontend Skeleton</p>
      <div className="mt-6">
        <HealthCheckButton />
      </div>
    </main>
  );
}
