"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportDialog } from "./report-dialog";
import type { ReportTargetType } from "@auto/shared";

interface ReportButtonProps {
  targetType: ReportTargetType;
  targetId: string;
  variant?: "ghost" | "outline" | "destructive";
  size?: "sm" | "default" | "icon";
  className?: string;
}

export function ReportButton({
  targetType,
  targetId,
  variant = "ghost",
  size = "sm",
  className,
}: ReportButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
        data-testid="report-button"
      >
        <Flag className="h-4 w-4 mr-1" />
        Signaler
      </Button>
      <ReportDialog
        open={open}
        onOpenChange={setOpen}
        targetType={targetType}
        targetId={targetId}
      />
    </>
  );
}
