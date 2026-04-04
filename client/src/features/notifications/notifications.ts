import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/axiosConfig";
import { useAuth } from "@/context/AuthContext";
import {
  notificationUpdateBrowserEvent,
  type NotificationStreamEvent,
} from "@/features/user/payments/wallet";

export type AppNotification = {
  id: string;
  audience: "USER" | "ADMIN";
  type: "DEPOSIT_SUCCESS" | "DEPOSIT_FAILED" | "SYSTEM";
  title: string;
  message: string;
  transactionId?: string | null;
  amount?: number | null;
  balance?: number | null;
  mpesaCode?: string | null;
  isRead: boolean;
  createdAt: string;
};

export type AppNotificationsResponse = {
  notifications: AppNotification[];
  unreadCount: number;
};

export const appNotificationsQueryKey = ["app-notifications"] as const;

export function useAppNotifications(take = 20) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const handleNotificationUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<NotificationStreamEvent>;
      const payload = customEvent.detail;

      if (!payload) {
        return;
      }

      queryClient.setQueryData<AppNotificationsResponse>(
        [...appNotificationsQueryKey, take],
        (current) => {
          if (!current) {
            return current;
          }

          const syntheticId =
            payload.notificationId ??
            `${payload.audience}-${payload.transactionId ?? "sys"}-${payload.createdAt}`;

          const alreadyExists = current.notifications.some(
            (item) => item.id === syntheticId,
          );

          if (alreadyExists) {
            return current;
          }

          const nextNotification: AppNotification = {
            id: syntheticId,
            audience: payload.audience,
            type: payload.type,
            title: payload.title,
            message: payload.message,
            transactionId: payload.transactionId,
            amount: payload.amount,
            balance: payload.balance,
            mpesaCode: payload.mpesaCode,
            isRead: false,
            createdAt: payload.createdAt,
          };

          return {
            unreadCount: current.unreadCount + 1,
            notifications: [nextNotification, ...current.notifications].slice(
              0,
              take,
            ),
          };
        },
      );
    };

    window.addEventListener(
      notificationUpdateBrowserEvent,
      handleNotificationUpdate,
    );

    return () => {
      window.removeEventListener(
        notificationUpdateBrowserEvent,
        handleNotificationUpdate,
      );
    };
  }, [isAuthenticated, queryClient, take]);

  return useQuery({
    queryKey: [...appNotificationsQueryKey, take],
    enabled: isAuthenticated,
    queryFn: async () => {
      const { data } = await api.get<AppNotificationsResponse>(
        `/notifications?take=${take}`,
      );

      return data;
    },
    staleTime: 10_000,
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return async () => {
    await api.patch("/notifications/read-all");
    await queryClient.invalidateQueries({ queryKey: appNotificationsQueryKey });
  };
}
