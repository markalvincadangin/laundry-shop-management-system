import React, { useState, useEffect } from "react";
import { User, Phone, Save, X, ShieldAlert, ShieldCheck } from "lucide-react";
import { Modal, Button, Input, ConfirmDialog } from "@/components/ui";
import { customersService } from "@/lib/api/customers";
import { useAuth } from "@/stores/auth-store";
import type { components } from "@/types/api.generated";
import { toast } from "sonner";
import { UI_LABELS } from "@/constants/ui";

interface CustomerEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: components["schemas"]["CustomerResponse"] | null;
  onSuccess: () => void;
}

/**
 * Customer Edit Modal — High Fidelity (v4.0)
 * Standardized form for updating customer profile information.
 * Hardened with RBAC (Admin-only deactivation) and high-fidelity confirmation dialogs.
 */
export function CustomerEditModal({ isOpen, onClose, customer, onSuccess }: CustomerEditModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [form, setForm] = useState<components["schemas"]["CreateCustomerRequest"]>({
    firstName: "",
    lastName: "",
    contactNumber: "",
  });

  useEffect(() => {
    if (customer) {
      setForm({
        firstName: customer.firstName || "",
        lastName: customer.lastName || "",
        contactNumber: customer.contactNumber || "",
      });
    } else {
      setForm({
        firstName: "",
        lastName: "",
        contactNumber: "",
      });
    }
  }, [customer, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (customer) {
        await customersService.update(customer.id, form);
        toast.success(UI_LABELS.feedback.success.UPDATED);
      } else {
        await customersService.create(form);
        toast.success(UI_LABELS.feedback.success.REGISTERED);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      const message = err.response?.data?.message || UI_LABELS.feedback.error.GENERIC;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!customer) return;
    setLoading(true);
    try {
      await customersService.toggleActive(customer.id);
      toast.success(UI_LABELS.feedback.success.GENERIC);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(UI_LABELS.feedback.error.GENERIC);
    } finally {
      setLoading(false);
      setShowStatusConfirm(false);
    }
  };

  const isEdit = !!customer;
  const isAdmin = user?.role === "ADMIN";

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={isEdit ? UI_LABELS.shared.buttons.EDIT : UI_LABELS.modules.customers.TITLE}
        size="md"
        className="rounded-3xl"
      >
        <form onSubmit={handleSubmit} className="p-grid-6 space-y-grid-8">
          <div className="space-y-grid-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-grid-4">
              <Input
                label={UI_LABELS.forms.intake.FIRST_NAME}
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                icon={<User className="h-4 w-4 text-brand-blue" />}
                required
                className="h-14 rounded-xl border-slate-200 focus:bg-white"
              />
              <Input
                label={UI_LABELS.forms.intake.LAST_NAME}
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                icon={<User className="h-4 w-4 text-brand-blue" />}
                required
                className="h-14 rounded-xl border-slate-200 focus:bg-white"
              />
            </div>
            <Input
              label={UI_LABELS.forms.intake.CONTACT}
              value={form.contactNumber}
              onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
              icon={<Phone className="h-4 w-4 text-brand-blue" />}
              required
              className="h-14 rounded-xl border-slate-200 font-mono tracking-wider focus:bg-white"
            />
          </div>

          <div className="pt-grid-4 flex flex-col gap-grid-3">
            <div className="flex flex-col sm:flex-row gap-grid-3">
              <Button 
                type="submit"
                variant="primary" 
                isLoading={loading}
                className="flex-[2] h-14 gap-grid-2 font-black uppercase text-[11px] tracking-widest shadow-lg shadow-brand-blue/20 rounded-xl"
              >
                <Save className="h-4 w-4" />
                {isEdit ? UI_LABELS.shared.buttons.SAVE : UI_LABELS.shared.buttons.REGISTER}
              </Button>
              
              <Button 
                type="button"
                variant="ghost" 
                onClick={onClose}
                disabled={loading}
                className="flex-1 h-14 font-black uppercase text-[11px] tracking-widest border border-slate-100 hover:bg-slate-50 rounded-xl"
              >
                {UI_LABELS.shared.buttons.CANCEL}
              </Button>
            </div>

            {isEdit && isAdmin && (
              <div className="pt-grid-2 border-t border-slate-100 mt-grid-4">
                <Button 
                  type="button"
                  variant="ghost"
                  onClick={() => setShowStatusConfirm(true)}
                  disabled={loading}
                  className={`w-full h-12 gap-2 font-black uppercase text-[10px] tracking-widest transition-all rounded-xl ${
                    customer?.isActive 
                      ? "text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100" 
                      : "text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-100"
                  }`}
                >
                  {customer?.isActive ? (
                    <ShieldAlert className="h-4 w-4" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                  {customer?.isActive ? "Deactivate Customer Profile" : "Reactivate Customer Profile"}
                </Button>
                <p className="text-[9px] text-center text-slate-400 mt-2 font-black uppercase tracking-widest px-grid-4">
                  {customer?.isActive 
                    ? "Administrative action to restrict new orders" 
                    : "Restore order intake capabilities for this customer"}
                </p>
              </div>
            )}
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showStatusConfirm}
        title={customer?.isActive ? "Deactivate Customer?" : "Activate Customer?"}
        description={customer?.isActive 
          ? UI_LABELS.modals.confirm.DEACTIVATE_USER 
          : UI_LABELS.modals.confirm.ACTIVATE_USER}
        confirmText={customer?.isActive ? "Deactivate" : "Activate"}
        isDestructive={customer?.isActive}
        icon={customer?.isActive ? ShieldAlert : ShieldCheck}
        isLoading={loading}
        onConfirm={handleToggleStatus}
        onCancel={() => setShowStatusConfirm(false)}
      />
    </>
  );
}
