import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { UI_LABELS } from "@/constants/ui";
import { ErrorState } from "@/features/shared";
import { useAddOnCatalog } from "@/hooks/useAddOnCatalog";
import { AddOnCatalogResponse } from "@/lib/api/addOnCatalog";
import { Edit3, Loader2, Plus, Tag } from "lucide-react";
import { useState } from "react";
import { AddOnCatalogModal } from "./AddOnCatalogModal";

export function AddOnCatalogList() {
  const { data: addOns, isLoading, error, refetch } = useAddOnCatalog(false);
  const [selectedAddOn, setSelectedAddOn] = useState<AddOnCatalogResponse | null | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isLoading) {
    return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-brand-blue w-8 h-8" /></div>;
  }

  if (error) {
    return <ErrorState error={(error as Error).message} reset={() => refetch()} />;
  }

  return (
    <div className="space-y-grid-8 mt-10">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black uppercase text-slate-800 tracking-tight">{UI_LABELS.modules.rates.ADD_ON_CATALOG}</h3>
        <Button
          onClick={() => {
            setSelectedAddOn(null);
            setIsModalOpen(true);
          }}
          className="bg-brand-blue text-white"
        >
          <Plus className="w-4 h-4 mr-2" /> {UI_LABELS.modules.rates.ADD_ITEM}
        </Button>
      </div>

      <div className="grid gap-grid-6 md:grid-cols-2">
        {addOns?.map((addon) => (
          <Card key={addon.id} className="overflow-hidden group border-slate-200/60 hover:shadow-lg transition-all rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between p-6 bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                  <Tag className="w-6 h-6 text-brand-blue" />
                </div>
                <div>
                  <CardTitle className="text-lg font-black">{addon.name}</CardTitle>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${addon.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {addon.isActive ? UI_LABELS.shared.common.ACTIVE : UI_LABELS.shared.common.INACTIVE}
                  </span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => { setSelectedAddOn(addon); setIsModalOpen(true); }}>
                <Edit3 className="w-4 h-4 mr-2" /> {UI_LABELS.shared.buttons.EDIT}
              </Button>
            </CardHeader>
            <CardContent className="p-6 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{UI_LABELS.modules.rates.DEFAULT_PRICE}</span>
              <CurrencyDisplay amount={addon.defaultPrice} className="text-2xl font-black" />
            </CardContent>
          </Card>
        ))}
        {addOns?.length === 0 ? (
          <p className="text-slate-400 text-sm font-bold p-6">{UI_LABELS.modules.rates.NO_ADD_ONS_FOUND}</p>
        ) : null}
      </div>

      <AddOnCatalogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        addOn={selectedAddOn}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
