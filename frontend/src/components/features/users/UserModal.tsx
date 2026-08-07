"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserPlus, 
  Settings2, 
  Save, 
  X,
  User as UserIcon,
  Shield,
  Key,
  Mail,
  Fingerprint
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
import { usersService, UserResponse } from "@/lib/api/users";
import { toast } from "sonner";
import { UserRole } from "@/types";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserResponse | null;
  onSuccess: () => void;
}

/**
 * User Management Modal — High Fidelity (v4.0)
 * Standardized modal for creating and updating staff accounts.
 * Adheres to FRONT-001 §7 and §3.1.6 standards.
 */
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
      className="rounded-[40px] overflow-hidden"
    >
      <form onSubmit={handleSubmit} className="p-grid-6 md:p-grid-8 space-y-grid-8 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-brand-blue/5 blur-3xl opacity-40 pointer-events-none" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-grid-6">
          <Input
            label={UI_LABELS.modules.users.FIRST_NAME}
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            required
            icon={<UserIcon className="h-4 w-4 text-brand-blue" />}
            className="h-14 rounded-2xl border-slate-200 bg-white/50 focus:bg-white transition-all shadow-sm"
          />
          <Input
            label={UI_LABELS.modules.users.LAST_NAME}
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            required
            icon={<UserIcon className="h-4 w-4 text-brand-blue" />}
            className="h-14 rounded-2xl border-slate-200 bg-white/50 focus:bg-white transition-all shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-grid-6">
          <Input
            label={UI_LABELS.modules.users.USERNAME}
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
            disabled={!!user}
            icon={<Fingerprint className="h-4 w-4 text-brand-blue" />}
            className={`h-14 rounded-2xl border-slate-200 transition-all shadow-sm ${user ? 'bg-slate-50 text-slate-400 cursor-not-allowed opacity-70' : 'bg-white/50 focus:bg-white'}`}
          />
          <Select
            label={UI_LABELS.modules.users.ROLE}
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
            required
            className="h-14 rounded-2xl border-slate-200 bg-white/50 shadow-sm"
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
          placeholder={user ? UI_LABELS.modules.users.PASSWORD_HINT : "Minimum 8 characters"}
          icon={<Key className="h-4 w-4 text-brand-blue" />}
          className="h-14 rounded-2xl border-slate-200 bg-white/50 focus:bg-white transition-all shadow-sm font-mono"
        />

        <div className="flex flex-col sm:flex-row gap-grid-4 pt-grid-4">
          <Button
            type="submit"
            requiresOnline
            isLoading={loading}
            className="flex-[2] h-14 bg-brand-blue shadow-lg shadow-brand-blue/25 uppercase font-black text-[11px] tracking-widest active:scale-95 transition-all rounded-xl"
          >
            <Save className="h-5 w-5" />
            {UI_LABELS.shared.buttons.SAVE}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="flex-1 h-14 border-slate-100 uppercase font-black text-[11px] tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all rounded-xl"
          >
            {UI_LABELS.shared.buttons.CANCEL}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
