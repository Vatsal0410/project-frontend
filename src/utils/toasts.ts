import toast from "react-hot-toast";

export const toastSuccess = (message: string, toastId?: string) => {
  toast.success(message, {
    id: toastId,
    duration: 3000,
    position: "top-right",
  });
};

export const toastError = (message: string) => {
  toast.error(message, {
    duration: 3000,
    position: "top-right",
  });
};

export const toastLoading = (message: string) => {
  return toast.loading(message, {
    duration: 3000,
    position: "top-right",
  });
};
