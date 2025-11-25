import { ReactNode, useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, type ButtonProps } from "@/components/ui/button";

export interface ConfirmDialogProps {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  trigger?: ReactNode;
  triggerLabel?: string;
  triggerVariant?: ButtonProps["variant"];
  triggerSize?: ButtonProps["size"];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: ButtonProps["variant"];
  cancelVariant?: ButtonProps["variant"];
  confirmDisabled?: boolean;
  isLoading?: boolean;
  onConfirm?: () => void | Promise<void>;
  closeOnConfirm?: boolean;
}

export const ConfirmDialog = ({
  title,
  description,
  children,
  trigger,
  triggerLabel = "Abrir",
  triggerVariant = "outline",
  triggerSize = "sm",
  open,
  onOpenChange,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  confirmVariant = "destructive",
  cancelVariant = "outline",
  confirmDisabled,
  isLoading,
  onConfirm,
  closeOnConfirm = true,
}: ConfirmDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [internalLoading, setInternalLoading] = useState(false);

  const isControlled = typeof open === "boolean";
  const dialogOpen = isControlled ? open : internalOpen;
  const loading = useMemo(() => (typeof isLoading === "boolean" ? isLoading : internalLoading), [isLoading, internalLoading]);

  const handleOpenChange = (value: boolean) => {
    if (!isControlled) {
      setInternalOpen(value);
    }
    onOpenChange?.(value);
  };

  const handleConfirm = async () => {
    if (!onConfirm) {
      if (closeOnConfirm) {
        handleOpenChange(false);
      }
      return;
    }

    try {
      const result = onConfirm();
      if (result instanceof Promise) {
        setInternalLoading(true);
        await result;
      }
      if (closeOnConfirm) {
        handleOpenChange(false);
      }
    } catch (error) {
      console.error("Erro ao confirmar diálogo:", error);
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <AlertDialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {trigger !== null && (
        <AlertDialogTrigger asChild>
          {trigger ?? (
            <Button variant={triggerVariant} size={triggerSize}>
              {triggerLabel}
            </Button>
          )}
        </AlertDialogTrigger>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>

        {children && <div className="text-sm text-muted-foreground">{children}</div>}

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant={cancelVariant} type="button">
              {cancelLabel}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              type="button"
              variant={confirmVariant}
              disabled={confirmDisabled || loading}
              onClick={handleConfirm}
            >
              {loading ? "Processando..." : confirmLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDialog;

