/* eslint-disable react/jsx-no-literals */
"use client";

import { MessageSquare, Hammer } from "lucide-react";
import { UI_LABELS } from "@/constants/ui";
import { PageHeader } from "@/components/layout";
import { motion } from "framer-motion";
import { KPICard } from "@/components/ui";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";

export default function MessagingPage() {
  return (
    <div className="max-w-[1600px] mx-auto space-y-grid-12 pb-grid-20 px-4 xl:px-0">
      <PageHeader
        variant="premium"
        title={UI_LABELS.modules.clientAlerts.TITLE}
        subtitle={UI_LABELS.modules.clientAlerts.SUBTITLE}
        icon={MessageSquare}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-grid-6" data-testid="messaging-kpi-grid">
        <KPICard 
          title="Messages Sent" 
          value={0} 
          subtitle="Today" 
          icon={Send}
        />
        <KPICard 
          title="Delivered" 
          value={0} 
          subtitle="Successfully received" 
          icon={CheckCircle2}
          variant="success"
        />
        <KPICard 
          title="Failed" 
          value={0} 
          subtitle="Delivery issues" 
          icon={AlertCircle}
          variant="accent"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col items-center justify-center p-12 lg:p-24 bg-white rounded-3xl border border-slate-200/60 shadow-sm"
      >
        <div className="h-24 w-24 rounded-full bg-slate-50 flex items-center justify-center mb-6">
          <Hammer className="h-10 w-10 text-slate-300" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">{UI_LABELS.dynamic.COMING_SOON}</h2>
        <p className="text-slate-500 text-center max-w-md font-medium leading-relaxed">
          The Messaging feature is currently under active development. 
          Soon, you&apos;ll be able to send automated SMS notifications to customers when their laundry is ready for pickup.
        </p>
      </motion.div>
    </div>
  );
}
