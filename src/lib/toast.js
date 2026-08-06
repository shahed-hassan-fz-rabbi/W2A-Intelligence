import { toast } from "sonner";

export const notify = {
  success: (msg) => toast.success(msg),
  error: (msg) => toast.error(msg),
  info: (msg) => toast.info(msg),
  loading: (msg) => toast.loading(msg),
  dismiss: (id) => toast.dismiss(id),
};


export function notifyPromise(promise, { loading, success, error }) {
  return toast.promise(promise, { loading, success, error });
}


export function confirmToast(message, onConfirm) {
  toast(message, {
    action: {
      label: "Confirm",
      onClick: onConfirm,
    },
    cancel: {
      label: "Cancel",
      onClick: () => {},
    },
    duration: 8000,
  });
}