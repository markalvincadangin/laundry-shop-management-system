"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Search,
  User,
  UserPlus,
  Trash2,
  Plus,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Package,
  ShieldCheck,
  ArrowRight,
  Check,
  FileText,
  PlusCircle,
  Wallet,
  Smartphone,
  CreditCard,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { ordersService } from "@/lib/api/orders";
import { paymentsService } from "@/lib/api/payments";
import { PaymentMethod } from "@/constants/order-status";
import { Card, CardContent, Input, Button, Select, CurrencyDisplay } from "@/components/ui";
import { UI_LABELS } from "@/constants/ui";
import { usePriceCalculation } from "@/hooks/usePriceCalculation";
import { useCustomerLookup } from "@/hooks/useCustomerLookup";
import { SERVICE_TYPES, type ServiceDefinition, type ServiceType } from "@/constants/service-types";
import {
  OrderIntakeSchema,
  IntakeCustomerStepSchema,
  IntakeServiceStepSchema,
  type OrderIntakeInput
} from "@/lib/validation/order";
import { OrderIntakeFormProps } from "@/types/components";
import { ClaimStub } from "./ClaimStub";
import { OrderPreview } from "./OrderPreview";
import { OrderResponse } from "@/lib/api/orders";
import { ProcessStepper } from "@/components/features/shared/ProcessStepper";

type IntakeStep = "CUSTOMER" | "SERVICE" | "ADDONS" | "CONFIRM";

export function IntakeWizard({ createdByUserId, onSuccess, isModal }: OrderIntakeFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<IntakeStep>("CUSTOMER");
  const [collectPaymentNow, setCollectPaymentNow] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [isClaimStubOpen, setIsClaimStubOpen] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<OrderResponse | null>(null);
  const [canSubmit, setCanSubmit] = useState(false);
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
    setError,
    reset,
    formState: { errors }
  } = useForm<OrderIntakeInput>({
    resolver: zodResolver(OrderIntakeSchema),
    defaultValues: {
      createdByUserId: createdByUserId || "",
      serviceType: "WASH_DRY_FOLD",
      weightKg: undefined,
      extraMinutes: undefined,
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
    if (createdByUserId) {
      setValue("createdByUserId", createdByUserId);
    }
  }, [createdByUserId, setValue]);
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
    const values = getValues();

    if (currentStep === "CUSTOMER") {
      const result = IntakeCustomerStepSchema.safeParse(values);
      isValid = result.success;
      if (!isValid && result.error) {
        // Map Zod errors to react-hook-form
        result.error.issues.forEach((issue) => {
          const path = issue.path.join(".") as any;
          setError(path, { message: issue.message });
        });
        toast.error("Please provide valid customer details");
        return;
      }
    } else if (currentStep === "SERVICE") {
      const result = IntakeServiceStepSchema.safeParse(values);
      isValid = result.success;
      if (!isValid && result.error) {
        result.error.issues.forEach((issue) => {
          const path = issue.path.join(".") as any;
          setError(path, { message: issue.message });
        });
        return;
      }
    } else if (currentStep === "ADDONS") {
      isValid = true; // Add-ons are optional
    }

    if (isValid) {
      const next = steps[stepIndex + 1];
      setCurrentStep(next);

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

  /** 
   * HCI: Dynamic Step Validation (Rule 5 — Error Prevention)
   * Determines if the 'Continue' button should be enabled in real-time.
   */
  const isStepValid = React.useMemo(() => {
    if (currentStep === "CUSTOMER") {
      // More permissive logic for the UI button state to prevent lockout
      // Detailed validation happens on click in nextStep
      return !!(customerId || isRegistering);
    }
    if (currentStep === "SERVICE") {
      return !!(serviceType && Number(weightKg) > 0);
    }
    if (currentStep === "ADDONS") {
      return true; // Optional step
    }
    if (currentStep === "CONFIRM") {
      const needsRef = collectPaymentNow && paymentMethod !== "CASH";
      const hasRef = !!referenceNumber.trim();
      return canSubmit && (!needsRef || hasRef);
    }
    return false;
  }, [currentStep, customerId, isRegistering, serviceType, weightKg, canSubmit, collectPaymentNow, paymentMethod, referenceNumber]);

  const onSubmit = async (data: OrderIntakeInput) => {
    if (currentStep !== "CONFIRM") return;

    if (!data.createdByUserId) {
      toast.error("Critical Error: Staff Identity missing. Please log out and back in.");
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
          paymentReference: referenceNumber || undefined,
          receivedByUserId: createdByUserId ?? undefined
        });

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
        <div className="lg:col-span-7 glass rounded-[3rem] shadow-premium overflow-hidden border border-white/50 relative">
          {/* Ambient Step Glow */}
          <div className={`absolute -top-24 -left-24 w-64 h-64 blur-[100px] opacity-20 transition-all duration-1000 -z-10 ${stepIndex === 0 ? 'bg-brand-blue' :
            stepIndex === 1 ? 'bg-brand-cyan' :
              stepIndex === 2 ? 'bg-emerald-500' : 'bg-brand-blue'
            }`} />

          {/* Integrated Compact Stepper */}
          <div className="p-10 border-b border-slate-100/50 bg-slate-50/20 backdrop-blur-xl">
            <div className="relative flex justify-between items-center max-w-2xl mx-auto px-6">
              {/* Progress Track (Background) */}
              <div className="absolute top-6 left-0 right-0 h-1 bg-slate-200/40 rounded-full -z-10 mx-10 overflow-hidden">
                <motion.div
                  initial={false}
                  animate={{ width: `${(stepIndex / (steps.length - 1)) * 100}%` }}
                  className="h-full bg-brand-blue shadow-[0_0_15px_rgba(21,72,157,0.4)]"
                  transition={{ duration: 0.8, ease: "circOut" }}
                />
              </div>

              {steps.map((step, i) => {
                const isActive = i === stepIndex;
                const isCompleted = i < stepIndex;
                const label = ["CLIENT", "SERVICE", "EXTRAS", "REVIEW"][i];

                return (
                  <div key={step} className="flex flex-col items-center gap-4 relative z-10">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${isActive
                        ? "bg-brand-blue border-brand-blue text-white shadow-premium scale-110"
                        : isCompleted
                          ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                          : "bg-white border-slate-200 text-slate-300"
                        }`}
                    >
                      {isCompleted ? (
                        <Check className="h-6 w-6 stroke-[3px]" />
                      ) : (
                        <span className={`text-[13px] font-black ${isActive ? "scale-110" : ""}`}>{i + 1}</span>
                      )}
                    </div>
                    <span className={`text-[10px] font-black tracking-[0.4em] uppercase transition-all duration-500 ${isActive ? "text-brand-blue translate-y-1" : "text-slate-400/60"
                      }`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content Area */}
          <motion.div
            layout
            initial={false}
            className="p-10 min-h-[500px]"
          >
            <AnimatePresence mode="wait" initial={false}>
              {currentStep === "CUSTOMER" && (
                <motion.div
                  key="step-customer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="space-y-1">
                    <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight uppercase">{UI_LABELS.forms.intake.SELECT_CUSTOMER}</h2>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{UI_LABELS.forms.intake.SELECT_CUSTOMER_DESC}</p>
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
                          className="h-16 rounded-2xl border-slate-200 text-lg px-8"
                        />
                        {customerLookup.results.length > 0 ? (
                          <div className="absolute z-20 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden shadow-brand-blue/10">
                            {customerLookup.results.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => customerLookup.select(c)}
                                className="w-full flex items-center justify-between px-8 py-5 hover:bg-brand-blue/5 transition-colors group border-b border-slate-50 last:border-0"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="text-left">
                                    <span className="block font-black text-slate-900 uppercase tracking-tight group-hover:text-brand-blue transition-colors text-base">{c.firstName} {c.lastName}</span>
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{c.contactNumber}</span>
                                  </div>
                                </div>
                                <div className="h-10 w-10 rounded-full border border-slate-100 flex items-center justify-center group-hover:border-brand-blue group-hover:bg-brand-blue/5 transition-all">
                                  <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-brand-blue group-hover:translate-x-0.5 transition-all" />
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (customerLookup.search.length >= 2 && !customerLookup.loading) ? (
                          <div className="absolute z-20 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-10 text-center shadow-brand-blue/10 animate-in fade-in slide-in-from-top-2">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">No matching customers found</p>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                const parts = customerLookup.search.trim().split(/\s+/);
                                if (parts.length >= 2) {
                                  setValue("customer.firstName", parts[0]);
                                  setValue("customer.lastName", parts.slice(1).join(" "));
                                } else {
                                  setValue("customer.firstName", customerLookup.search);
                                }
                                customerLookup.setIsRegistering(true);
                              }}
                              className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border-slate-200 hover:border-brand-blue hover:text-brand-blue"
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              Register &quot;{customerLookup.search}&quot;
                            </Button>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-slate-100" />
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Or</span>
                        <div className="h-px flex-1 bg-slate-100" />
                      </div>

                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          const parts = customerLookup.search.trim().split(/\s+/);
                          if (parts.length >= 2) {
                            setValue("customer.firstName", parts[0]);
                            setValue("customer.lastName", parts.slice(1).join(" "));
                          } else {
                            setValue("customer.firstName", customerLookup.search);
                          }
                          customerLookup.setIsRegistering(true);
                        }}
                        className="w-full h-20 rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-500 hover:border-brand-blue hover:text-brand-blue hover:bg-brand-blue/5 transition-all gap-4 group"
                      >
                        <div className="h-10 w-10 rounded-xl bg-slate-100 group-hover:bg-brand-blue/10 flex items-center justify-center transition-colors">
                          <UserPlus className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <span className="block font-black text-xs uppercase tracking-tight">Register New Customer</span>
                        </div>
                      </Button>
                    </div>
                  ) : customerLookup.selected ? (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-10 bg-white rounded-[2.5rem] border-2 border-slate-100 relative overflow-hidden shadow-sm hover:border-brand-blue/20 transition-colors"
                    >
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight leading-none">
                              {customerLookup.selected.firstName} {customerLookup.selected.lastName}
                            </h3>
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5 uppercase tracking-widest">
                              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Verified
                            </span>
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2 text-slate-500 font-bold">
                              <Smartphone className="h-4 w-4 text-slate-300" />
                              {customerLookup.selected.contactNumber}
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 font-bold">
                              <ShieldCheck className="h-4 w-4 text-slate-300" />
                              Member Account
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => customerLookup.clear()}
                          className="px-6 h-12 bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all border border-transparent shadow-sm"
                        >
                          {UI_LABELS.shared.buttons.CHANGE}
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20">
                          <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">Registering New Account</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="First Name"
                          placeholder="e.g. Maria"
                          {...register("customer.firstName")}
                          error={errors.customer?.firstName?.message}
                          className="h-16 rounded-2xl"
                        />
                        <Input
                          label="Last Name"
                          placeholder="e.g. Santos"
                          {...register("customer.lastName")}
                          error={errors.customer?.lastName?.message}
                          className="h-16 rounded-2xl"
                        />
                      </div>
                      <Input
                        label="Contact Number"
                        placeholder="09171234567"
                        {...register("customer.contactNumber", {
                          onChange: (e) => {
                            // Auto-clean non-digits and prevent overflow
                            const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                            setValue("customer.contactNumber", val);
                          }
                        })}
                        error={errors.customer?.contactNumber?.message}
                        className="h-16 rounded-2xl"
                      />
                      <button
                        type="button"
                        onClick={() => customerLookup.setIsRegistering(false)}
                        className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors flex items-center gap-2 mt-2"
                      >
                        <ArrowRight className="h-3 w-3 rotate-180" />
                        Back to search
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
                    <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight uppercase">{UI_LABELS.forms.intake.SERVICE_DETAILS}</h2>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{UI_LABELS.forms.intake.SERVICE_DETAILS_DESC}</p>
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
                          className={`relative flex flex-col items-center p-8 rounded-[2.5rem] border-2 transition-all duration-500 text-center group active:scale-95 ${isSelected
                            ? "border-brand-blue bg-white shadow-2xl shadow-brand-blue/10 -translate-y-2"
                            : "border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-white hover:-translate-y-1"
                            }`}
                        >
                          {isSelected && (
                            <motion.div
                              layoutId="service-highlight"
                              className="absolute inset-0 rounded-[2.5rem] border-4 border-brand-blue/10 animate-pulse"
                            />
                          )}
                          <div className={`p-5 rounded-2xl mb-6 transition-all duration-500 ${isSelected
                            ? "bg-brand-blue text-white shadow-xl shadow-brand-blue/30 rotate-6"
                            : "bg-white text-slate-400 border border-slate-100 group-hover:text-slate-600 group-hover:-rotate-6"
                            }`}>
                            <Icon className="h-8 w-8" />
                          </div>
                          <span className={`text-xs font-black uppercase tracking-[0.2em] mb-2 ${isSelected ? "text-brand-blue" : "text-slate-900"}`}>
                            {service.label}
                          </span>
                          <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight px-2">
                            {service.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <Input
                      label={UI_LABELS.shared.common.WEIGHT + " (kg)"}
                      type="number"
                      step="0.01"
                      placeholder="0.0"
                      rightElement={
                        <div className="px-4 py-2 bg-slate-100 rounded-lg mr-2">
                          <span className="text-[10px] font-black text-slate-500 uppercase">KG</span>
                        </div>
                      }
                      {...register("weightKg", {
                        valueAsNumber: true,
                        onBlur: (e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) {
                            setValue("weightKg", parseFloat(val.toFixed(2)));
                          }
                        }
                      })}
                      error={errors.weightKg?.message}
                      className="h-16 rounded-2xl border-slate-200 text-xl font-black pr-16 tabular-nums"
                    />
                    <div className="space-y-2">
                      <Input
                        label={UI_LABELS.shared.common.EXTRA_TIME + " (mins)"}
                        type="number"
                        placeholder="0"
                        rightElement={
                          <div className="px-4 py-2 bg-slate-100 rounded-lg mr-2">
                            <span className="text-[10px] font-black text-slate-500 uppercase">MINS</span>
                          </div>
                        }
                        {...register("extraMinutes", { valueAsNumber: true })}
                        error={errors.extraMinutes?.message}
                        className="h-16 rounded-2xl border-slate-200 text-xl font-black pr-20 tabular-nums"
                      />
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
                    <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight uppercase">{UI_LABELS.modules.orders.EXTRAS || "Extras & Notes"}</h2>
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
                        placeholder={UI_LABELS.forms.intake.ADD_ON_NAME || "Item Name (e.g. Detergent)"}
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
                        variant="primary"
                        onClick={handleAddAddOn}
                        disabled={!tempAddOnName || !tempAddOnPrice}
                        className="h-14 px-6 rounded-xl shadow-premium group"
                      >
                        <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform" />
                        <span>Add</span>
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <AnimatePresence mode="popLayout">
                        {addOnsFields.map((field, i) => (
                          <motion.div
                            key={field.id}
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                            className="flex items-center justify-between bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-slate-100 shadow-sm group hover:border-brand-blue/30 transition-all hover:shadow-md"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-2xl bg-brand-blue/5 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all">
                                <PlusCircle className="h-5 w-5" />
                              </div>
                              <div>
                                <span className="block text-sm font-black text-slate-900 uppercase tracking-tight">{field.name}</span>
                                <CurrencyDisplay 
                                  amount={Number(field.price)} 
                                  size="sm" 
                                  className="text-brand-blue" 
                                  numberClassName="font-black tracking-wide" 
                                />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAddOn(i)}
                              className="h-10 w-10 flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 active:scale-90"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    <div className="pt-8 border-t border-slate-100/50">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Special Instructions</label>
                      </div>
                      <textarea
                        {...register("notes")}
                        placeholder="e.g. Separate whites, low heat drying..."
                        className="w-full min-h-[140px] rounded-[2rem] border border-slate-200 bg-slate-50/30 p-6 text-sm text-slate-900 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 transition-all outline-none resize-none shadow-inner font-medium placeholder:text-slate-300"
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
                    <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight uppercase">{UI_LABELS.forms.intake.REVIEW_PAYMENT}</h2>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{UI_LABELS.forms.intake.REVIEW_PAYMENT_DESC}</p>
                  </div>

                  <div className="relative">
                    {/* The "Review Receipt" Card - Hardened for FRONT-001/002 */}
                    <div className="bg-brand-blue rounded-[3rem] text-white p-10 pb-20 shadow-2xl relative border border-brand-blue/20">
                      {/* Decorative Brand Elements */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-cyan/5 rounded-full blur-[60px] -ml-24 -mb-24" />

                      <div className="relative z-10 space-y-10">
                        {/* Header: Reference & Total */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-white/30 block">Grand Total</span>
                              <div className="flex items-baseline">
                                <CurrencyDisplay
                                  amount={pricing.preview?.grandTotal}
                                  size="xl"
                                  className="text-7xl md:text-8xl text-white"
                                  symbolClassName="text-brand-cyan/80 mr-3"
                                  numberClassName="font-display font-black tracking-tighter leading-none"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bottom: Interactive Payment Layer */}
                        <div className="pt-10 space-y-10">
                          <button
                            type="button"
                            onClick={() => setCollectPaymentNow(!collectPaymentNow)}
                            className={`w-full p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between group ${collectPaymentNow
                              ? 'bg-brand-cyan text-brand-blue border-brand-cyan shadow-xl scale-[1.02]'
                              : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                              }`}
                          >
                            <div className="flex items-center gap-5">
                              <div className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all ${collectPaymentNow ? 'bg-brand-blue text-white' : 'bg-white/10 text-white/40'
                                }`}>
                                {collectPaymentNow ? <Check className="h-5 w-5" /> : <Wallet className="h-5 w-5" />}
                              </div>
                              <div className="text-left">
                                <span className="text-sm font-black uppercase tracking-widest">{UI_LABELS.modules.orders.COLLECT_PAYMENT_NOW}</span>
                              </div>
                            </div>
                            <div className={`h-6 w-12 rounded-full relative transition-all ${collectPaymentNow ? 'bg-brand-blue' : 'bg-white/20'
                              }`}>
                              <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${collectPaymentNow ? 'left-7' : 'left-1'
                                }`} />
                            </div>
                          </button>

                          <AnimatePresence>
                            {collectPaymentNow && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="space-y-6 pt-4 pb-6 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="flex-1 h-[1px] bg-white/10" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Payment Method</span>
                                    <div className="flex-1 h-[1px] bg-white/10" />
                                  </div>
                                  <div className="grid grid-cols-3 gap-4">
                                    {["CASH", "GCASH", "BANK_TRANSFER"].map((m) => {
                                      const label = m === "CASH" ? UI_LABELS.modules.payments.METHOD_CASH :
                                        m === "GCASH" ? UI_LABELS.modules.payments.METHOD_GCASH :
                                          UI_LABELS.modules.payments.METHOD_BANK;
                                      return (
                                        <button
                                          key={m}
                                          type="button"
                                          onClick={() => setPaymentMethod(m as any)}
                                          className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 active:scale-95 relative ${paymentMethod === m
                                            ? 'bg-brand-blue border-brand-blue text-white shadow-xl -translate-y-1'
                                            : 'bg-white/10 border-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                                            }`}
                                        >
                                          {m === "CASH" ? <Wallet className="h-5 w-5" /> :
                                            m === "GCASH" ? <Smartphone className="h-5 w-5" /> :
                                              <CreditCard className="h-5 w-5" />}
                                          <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
                                          {paymentMethod === m && (
                                            <motion.div
                                              layoutId="active-method"
                                              className="absolute -top-2 -right-2 h-6 w-6 bg-white rounded-full flex items-center justify-center shadow-lg"
                                            >
                                              <Check className="h-3 w-3 text-brand-blue" />
                                            </motion.div>
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>

                                  <AnimatePresence>
                                    {paymentMethod !== "CASH" && (
                                      <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="pt-4"
                                      >
                                        <div className="space-y-3">
                                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-4">
                                            Reference Number
                                          </label>
                                          <div className="relative group">
                                            <CreditCard className="h-4 w-4 text-white/20 group-focus-within:text-brand-cyan absolute left-6 top-1/2 -translate-y-1/2 transition-colors" />
                                            <input
                                              type="text"
                                              placeholder="Enter Reference Number"
                                              value={referenceNumber}
                                              onChange={(e) => setReferenceNumber(e.target.value)}
                                              className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 pl-14 pr-6 text-sm font-bold placeholder:text-white/20 focus:bg-white/10 focus:border-brand-cyan transition-all outline-none"
                                            />
                                          </div>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Wizard Navigation Actions */}
          <div className="pt-12 px-12 pb-12 flex items-center justify-between border-t border-slate-100 relative z-20">
            {stepIndex > 0 ? (
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={prevStep}
                className="h-14 px-8 rounded-2xl group border-none bg-slate-100 hover:bg-slate-200 transition-all"
              >
                <ChevronLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                {UI_LABELS.shared.buttons.BACK}
              </Button>
            ) : (
              <div />
            )}

            <Button
              type={stepIndex < steps.length - 1 ? "button" : "submit"}
              variant={stepIndex < steps.length - 1 ? "primary" : "action"}
              size="lg"
              onClick={stepIndex < steps.length - 1 ? nextStep : undefined}
              className={`h-14 transition-all duration-500 rounded-2xl shadow-premium ${stepIndex < steps.length - 1 ? "px-12" : "px-16"
                } group`}
              isLoading={loading}
              disabled={loading || isClaimStubOpen || !isStepValid}
            >
              {stepIndex < steps.length - 1 ? (
                <>
                  {UI_LABELS.shared.buttons.NEXT}
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  {UI_LABELS.forms.intake.SUBMIT_BUTTON}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* ── RIGHT: LIVE PREVIEW (HCI: Immediate Feedback) ── */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-12 space-y-8 lg:pl-8">
            <div className="relative group">
              {/* Visual Depth Glow */}
              <div className="absolute -inset-10 bg-brand-blue/5 rounded-[4rem] blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-all duration-700" />

              <OrderPreview
                customerName={customerLookup.selected ? `${customerLookup.selected.firstName} ${customerLookup.selected.lastName}` : watch("customer.firstName") ? `${watch("customer.firstName")} ${watch("customer.lastName") || ""}` : "Walk-in Customer"}
                serviceType={watch("serviceType")}
                weightKg={Number(watch("weightKg"))}
                extraMinutes={Number(watch("extraMinutes"))}
                notes={watch("notes")}
                addOns={addOns}
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


