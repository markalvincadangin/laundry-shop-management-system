export const settings = {
  TITLE: "System Settings",
  SYSTEM_PAUSE: {
    TOGGLE_TOOLTIP_ACTIVE: "System is currently active. Click to pause operations (e.g., during power interruption).",
    TOGGLE_TOOLTIP_PAUSED: "System is currently paused. Click to resume operations.",
    BTN_ACTIVE: "System Active",
    BTN_PAUSED: "System Paused",
    BANNER_TITLE: "Power Interruption / System Paused",
    BANNER_DESC: "System operations are currently paused. Washing and drying machines cannot be started or advanced.",
    RESUME_BTN: "Resume Operations",
    MODAL_TITLE: "Pause System Operations?",
    MODAL_DESC: "This will immediately lock all washing and drying lanes. Staff will not be able to advance orders until the system is resumed. Are you sure you want to pause the system?",
    MODAL_CONFIRM: "Pause System",
    MODAL_CANCEL: "Cancel",
  },
  ORDER_CARD: {
    ACTION_DISABLED_PAUSED: "System is paused. Operations are locked.",
    BTN_SYSTEM_PAUSED: "System Paused",
  }
} as const;
