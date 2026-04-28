export const modals = {
  confirm: {
    TITLE: "Are you sure?",
    WASHING: "Start washing this order?",
    DRYING: "Move to drying?",
    FOLDING: "Start folding?",
    READY: "Mark as ready for pickup?",
    RELEASE: "Confirm customer pickup and payment?",
    CANCEL: "Cancel this order? This cannot be undone.",
    VOID_PAYMENT: "Void this payment record?",
    CANCEL_ORDER_DESC: "Cancel this order? This cannot be undone.",
    VOID_PAYMENT_TITLE: "Void Payment?",
    VOID_PAYMENT_DESC: "This will void the payment record. Use this only for errors.",
    DEACTIVATE_USER: "Are you sure you want to DEACTIVATE this account?",
    ACTIVATE_USER: "Are you sure you want to ACTIVATE this account?",
  },
  details: {
    TITLE: "Details View",
    PAYMENT_DETAILS: "Payment Details",
    ORDER_DETAILS: "Order Details",
    ACTIVITY_DETAILS: "Activity Details",
  },
} as const;
