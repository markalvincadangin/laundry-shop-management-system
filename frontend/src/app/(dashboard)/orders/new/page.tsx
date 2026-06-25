"use client";

import { ClipboardList, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { IntakeWizard } from "@/components/features/orders/IntakeWizard";
import { PageHeader } from "@/components/layout";
import { UI_LABELS } from "@/constants/ui";
import { useAuth } from "@/stores/auth-store";
import { LoadingState } from "@/features/shared";

export default function NewOrderPage() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingState fullPage />;

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="flex items-center gap-6 mb-8">
        <Link 
          href="/orders" 
          className="h-12 w-12 flex items-center justify-center hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-brand-blue border border-slate-100"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <PageHeader 
          title={UI_LABELS.modules.orders.CREATE_TITLE}
          subtitle="Process a new service request for a customer."
          icon={ClipboardList}
        />
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 lg:p-12">
          <IntakeWizard createdByUserId={user?.userId || ""} isModal={false} />
        </div>
      </div>
    </div>
  );
}
