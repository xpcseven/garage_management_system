"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PopupTabComponent {
  title?: string;
  dialogTitle: string;
  dialogContent: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  classTitle?: string;
  classContent?: string;
  classForm?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const PopupTab = ({
  title,
  dialogTitle,
  dialogContent,
  icon,
  className,
  classContent,
  classTitle,
  classForm,
  open,
  onOpenChange,
}: PopupTabComponent) => {
  return (
    <div className={`pb-2 ${classForm}`}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild className={`${className}`}>
          <button className={`${classTitle} p-1 text-center`}>
            {title}
            {icon}
          </button>
        </DialogTrigger>
        <DialogContent className={`${classContent}`}>
          <DialogHeader>
            <DialogTitle className="text-secondary font-bold text-xl text-center p-3">
              {dialogTitle}
            </DialogTitle>
          </DialogHeader>
          {dialogContent}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PopupTab;
