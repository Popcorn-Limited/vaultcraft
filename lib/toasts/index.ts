import { toast } from 'react-hot-toast';
import { loadingStyle, successStyle, errorStyle } from 'lib/toasts/toastStyles';

export function showLoadingToast(message: string = 'Transaction pending!') {
  toast.loading(message, loadingStyle);
}

export function showSuccessToast(message: string = 'Transaction successful!') {
  toast.dismiss();
  toast.success(message, successStyle);
}

export function showErrorToast(error: any = 'An error occurred while interacting with the contract.') {
  const errorMessage = extractRevertReason(error);
  toast.dismiss();
  toast.error(errorMessage, errorStyle);
}

function extractRevertReason(error: any): string {
  if (error.reason) {
    return error.reason;
  }

  if (error.data && error.data.message) {
    return error.data.message;
  }

  return error;
}