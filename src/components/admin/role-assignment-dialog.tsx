"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { getAuthHeaders } from "@/lib/auth/get-auth-headers";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

interface RoleOption {
  code: string;
  name: string;
}

interface DialogUser {
  ID: string;
  email: string;
  firstName: string;
  lastName: string;
  currentRole: string;
}

interface RoleAssignmentDialogProps {
  open: boolean;
  user: DialogUser;
  roles: RoleOption[];
  onClose: () => void;
  onSuccess: () => void;
}

export function RoleAssignmentDialog({
  open,
  user,
  roles,
  onClose,
  onSuccess,
}: RoleAssignmentDialogProps) {
  const [selectedRole, setSelectedRole] = useState(user.currentRole);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const authHeaders = await getAuthHeaders();

      if (selectedRole !== user.currentRole) {
        await fetch(`${API_BASE}/api/rbac/assignRole`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify({
            input: { userId: user.ID, roleCode: selectedRole },
          }),
        }).then((res) => {
          if (!res.ok) throw new Error("Failed to assign role");
          return res.json();
        });
      }

      onSuccess();
    } catch {
      setError("Impossible de modifier le role");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <ResponsiveDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Modifier le role</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {user.firstName} {user.lastName} ({user.email})
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <div className="space-y-3 py-2">
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choisir un role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r.code} value={r.code}>
                  {r.name || r.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>

        <ResponsiveDialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Annuler
          </Button>
          <Button onClick={handleConfirm} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              "Confirmer"
            )}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
