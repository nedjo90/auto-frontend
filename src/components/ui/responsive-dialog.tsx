"use client";

import * as React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResponsiveDialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function ResponsiveDialog({ children, ...props }: ResponsiveDialogProps) {
  const isMobile = useIsMobile();
  const Comp = isMobile ? Sheet : Dialog;
  return <Comp {...props}>{children}</Comp>;
}

function ResponsiveDialogTrigger({ ...props }: React.ComponentProps<typeof DialogTrigger>) {
  const isMobile = useIsMobile();
  const Comp = isMobile ? SheetTrigger : DialogTrigger;
  return <Comp {...props} />;
}

function ResponsiveDialogClose({ ...props }: React.ComponentProps<typeof DialogClose>) {
  const isMobile = useIsMobile();
  const Comp = isMobile ? SheetClose : DialogClose;
  return <Comp {...props} />;
}

function ResponsiveDialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogContent>) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <SheetContent
        side="bottom"
        className={className}
        {...(props as React.ComponentProps<typeof SheetContent>)}
      >
        {children}
      </SheetContent>
    );
  }

  return (
    <DialogContent className={className} {...props}>
      {children}
    </DialogContent>
  );
}

function ResponsiveDialogHeader({ ...props }: React.ComponentProps<typeof DialogHeader>) {
  const isMobile = useIsMobile();
  const Comp = isMobile ? SheetHeader : DialogHeader;
  return <Comp {...props} />;
}

function ResponsiveDialogFooter({ ...props }: React.ComponentProps<typeof DialogFooter>) {
  const isMobile = useIsMobile();
  if (isMobile) {
    return <SheetFooter {...(props as React.ComponentProps<typeof SheetFooter>)} />;
  }
  return <DialogFooter {...props} />;
}

function ResponsiveDialogTitle({ ...props }: React.ComponentProps<typeof DialogTitle>) {
  const isMobile = useIsMobile();
  const Comp = isMobile ? SheetTitle : DialogTitle;
  return <Comp {...props} />;
}

function ResponsiveDialogDescription({ ...props }: React.ComponentProps<typeof DialogDescription>) {
  const isMobile = useIsMobile();
  const Comp = isMobile ? SheetDescription : DialogDescription;
  return <Comp {...props} />;
}

export {
  ResponsiveDialog,
  ResponsiveDialogTrigger,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
};
