import React, { useState, useEffect } from "react";
import { User, Phone, Save, X } from "lucide-react";
import { Modal, Button, Input } from "@/components/ui";
import { customersService } from "@/services/customers.service";
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
 * Customer Edit Modal
 * Standardized form for updating customer profile information.
 * Mandated by FRONT-001 §12.
 */
export function CustomerEditModal({ isOpen, onClose, customer, onSuccess }: CustomerEditModalProps) {
  const [loading, setLoading] = useState(false);
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

  const isEdit = !!customer;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? UI_LABELS.shared.buttons.EDIT : UI_LABELS.modules.customers.TITLE}
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-grid-6 space-y-grid-6">
        <div className="space-y-grid-4">
          <Input
            label={UI_LABELS.forms.intake.FIRST_NAME}
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            icon={<User className="h-4 w-4 text-brand-blue" />}
            required
            className="h-14 rounded-xl border-slate-200"
          />
          <Input
            label={UI_LABELS.forms.intake.LAST_NAME}
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            icon={<User className="h-4 w-4 text-brand-blue" />}
            required
            className="h-14 rounded-xl border-slate-200"
          />
          <Input
            label={UI_LABELS.forms.intake.CONTACT}
            value={form.contactNumber}
            onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
            icon={<Phone className="h-4 w-4 text-brand-blue" />}
            required
            className="h-14 rounded-xl border-slate-200 font-mono"
          />
        </div>

        <div className="pt-grid-4 flex flex-col sm:flex-row gap-grid-3">
          <Button 
            type="submit"
            variant="primary" 
            isLoading={loading}
            className="flex-[2] h-14 gap-grid-2 font-black uppercase text-caption tracking-widest shadow-lg shadow-brand-blue/20"
          >
            <Save className="h-4 w-4" />
            {UI_LABELS.shared.buttons.SAVE}
          </Button>
          
          {customer && (
            <Button 
              type="button"
              variant={customer.isActive ? "outline" : "primary"}
              onClick={async () => {
                const confirmMsg = customer.isActive 
                  ? UI_LABELS.modals.confirm.DEACTIVATE_USER 
                  : UI_LABELS.modals.confirm.ACTIVATE_USER;
                  
                if (window.confirm(confirmMsg)) {
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
                  }
                }
              }}
              disabled={loading}
              className={`flex-1 h-14 font-black uppercase text-caption tracking-widest transition-all ${
                customer.isActive 
                  ? "border-rose-200 text-rose-600 hover:bg-rose-50" 
                  : "bg-emerald-600 hover:bg-emerald-700 text-white border-none"
              }`}
            >
              {customer.isActive ? "Deactivate" : "Activate"}
            </Button>
          )}

          <Button 
            type="button"
            variant="ghost" 
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-14 font-black uppercase text-caption tracking-widest border-slate-200"
          >
            {UI_LABELS.shared.buttons.CANCEL}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
