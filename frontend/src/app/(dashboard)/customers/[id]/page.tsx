import CustomerDetailClient from "./client";

export function generateStaticParams() {
  return [{ id: 'fallback' }];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <CustomerDetailClient />;
}
