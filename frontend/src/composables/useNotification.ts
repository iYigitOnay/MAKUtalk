import { ref } from 'vue';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

const notifications = ref<Notification[]>([]);
let nextId = 0;

export function useNotification() {
  const showNotification = (message: string, type: NotificationType = 'info', duration = 3000) => {
    const id = nextId++;
    notifications.value.push({ id, message, type });

    setTimeout(() => {
      removeNotification(id);
    }, duration);
  };

  const removeNotification = (id: number) => {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  };

  return {
    notifications,
    showNotification,
    removeNotification,
  };
}
