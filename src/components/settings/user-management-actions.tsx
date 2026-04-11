"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { changeUserRole, toggleUserActive, initiatePasswordReset } from "@/app/(dashboard)/settings/users/actions";
import { ChevronDown } from "lucide-react";

interface UserManagementActionsProps {
  userId: string;
  currentRole: string;
  isActive: boolean;
}

export function UserManagementActions({ userId, currentRole, isActive }: UserManagementActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  function notify(type: "ok" | "err", msg: string) {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3000);
  }

  function handleRoleChange(newRole: string) {
    setShowRoleMenu(false);
    startTransition(async () => {
      const result = await changeUserRole(userId, newRole);
      if (result?.error) notify("err", result.error);
      else notify("ok", "Role updated");
    });
  }

  function handleToggleActive() {
    startTransition(async () => {
      const result = await toggleUserActive(userId, !isActive);
      if (result?.error) notify("err", result.error);
      else notify("ok", isActive ? "User deactivated" : "User reactivated");
    });
  }

  function handlePasswordReset() {
    if (!confirm("Send a password reset email to this user?")) return;
    startTransition(async () => {
      const result = await initiatePasswordReset(userId);
      if (result?.error) notify("err", result.error);
      else notify("ok", "Reset email sent");
    });
  }

  const roles = ["viewer", "inventory_manager", "admin"] as const;

  return (
    <div className="flex items-center justify-end gap-2 flex-wrap">
      {feedback && (
        <span className={`text-xs ${feedback.type === "ok" ? "text-emerald-600" : "text-red-600"}`}>
          {feedback.msg}
        </span>
      )}

      {/* Role change dropdown */}
      <div className="relative">
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => setShowRoleMenu((v) => !v)}
          className="gap-1 text-xs h-8"
        >
          Role
          <ChevronDown size={12} />
        </Button>
        {showRoleMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowRoleMenu(false)} />
            <div className="absolute right-0 top-9 z-20 min-w-[160px] rounded-md border bg-white shadow-lg">
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  disabled={role === currentRole}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed capitalize"
                >
                  {role.replace("_", " ")}
                  {role === currentRole && " (current)"}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Deactivate/Reactivate */}
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={handleToggleActive}
        className={`text-xs h-8 ${isActive ? "text-red-600 border-red-200 hover:bg-red-50" : "text-emerald-600 border-emerald-200 hover:bg-emerald-50"}`}
      >
        {isActive ? "Deactivate" : "Reactivate"}
      </Button>

      {/* Password Reset */}
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={handlePasswordReset}
        className="text-xs h-8"
      >
        Reset PW
      </Button>
    </div>
  );
}
