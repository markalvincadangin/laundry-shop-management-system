"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Search, UserPlus, Trash2, Plus, Calculator, ChevronRight } from "lucide-react";

import { ordersService } from "@/services/orders.service";
import { paymentsService } from "@/services/payments.service";
import { PaymentMethod } from "@/constants/order-status";
import { Card, CardContent, Input, Button, Select } from "@/components/ui";
import { UI_LABELS } from "@/constants/ui";
import { usePriceCalculation } from "@/hooks/usePriceCalculation";
import { useCustomerLookup } from "@/hooks/useCustomerLookup";
import { SERVICE_TYPES, type ServiceDefinition } from "@/constants/service-types";
import { OrderIntakeSchema, type OrderIntakeInput } from "@/lib/validators";
import { OrderIntakeFormProps } from "@/types/components";

/**
 * OrderIntakeForm: Canonical form for creating new laundry orders.
 * Hardened with Phase 3 Zod validation and React Hook Form.
 * Adheres to FRONT-002 §8.6.
 */
export function OrderIntakeForm({ staffUserId, onSuccess, isModal }: OrderIntakeFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [collectPaymentNow, setCollectPaymentNow] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [referenceNumber, setReferenceNumber] = useState("");

  // --- Phase 3: Form Initialization ---
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    resetField,
    formState: { errors }
  } = useForm<OrderIntakeInput>({
    resolver: zodResolver(OrderIntakeSchema),
    defaultValues: {
      staffUserId: staffUserId || "",
      serviceType: "WASH_DRY_FOLD",
      weightKg: 0,
      extraMinutes: 0,
      initialAddOns: [],
    }
  });

  // Watch values for price calculation
  const weightKg = watch("weightKg");
  const extraMinutes = watch("extraMinutes");
  const addOns = watch("initialAddOns") || [];
  const serviceType = watch("serviceType");

  // --- Phase 2 Hooks: Modular Logic ---
  const customerLookup = useCustomerLookup();
  const pricing = usePriceCalculation({ 
    weightKg: String(weightKg), 
    extraMinutes: String(extraMinutes), 
    addOns 
  });

  const { selectById, selected, isRegistering } = customerLookup;

  // Handle customerId from URL (§10)
  useEffect(() => {
    const customerId = searchParams.get("customerId");
    if (customerId && !selected && !isRegistering) {
      selectById(Number(customerId));
    }
  }, [searchParams, selectById, selected, isRegistering]);

  // Sync customer lookup with form state
  useEffect(() => {
    if (customerLookup.selected) {
      setValue("customerId", customerLookup.selected.id);
      setValue("customer", undefined);
    } else if (customerLookup.isRegistering) {
      setValue("customerId", undefined);
    } else {
      setValue("customerId", undefined);
      setValue("customer", undefined);
    }
  }, [customerLookup.selected, customerLookup.isRegistering, setValue]);

  // --- Logic: Submit ---
  const onSubmit = async (data: OrderIntakeInput) => {
    if (!staffUserId) {
      toast.error(UI_LABELS.feedback.error.AUTH_REQUIRED);
      return;
    }

    setLoading(true);
    try {
      const order = await ordersService.create(data);
      
      if (collectPaymentNow && pricing.preview?.grandTotal) {
        await paymentsService.create({
          orderId: order.id,
          amountPaid: pricing.preview.grandTotal,
          paymentMethod: paymentMethod,
          receivedByUserId: staffUserId
        });
      }

      toast.success(UI_LABELS.feedback.success.ORDER_SAVED, {
        description: `${UI_LABELS.shared.common.ORDER_NUMBER} ${order.referenceNumber}`,
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/orders/${order.id}`);
      }
    } catch (error: any) {
      toast.error(error.message || UI_LABELS.feedback.error.GENERIC);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddOn = (e: React.MouseEvent) => {
    e.preventDefault();
    const nameInput = document.getElementById("addon-name") as HTMLInputElement;
    const priceInput = document.getElementById("addon-price") as HTMLInputElement;
    
    if (nameInput?.value && priceInput?.value) {
      const newAddOn = { 
        name: nameInput.value, 
        price: parseFloat(priceInput.value), 
        quantity: 1 
      };
      setValue("initialAddOns", [...addOns, newAddOn]);
      nameInput.value = "";
      priceInput.value = "";
    }
  };

  const removeAddOn = (index: number) => {
    setValue("initialAddOns", addOns.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`grid grid-cols-1 ${isModal ? "gap-6" : "lg:grid-cols-12 gap-8"} items-start`}>

      {/* Left Column: Intake Details */}
      <div className={`${isModal ? "col-span-1" : "lg:col-span-8"} space-y-6`}>

        {/* Section: Customer Identification */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-1 bg-brand-blue rounded-full" />
            <h2 className="text-xl font-display font-extrabold text-slate-900">{UI_LABELS.forms.intake.CUSTOMER_SECTION}</h2>
          </div>

          <Card className="border-slate-200 bg-white shadow-sm overflow-visible">
            <CardContent className="p-6">
              {!customerLookup.isRegistering && !customerLookup.selected ? (
                <div className="relative">
                  <Input
                    label={UI_LABELS.forms.intake.SEARCH_LABEL}
                    placeholder={UI_LABELS.forms.intake.SEARCH_PLACEHOLDER}
                    value={customerLookup.search}
                    onChange={(e) => customerLookup.setSearch(e.target.value)}
                    autoComplete="off"
                    icon={<Search className="h-4 w-4 text-brand-blue" />}
                    error={errors.customerId?.message}
                    className="h-14 rounded-xl border-slate-200"
                  />
                  {customerLookup.results.length > 0 && (
                    <div className="absolute z-20 w-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2">
                      {customerLookup.results.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => customerLookup.select(c)}
                          className="w-full flex items-center justify-between px-4 py-4 text-sm text-left hover:bg-slate-50 transition-colors group min-h-[44px]"
                        >
                          <div>
                            <span className="font-bold text-slate-900">{c.firstName} {c.lastName}</span>
                            <span className="block text-xs text-slate-500">{c.contactNumber}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-brand-blue" />
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => customerLookup.setIsRegistering(true)}
                    className="mt-4 flex items-center gap-2 text-xs font-extrabold text-brand-blue hover:text-brand-blue/80 transition-colors uppercase tracking-widest min-h-[44px]"
                  >
                    <UserPlus className="h-4 w-4" />
                    {UI_LABELS.modules.customers.REGISTER_NEW}
                  </button>
                </div>
              ) : customerLookup.selected ? (
                <div className="flex items-center justify-between bg-brand-blue/5 rounded-xl p-5 border border-brand-blue/10">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-blue to-brand-cyan-dark flex items-center justify-center font-bold text-white shadow-md">
                      {customerLookup.selected.firstName[0]}{customerLookup.selected.lastName[0]}
                    </div>
                    <div>
                      <span className="text-base font-bold text-slate-900">{customerLookup.selected.firstName} {customerLookup.selected.lastName}</span>
                      <span className="block text-xs font-bold tracking-widest text-slate-500 uppercase mt-0.5">{customerLookup.selected.contactNumber}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      customerLookup.clear();
                      setValue("customerId", undefined);
                    }}
                    className="text-xs font-bold text-brand-blue hover:text-brand-blue/80 transition-colors uppercase tracking-widest min-h-[44px] px-4"
                  >
                    {UI_LABELS.shared.buttons.CHANGE}
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      label={UI_LABELS.forms.intake.FIRST_NAME} 
                      {...register("customer.firstName")}
                      error={errors.customer?.firstName?.message}
                      className="border-slate-200"
                    />
                    <Input 
                      label={UI_LABELS.forms.intake.LAST_NAME} 
                      {...register("customer.lastName")}
                      error={errors.customer?.lastName?.message}
                      className="border-slate-200"
                    />
                  </div>
                  <Input
                    label={UI_LABELS.forms.intake.CONTACT}
                    placeholder={UI_LABELS.shared.common.CONTACT_PLACEHOLDER}
                    {...register("customer.contactNumber")}
                    error={errors.customer?.contactNumber?.message}
                    className="border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => { 
                      customerLookup.setIsRegistering(false); 
                      setValue("customer", undefined);
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-slate-900 min-h-[44px] uppercase tracking-widest"
                  >
                    {UI_LABELS.forms.intake.BACK_TO_SEARCH}
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Section: Specifications */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-1 bg-brand-blue rounded-full" />
            <h2 className="text-xl font-display font-extrabold text-slate-900">{UI_LABELS.shared.common.DETAILS}</h2>
          </div>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Select
                  label={UI_LABELS.shared.common.SERVICE}
                  {...register("serviceType")}
                  containerClassName="md:col-span-1"
                  error={errors.serviceType?.message}
                  className="border-slate-200 h-14"
                >
                  {(Object.values(SERVICE_TYPES) as ServiceDefinition[]).map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </Select>
                <Input
                  label={UI_LABELS.shared.units.WEIGHT}
                  type="number"
                  step="0.01"
                  {...register("weightKg", { valueAsNumber: true })}
                  error={errors.weightKg?.message}
                  hint={weightKg > 0 ? `${Math.ceil(Number(weightKg) / 8)} ${UI_LABELS.shared.units.LOADS} x ${UI_LABELS.shared.units.PRICE_SYMBOL}120` : UI_LABELS.forms.intake.WEIGHT_HINT}
                  className="border-slate-200 h-14"
                />
                <div className="space-y-2">
                  <Input
                    label={UI_LABELS.shared.common.EXTRA_TIME}
                    type="number"
                    {...register("extraMinutes", { valueAsNumber: true })}
                    error={errors.extraMinutes?.message}
                    className="border-slate-200 h-14"
                  />
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-widest block mt-1 ml-1">
                    {Number(weightKg) > 0
                      ? `Est. Cycle: ${Math.ceil(Number(weightKg) / 8) * 45} mins`
                      : UI_LABELS.forms.intake.EXTRA_TIME_HINT
                    }
                  </div>
                </div>
              </div>

              {/* Add-ons */}
              <div className="pt-6 border-t border-slate-100">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 block">{UI_LABELS.modules.orders.ADD_ONS}</label>
                <div className="flex gap-3">
                  <Input id="addon-name" placeholder={UI_LABELS.forms.intake.ADD_ON_NAME} className="flex-[2] border-slate-200 h-14" />
                  <Input id="addon-price" type="number" placeholder={UI_LABELS.shared.units.PRICE} className="flex-1 border-slate-200 h-14" />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddAddOn}
                    className="h-14 w-14 rounded-xl border-slate-200 shadow-sm"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>

                {addOns.length > 0 && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addOns.map((a, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200 group">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">{a.name}</span>
                          <span className="text-xs font-medium text-slate-500">{UI_LABELS.shared.units.PRICE_SYMBOL}{Number(a.price).toFixed(2)}</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => removeAddOn(i)} 
                          className="h-9 w-9 flex items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Right Column: Pricing & Actions */}
      <div className={`${isModal ? "col-span-1" : "lg:col-span-4 sticky top-8"} space-y-6`}>
        <Card className="border-brand-blue/20 bg-white shadow-xl overflow-hidden">
          <div className="p-6 bg-brand-blue/5 border-b border-brand-blue/10 flex items-center gap-3">
            <Calculator className="h-5 w-5 text-brand-blue" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">{UI_LABELS.forms.intake.PRICING_SUMMARY}</h3>
          </div>
          <CardContent className="p-6">
            {pricing.loading ? (
              <div className="py-12 flex flex-col items-center gap-4 text-slate-500">
                <div className="h-10 w-10 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-medium animate-pulse">{UI_LABELS.shared.common.CALCULATING}</span>
              </div>
            ) : pricing.preview ? (
              <div className="space-y-4 animate-in fade-in duration-500">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">{UI_LABELS.shared.common.BASE_PRICE} ({pricing.preview.totalLoads} {UI_LABELS.shared.units.LOADS})</span>
                  <span className="text-slate-900 font-mono font-bold">{UI_LABELS.shared.units.PRICE_SYMBOL}{pricing.preview.baseAmount?.toFixed(2)}</span>
                </div>
                {(pricing.preview.extraMinutesAmount ?? 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">{UI_LABELS.shared.common.EXTRA_TIME}</span>
                    <span className="text-slate-900 font-mono font-bold">{UI_LABELS.shared.units.PRICE_SYMBOL}{pricing.preview.extraMinutesAmount?.toFixed(2)}</span>
                  </div>
                )}
                {(pricing.preview.addonsTotalAmount ?? 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">{UI_LABELS.modules.orders.ADD_ONS}</span>
                    <span className="text-slate-900 font-mono font-bold">{UI_LABELS.shared.units.PRICE_SYMBOL}{pricing.preview.addonsTotalAmount?.toFixed(2)}</span>
                  </div>
                )}

                <div className="pt-5 mt-5 border-t border-dashed border-slate-200">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{UI_LABELS.shared.common.TOTAL}</span>
                    <span className="text-4xl font-display font-black text-slate-900 tracking-tight">{UI_LABELS.shared.units.PRICE_SYMBOL}{pricing.preview.grandTotal?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center gap-4 text-center text-slate-300">
                <Calculator className="h-12 w-12 opacity-20" />
                <p className="text-xs font-medium leading-relaxed">{UI_LABELS.forms.intake.EMPTY_PRICING}</p>
              </div>
            )}
          </CardContent>
          <div className="p-6 pt-0 space-y-5">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded border-slate-300 text-brand-blue focus:ring-brand-blue"
                  checked={collectPaymentNow}
                  onChange={(e) => setCollectPaymentNow(e.target.checked)}
                />
                <span className="text-sm font-bold text-slate-900 tracking-tight">{UI_LABELS.forms.intake.COLLECT_PAYMENT}</span>
              </label>

              {collectPaymentNow && (
                <div className="pt-3 space-y-3 border-t border-slate-200 animate-in fade-in slide-in-from-top-2">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">{UI_LABELS.forms.checkout.METHOD}</label>
                    <div className="flex gap-2">
                      {["CASH", "GCASH", "BANK_TRANSFER"].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setPaymentMethod(m as PaymentMethod)}
                          className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg border transition-all ${
                            paymentMethod === m 
                              ? "bg-brand-blue/10 border-brand-blue text-brand-blue" 
                              : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          {m.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {paymentMethod !== "CASH" && (
                    <Input
                      label={UI_LABELS.shared.common.REFERENCE}
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      placeholder={UI_LABELS.shared.common.REF_PLACEHOLDER}
                      className="bg-white h-12"
                      required
                    />
                  )}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-16 text-lg font-extrabold bg-brand-blue hover:bg-brand-blue/90 shadow-lg shadow-brand-blue/20 uppercase tracking-widest"
              isLoading={loading}
              disabled={!pricing.preview || loading}
            >
              {UI_LABELS.forms.intake.SUBMIT_BUTTON}
            </Button>
            <p className="text-xs text-center text-slate-400 px-4 font-medium italic">
              {UI_LABELS.forms.intake.VERIFY_WEIGHT}
            </p>
          </div>
        </Card>
      </div>
    </form>
  );
}

