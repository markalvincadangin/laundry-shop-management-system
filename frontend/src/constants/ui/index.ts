import { meta } from "./meta";
import { shared } from "./shared";
import { layout } from "./layout";
import { feedback } from "./feedback";
import { portal } from "./portal";
import { auth } from "./auth";
import { forms } from "./forms";
import { modals } from "./modals";
import { pagination } from "./pagination";
import { services } from "./services";

// Modules
import { dashboard } from "./modules/dashboard";
import { orders } from "./modules/orders";
import { customers } from "./modules/customers";
import { payments } from "./modules/payments";
import { reports } from "./modules/reports";
import { auditLog } from "./modules/audit-log";
import { users } from "./modules/users";
import { rates } from "./modules/rates";
import { clientAlerts } from "./modules/client-alerts";

export const UI_LABELS = {
  meta,
  shared,
  units: shared.units,
  layout,
  feedback,
  portal,
  auth,
  forms,
  modals,
  pagination,
  services,
  modules: {
    dashboard,
    orders,
    customers,
    payments,
    reports,
    auditLog,
    users,
    rates,
    clientAlerts,
  },
} as const;

export type UiLabels = typeof UI_LABELS;
