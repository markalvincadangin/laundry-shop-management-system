/**
 * Notifications API module.
 */

import { apiClient } from "./client";
import type { components } from "@/types/api.generated";

export type NotificationResponse =
  components["schemas"]["NotificationResponse"];

export const notificationsApi = {
  list: () => apiClient.get<NotificationResponse[]>("/v1/notifications"),
};
