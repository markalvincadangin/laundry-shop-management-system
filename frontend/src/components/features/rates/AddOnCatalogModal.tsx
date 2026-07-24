import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useCreateAddOnCatalog, useUpdateAddOnCatalog } from "@/hooks/useAddOnCatalog";
import { AddOnCatalogResponse } from "@/lib/api/addOnCatalog";
import { UI_LABELS } from "@/constants/ui";
import { toast } from "sonner";

import { addOnCatalogSchema, AddOnCatalogFormValues } from "@/lib/validation/addon";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  addOn?: AddOnCatalogResponse | null;
  onSuccess: () => void;
}

export function AddOnCatalogModal({ isOpen, onClose, addOn, onSuccess }: Props) {
  const isEditing = !!addOn;
  const createMutation = useCreateAddOnCatalog();
  const updateMutation = useUpdateAddOnCatalog();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddOnCatalogFormValues>({
    resolver: zodResolver(addOnCatalogSchema),
    defaultValues: {
      name: "",
      defaultPrice: 0,
      isActive: true,
    }
  });

  React.useEffect(() => {
    if (isOpen && addOn) {
      reset({
        name: addOn.name,
        defaultPrice: addOn.defaultPrice,
        isActive: addOn.isActive,
      });
    } else if (isOpen) {
      reset({
        name: "",
        defaultPrice: 0,
        isActive: true,
      });
    }
  }, [isOpen, addOn, reset]);

  const onSubmit = async (data: AddOnCatalogFormValues) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: addOn!.id, data });
        toast.success("Add-on updated successfully");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Add-on created successfully");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to save add-on");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Add-On" : "Create Add-On"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input 
          label="Name" 
          {...register("name")} 
          error={errors.name?.message} 
        />
        <Input 
          label="Default Price" 
          type="number" 
          step="0.01"
          {...register("defaultPrice", { valueAsNumber: true })} 
          error={errors.defaultPrice?.message} 
        />
        <label className="flex items-center gap-3">
          <input type="checkbox" {...register("isActive")} className="w-5 h-5 rounded text-brand-blue focus:ring-brand-blue" />
          <span className="text-sm font-bold text-slate-700 uppercase tracking-widest">{UI_LABELS.shared.common.ACTIVE}</span>
        </label>
        
        <div className="flex justify-end gap-4 mt-8">
          <Button variant="outline" onClick={onClose} type="button">{UI_LABELS.shared.buttons.CANCEL}</Button>
          <Button variant="primary" type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {isEditing ? "Save Changes" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
