import Link from "next/link";
import { HealthCheckButton } from "@/components/HealthCheckButton";

export default function Home() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Faith Laundry Shop</h1>
      <p className="mt-2 text-slate-600">Order management and tracking</p>
      <div className="mt-6 flex flex-wrap gap-4">
        <Link
          href="/orders/new"
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          New Order
        </Link>
        <Link
          href="/orders"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
        >
          View Orders
        </Link>
        <Link
          href="/track"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
        >
          Track Order
        </Link>
        <Link
          href="/reports"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
        >
          Daily Report
        </Link>
      </div>
      <div className="mt-8">
        <HealthCheckButton />
      </div>
    </div>
  );
}
