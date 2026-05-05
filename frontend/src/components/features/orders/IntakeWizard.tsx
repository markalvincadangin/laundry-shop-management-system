"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Search,
  UserPlus,
  Trash2,
  Plus,
  Calculator,
  ChevronRight,
  Package,
  ShieldCheck,
  ArrowRight,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { ordersService } from "@/services/orders.service";
import { paymentsService } from "@/services/payments.service";
import { PaymentMethod } from "@/constants/order-status";
import { Card, CardContent, Input, Button, Select } from "@/components/ui";
import { UI_LABELS } from "@/constants/ui";
import { usePriceCalculation } from "@/hooks/usePriceCalculation";
import { useCustomerLookup } from "@/hooks/useCustomerLookup";
import { useRates } from "@/hooks/useRates";
import { SERVICE_TYPES, type ServiceDefinition } from "@/constants/service-types";
import { OrderIntakeSchema, type OrderIntakeInput } from "@/lib/validators";
import { OrderIntakeFormProps } from "@/types/components";
import { ClaimStub } from "./ClaimStub";
import { LiveTicket } from "./LiveTicket";
import { OrderResponse } from "@/services/orders.service";
import { ProcessStepper } from "@/components/features/shared/ProcessStepper";

type IntakeStep = "CUSTOMER" | "SERVICE" | "ADDONS" | "CONFIRM";

export function IntakeWizard({ staffUserId, onSuccess, isModal }: OrderIntakeFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<IntakeStep>("CUSTOMER");
  const [collectPaymentNow, setCollectPaymentNow] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [isClaimStubOpen, setIsClaimStubOpen] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<OrderResponse | null>(null);
  const [canSubmit, setCanSubmit] = useState(false); // Debounce for final step
  const [tempAddOnName, setTempAddOnName] = useState("");
  const [tempAddOnPrice, setTempAddOnPrice] = useState("");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    watch,
    trigger,
    reset,
    formState: { errors }
  } = useForm<OrderIntakeInput>({
    resolver: zodResolver(OrderIntakeSchema),
    defaultValues: {
      staffUserId: staffUserId || "",
      serviceType: "WASH_DRY_FOLD",
      weightKg: 0,
      extraMinutes: 0,
      initialAddOns: [],
      customer: {
        firstName: "",
        lastName: "",
        contactNumber: ""
      }
    }
  });

  // Watch values
  const weightKg = watch("weightKg");

  // Sync staffUserId if it arrives late from context (§8.6)
  useEffect(() => {
    if (staffUserId) {
      setValue("staffUserId", staffUserId);
    }
  }, [staffUserId, setValue]);
  const extraMinutes = watch("extraMinutes");
  const addOns = watch("initialAddOns") || [];
  const serviceType = watch("serviceType");
  const customerId = watch("customerId");
  const customerInput = watch("customer");

  const { fields: addOnsFields, append: appendAddOn, remove: removeAddOnField } = useFieldArray({
    control,
    name: "initialAddOns"
  });

  const customerLookup = useCustomerLookup();
  const { rates } = useRates();
  const activeRate = rates.find(r => r.isActive) || { basePricePerLoad: 140, kgLimitPerLoad: 8 };

  const pricing = usePriceCalculation({
    weightKg: String(weightKg),
    extraMinutes: String(extraMinutes),
    addOns,
    serviceType
  });

  const { selectById, selected, isRegistering } = customerLookup;

  useEffect(() => {
    const cid = searchParams.get("customerId");
    if (cid && !selected && !isRegistering) {
      selectById(Number(cid));
    }
  }, [searchParams, selectById, selected, isRegistering]);

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

  const steps: IntakeStep[] = ["CUSTOMER", "SERVICE", "ADDONS", "CONFIRM"];
  const stepIndex = steps.indexOf(currentStep);

  const nextStep = async () => {
    let isValid = false;
    if (currentStep === "CUSTOMER") {
      isValid = !!(customerId || (customerInput?.firstName && customerInput?.lastName && customerInput?.contactNumber));
      if (!isValid) toast.error("Please select or register a customer");
    } else if (currentStep === "SERVICE") {
      isValid = await trigger(["serviceType", "weightKg"]);
    } else if (currentStep === "ADDONS") {
      isValid = true; // Add-ons are optional
    }

    if (isValid) {
      const next = steps[stepIndex + 1];
      setCurrentStep(next);

      // If moving to CONFIRM, add a small delay before allowing submission
      // to prevent accidental double-clicks from Step 3 (HCI Error Prevention)
      if (next === "CONFIRM") {
        setCanSubmit(false);
        setTimeout(() => setCanSubmit(true), 500);
      }
    }
  };

  const prevStep = () => {
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1]);
    }
  };

  const onSubmit = async (data: OrderIntakeInput) => {
    // Safety check: Only allow submission from the final step
    if (currentStep !== "CONFIRM") return;

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
        
        // Re-fetch the full order record to ensure payment status and final totals are captured
        const updatedOrder = await ordersService.getById(order.id);
        setCreatedOrder(updatedOrder);
      } else {
        setCreatedOrder(order);
      }

      toast.success(UI_LABELS.feedback.success.ORDER_SAVED, {
        description: `${UI_LABELS.shared.common.ORDER_NUMBER} ${order.referenceNumber}`,
      });

      setIsClaimStubOpen(true);
    } catch (error: any) {
      toast.error(error.message || UI_LABELS.feedback.error.GENERIC);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddOn = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (tempAddOnName && tempAddOnPrice) {
      appendAddOn({
        name: tempAddOnName,
        price: parseFloat(tempAddOnPrice),
        quantity: 1
      });
      
      // Reset local state
      setTempAddOnName("");
      setTempAddOnPrice("");
    }
  };

  const removeAddOn = (index: number) => {
    removeAddOnField(index);
  };

  return (
    <div className="max-w-[1600px] mx-auto min-h-[800px]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (currentStep !== "CONFIRM") {
              nextStep();
            }
          }
        }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start"
      >
        {/* ── LEFT AREA: UNIFIED STEPPER + FORM (HCI: Focused Workflow) ── */}
        <div className="lg:col-span-7 bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
          {/* Integrated Compact Stepper */}
          <div className="p-6 border-b border-slate-50 bg-slate-50/50">
            <div className="relative flex justify-between items-center max-w-xl mx-auto">
              {/* Progress Track */}
              <div className="absolute top-5 left-0 right-0 h-[2px] bg-slate-200/50 -z-10 mx-10" />
              <div 
                className="absolute top-5 left-0 h-[2px] bg-brand-blue transition-all duration-700 -z-10 ml-10" 
                style={{ width: `calc(${(stepIndex / (steps.length - 1)) * 100}% - 80px)` }}
              />

              {steps.map((step, i) => {
                const isActive = i === stepIndex;
                const isCompleted = i < stepIndex;
                const label = ["CLIENT", "SERVICE", "EXTRAS", "REVIEW"][i];
                
                return (
                  <div key={step} className="flex flex-col items-center gap-2 relative z-10">
                    <div 
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 border-2 ${
                        isActive 
                          ? "bg-brand-blue border-brand-blue text-white shadow-lg shadow-brand-blue/30 scale-105" 
                          : isCompleted 
                            ? "bg-emerald-500 border-emerald-500 text-white" 
                            : "bg-white border-slate-200 text-slate-300"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5 stroke-[3px]" />
                      ) : (
                        <span className="text-[10px] font-black">{i + 1}</span>
                      )}
                    </div>
                    <span className={`text-[8px] font-black tracking-[0.2em] uppercase transition-colors duration-300 ${
                      isActive ? "text-brand-blue" : "text-slate-400"
                    }`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content Area */}
          <div className="p-10 min-h-[500px]">
            <AnimatePresence mode="wait">
              {currentStep === "CUSTOMER" && (
                <motion.div
                  key="step-customer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="space-y-1">
                    <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight uppercase">Select Customer</h2>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Identify the customer for this service request.</p>
                  </div>

                  {!customerLookup.isRegistering && !customerLookup.selected ? (
                    <div className="space-y-6">
                      <div className="relative">
                        <Input
                          label="Find Customer"
                          placeholder="Search by name or contact..."
                          value={customerLookup.search}
                          onChange={(e) => customerLookup.setSearch(e.target.value)}
                          autoComplete="off"
                          icon={<Search className="h-5 w-5 text-brand-blue" />}
                          className="h-16 rounded-2xl border-slate-200 text-lg"
                        />
                        {customerLookup.results.length > 0 && (
                          <div className="absolute z-20 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden shadow-brand-blue/10">
                            {customerLookup.results.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => customerLookup.select(c)}
                                className="w-full flex items-center justify-between px-6 py-4 hover:bg-brand-blue/5 transition-colors group"
                              >
                                <div>
                                  <span className="font-black text-slate-900 uppercase tracking-tight">{c.firstName} {c.lastName}</span>
                                  <span className="block text-xs font-bold text-slate-400 mt-0.5">{c.contactNumber}</span>
                                </div>
                                <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-brand-blue group-hover:translate-x-1 transition-all" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-slate-100" />
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Or</span>
                        <div className="h-px flex-1 bg-slate-100" />
                      </div>

                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => customerLookup.setIsRegistering(true)}
                        className="w-full h-16 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 hover:border-brand-blue hover:text-brand-blue hover:bg-brand-blue/5 transition-all gap-3"
                      >
                        <UserPlus className="h-5 w-5" />
                        <span className="uppercase tracking-widest font-black text-xs">Register New Customer</span>
                      </Button>
                    </div>
                  ) : customerLookup.selected ? (
                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className="p-8 bg-brand-blue/5 rounded-3xl border-2 border-brand-blue/20 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-6 opacity-5">
                        <UserPlus className="h-32 w-32 -rotate-12" />
                      </div>
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="h-16 w-16 rounded-2xl bg-brand-blue text-white flex items-center justify-center text-xl font-black shadow-lg">
                            {customerLookup.selected.firstName[0]}{customerLookup.selected.lastName[0]}
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{customerLookup.selected.firstName} {customerLookup.selected.lastName}</h3>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{customerLookup.selected.contactNumber}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => customerLookup.clear()}
                          className="p-3 hover:bg-white rounded-xl transition-colors text-brand-blue font-black uppercase text-[10px] tracking-widest"
                        >
                          Change
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <Input label="First Name" {...register("customer.firstName")} error={errors.customer?.firstName?.message} className="h-14 rounded-xl" />
                        <Input label="Last Name" {...register("customer.lastName")} error={errors.customer?.lastName?.message} className="h-14 rounded-xl" />
                      </div>
                      <Input label="Contact Number" {...register("customer.contactNumber")} error={errors.customer?.contactNumber?.message} className="h-14 rounded-xl" />
                      <button
                        type="button"
                        onClick={() => customerLookup.setIsRegistering(false)}
                        className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors"
                      >
                        ← Back to search
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {currentStep === "SERVICE" && (
                <motion.div
                  key="step-service"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <div className="space-y-1">
                    <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight uppercase">Service Details</h2>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Configure the laundry parameters.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {Object.values(SERVICE_TYPES).map((service) => {
                      const Icon = service.icon;
                      const isSelected = serviceType === service.value;
                      return (
                        <button
                          key={service.value}
                          type="button"
                          onClick={() => setValue("serviceType", service.value)}
                          className={`relative flex flex-col items-center p-8 rounded-[2rem] border-2 transition-all duration-300 text-center group ${isSelected
                              ? "border-brand-blue bg-white shadow-2xl shadow-brand-blue/10 -translate-y-1"
                              : "border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-white"
                            }`}
                        >
                          {isSelected && (
                            <div className="absolute inset-0 rounded-[2rem] border-4 border-brand-blue/10 animate-pulse" />
                          )}
                          <div className={`p-4 rounded-2xl mb-5 transition-all duration-500 ${isSelected
                              ? "bg-brand-blue text-white shadow-xl shadow-brand-blue/30 rotate-3"
                              : "bg-white text-slate-400 border border-slate-100 group-hover:text-slate-600 group-hover:-rotate-3"
                            }`}>
                            <Icon className="h-7 w-7" />
                          </div>
                          <span className={`text-[11px] font-black uppercase tracking-[0.2em] mb-2 ${isSelected ? "text-brand-blue" : "text-slate-900"}`}>
                            {service.label}
                          </span>
                          <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight">
                            {service.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <Input
                      label="Weight (kg)"
                      type="number"
                      step="0.01"
                      {...register("weightKg", { valueAsNumber: true })}
                      error={errors.weightKg?.message}
                      className="h-16 rounded-2xl border-slate-200 text-xl font-black"
                    />
                    <div className="space-y-2">
                      <Input
                        label="Extra Drying (mins)"
                        type="number"
                        {...register("extraMinutes", { valueAsNumber: true })}
                        error={errors.extraMinutes?.message}
                        className="h-16 rounded-2xl border-slate-200 text-xl font-black"
                      />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        ₱{activeRate.basePricePerLoad} / {activeRate.kgLimitPerLoad}kg Load
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === "ADDONS" && (
                <motion.div
                  key="step-addons"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <div className="space-y-1">
                    <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight uppercase">Extras & Notes</h2>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Add consumables or special instructions.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <Input 
                        id="addon-name" 
                        value={tempAddOnName}
                        onChange={(e) => setTempAddOnName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddAddOn(e);
                        }}
                        placeholder="Item Name (e.g. Detergent)" 
                        className="flex-[2] h-14 rounded-xl border-slate-200" 
                      />
                      <Input 
                        id="addon-price" 
                        type="number" 
                        value={tempAddOnPrice}
                        onChange={(e) => setTempAddOnPrice(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddAddOn(e);
                        }}
                        placeholder="Price" 
                        className="flex-1 h-14 rounded-xl border-slate-200" 
                      />
                      <Button 
                        type="button" 
                        variant="secondary" 
                        onClick={handleAddAddOn} 
                        disabled={!tempAddOnName || !tempAddOnPrice}
                        className="h-14 w-14 rounded-xl shadow-sm"
                      >
                        <Plus className="h-6 w-6" />
                      </Button>
                    </div>

                    {addOnsFields.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in zoom-in-95">
                        {addOnsFields.map((field, i) => (
                          <div key={field.id} className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200 group">
                            <div>
                              <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{field.name}</span>
                              <span className="block text-xs font-bold text-brand-blue">₱{Number(field.price).toFixed(2)}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAddOn(i)}
                              className="h-8 w-8 flex items-center justify-center text-rose-600 hover:bg-rose-50 rounded-lg"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-6 border-t border-slate-100">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">Special Instructions</label>
                      <textarea
                        {...register("notes")}
                        placeholder="e.g. Separate whites, low heat drying..."
                        className="w-full min-h-[120px] rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-900 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all outline-none resize-none shadow-inner"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === "CONFIRM" && (
                <motion.div
                  key="step-confirm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <div className="space-y-1">
                    <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight uppercase">Review & Payment</h2>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Finalize the order and process payment.</p>
                  </div>

                  <div className="p-8 bg-slate-900 rounded-3xl text-white space-y-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Calculator className="h-32 w-32" />
                    </div>

                    <div className="relative z-10 flex items-center justify-between pb-6 border-b border-white/10">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-cyan">Total to Pay</span>
                        <h3 className="text-5xl font-display font-black tracking-tighter">₱{pricing.preview?.grandTotal?.toFixed(2) || "0.00"}</h3>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Payment Status</span>
                        <div className="flex items-center gap-2 mt-1 justify-end">
                          <div className={`h-2 w-2 rounded-full ${collectPaymentNow ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          <span className="text-xs font-black uppercase tracking-widest">{collectPaymentNow ? 'Paid' : 'Unpaid'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10 space-y-6">
                      <label className="flex items-center gap-4 cursor-pointer group">
                        <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${collectPaymentNow ? 'bg-brand-cyan border-brand-cyan' : 'bg-transparent border-white/20 group-hover:border-white/40'
                          }`}>
                          {collectPaymentNow && <Plus className="h-4 w-4 text-slate-900" />}
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={collectPaymentNow}
                          onChange={(e) => setCollectPaymentNow(e.target.checked)}
                        />
                        <span className="text-sm font-black uppercase tracking-widest">Collect Payment Now</span>
                      </label>

                      {collectPaymentNow && (
                        <div className="pt-4 space-y-6 animate-in fade-in slide-in-from-top-4">
                          <div className="grid grid-cols-3 gap-3">
                            {["CASH", "GCASH", "BANK"].map((m) => (
                              <button
                                key={m}
                                type="button"
                                onClick={() => setPaymentMethod(m as any)}
                                className={`py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border-2 transition-all ${paymentMethod === m
                                    ? "bg-white border-white text-slate-900 shadow-xl"
                                    : "bg-transparent border-white/10 text-white/60 hover:border-white/30"
                                  }`}
                              >
                                {m}
                              </button>
                            ))}
                          </div>
                          {paymentMethod !== "CASH" && (
                            <Input
                              label="Transaction Reference"
                              value={referenceNumber}
                              onChange={(e) => setReferenceNumber(e.target.value)}
                              className="bg-white/5 border-white/10 text-white h-14"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Wizard Navigation Actions */}
            <div className="pt-12 flex items-center justify-between border-t border-slate-100">
              {stepIndex > 0 ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={prevStep}
                  className="h-14 px-8 uppercase font-black text-[10px] tracking-[0.2em] rounded-xl"
                >
                  Previous Step
                </Button>
              ) : (
                <div />
              )}

              <Button
                type={stepIndex < steps.length - 1 ? "button" : "submit"}
                variant={stepIndex < steps.length - 1 ? "primary" : "action"}
                onClick={stepIndex < steps.length - 1 ? nextStep : undefined}
                className={`h-14 transition-all duration-300 ${stepIndex < steps.length - 1 ? "px-12" : "px-16"
                  } uppercase font-black text-[10px] tracking-[0.2em] rounded-xl group`}
                isLoading={loading}
                disabled={loading || isClaimStubOpen || (currentStep === "CONFIRM" && !canSubmit)}
              >
                {stepIndex < steps.length - 1 ? (
                  <>
                    Continue
                    <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                ) : (
                  "Complete Intake & Print Stub"
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* ── RIGHT: LIVE PREVIEW (HCI: Immediate Feedback) ── */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-12 space-y-8 lg:pl-8">
            <div className="relative group">
              {/* Visual Depth Glow */}
              <div className="absolute -inset-10 bg-brand-blue/5 rounded-[4rem] blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-all duration-700" />

              <LiveTicket
                customerName={customerLookup.selected ? `${customerLookup.selected.firstName} ${customerLookup.selected.lastName}` : watch("customer.firstName") ? `${watch("customer.firstName")} ${watch("customer.lastName") || ""}` : "Walk-in Customer"}
                serviceType={serviceType}
                weightKg={weightKg}
                extraMinutes={extraMinutes}
                notes={watch("notes")}
                preview={pricing.preview}
                loading={pricing.loading}
              />
            </div>
          </div>
        </div>
      </form>

      <ClaimStub
        isOpen={isClaimStubOpen}
        onClose={() => {
          setIsClaimStubOpen(false);
          reset();
          router.push(`/orders/${createdOrder?.id}`);
          if (onSuccess) onSuccess();
        }}
        order={createdOrder}
      />
    </div>
  );
}


