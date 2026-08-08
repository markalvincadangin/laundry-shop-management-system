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
import { dynamic } from "./dynamic";
import { remoteAccess } from "./remote-access";

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
import { machines } from "./modules/machines";
import { settings } from "./modules/settings";

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
  dynamic,
  remoteAccess,
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
    machines,
    settings,
  },
} as const;

export type UiLabels = typeof UI_LABELS;
