"use client";

import React, { useState, useEffect } from "react";
import { 
  UserPlus, 
  Settings2, 
  Save, 
  X,
  User as UserIcon,
  Shield,
  Key
} from "lucide-react";
import { 
  Modal, 
  Input, 
  Button, 
  Select, 
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui";
import { UI_LABELS } from "@/constants/ui";
import { usersService, UserResponse } from "@/services/users.service";
import { toast } from "sonner";
import { UserRole } from "@/types";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserResponse | null;
  onSuccess: () => void;
}

export function UserModal({ isOpen, onClose, user, onSuccess }: UserModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "STAFF" as UserRole,
  });

  useEffect(() => {
    if (user && isOpen) {
      setForm({
        username: user.username,
        password: "",
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
    } else if (!user && isOpen) {
      setForm({
        username: "",
        password: "",
        firstName: "",
        lastName: "",
        role: "STAFF" as UserRole,
      });
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (user) {
        await usersService.update(user.id, {
          firstName: form.firstName,
          lastName: form.lastName,
          role: form.role,
          password: form.password || undefined,
        });
      } else {
        await usersService.create(form);
      }
      toast.success(UI_LABELS.feedback.success.SAVED);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || UI_LABELS.feedback.error.GENERIC);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={user ? UI_LABELS.modules.users.EDIT_USER : UI_LABELS.modules.users.CREATE_USER}
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-grid-6 space-y-grid-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-grid-6">
          <Input
          label={UI_LABELS.modules.users.FIRST_NAME}
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          required
          icon={<UserIcon className="h-4 w-4 text-brand-blue" />}
          className="h-14 rounded-xl border-slate-200"
        />
        <Input
          label={UI_LABELS.modules.users.LAST_NAME}
          value={form.lastName}
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          required
          icon={<UserIcon className="h-4 w-4 text-brand-blue" />}
          className="h-14 rounded-xl border-slate-200"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-grid-6">
        <Input
          label={UI_LABELS.modules.users.USERNAME}
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
          disabled={!!user}
          icon={<Shield className="h-4 w-4 text-brand-blue" />}
          className={`h-14 rounded-xl border-slate-200 ${user ? 'bg-slate-50 text-slate-500 cursor-not-allowed opacity-70' : 'bg-white'}`}
        />
        <Select
          label={UI_LABELS.modules.users.ROLE}
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
          required
          className="h-14 rounded-xl border-slate-200 bg-white"
        >
          <option value="STAFF">{UI_LABELS.modules.users.ROLE_STAFF}</option>
          <option value="ADMIN">{UI_LABELS.modules.users.ROLE_ADMIN}</option>
        </Select>
      </div>

      <Input
        label={UI_LABELS.modules.users.PASSWORD}
        type="password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required={!user}
        placeholder={user ? UI_LABELS.modules.users.PASSWORD_HINT : ""}
          icon={<Key className="h-4 w-4 text-brand-blue" />}
          className="h-14 rounded-xl border-slate-200"
        />

        <div className="flex gap-grid-4 pt-grid-4">
          <Button
            type="submit"
            isLoading={loading}
            className="flex-[2] h-14 bg-brand-blue shadow-lg shadow-brand-blue/20 uppercase font-black text-caption tracking-widest"
          >
            <Save className="h-4 w-4" />
            {UI_LABELS.shared.buttons.SAVE}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="flex-1 h-14 border-slate-200 uppercase font-black text-caption tracking-widest text-slate-500"
          >
            {UI_LABELS.shared.buttons.CANCEL}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
