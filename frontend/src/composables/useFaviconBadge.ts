import { watch, onMounted } from "vue";
import { useNotificationsStore } from "@/stores/notifications";
import { useChatStore } from "@/stores/chat";

export function useFaviconBadge() {
  const notificationsStore = useNotificationsStore();
  const chatStore = useChatStore();

  const originalFavicon = "/makutalklogo.png"; // Proje logosu
  const colors: Record<string, string> = {
    MESSAGE: "#3b82f6", // Mavi
    LIKE: "#ef4444", // Kırmızı
    COMMENT: "#f59e0b", // Turuncu
    FOLLOW: "#a855f7", // Mor
    MENTION: "#ec4899", // Pembe
    REPOST: "#10b981", // Yeşil
    DEFAULT: "#ef4444", // Standart Kırmızı
  };

  const updateFavicon = (color: string, count: number) => {
    const favicon = document.querySelector(
      'link[rel="icon"]',
    ) as HTMLLinkElement;
    if (!favicon) return;

    if (count === 0) {
      favicon.href = originalFavicon;
      document.title = "MAKUtalk";
      return;
    }

    // Canvas ile yeni favicon çizimi
    const img = new Image();
    img.src = originalFavicon;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Orijinal ikonu çiz
      ctx.drawImage(img, 0, 0, 32, 32);

      // Sağ üst köşeye bildirim noktası çiz
      ctx.beginPath();
      ctx.arc(24, 8, 7, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      favicon.href = canvas.toDataURL("image/x-icon");
      document.title = `(${count}) MAKUtalk`;
    };
  };

  // Bildirimleri izle
  watch(
    [
      () => notificationsStore.unreadCount,
      () => chatStore.unreadCount,
      () => notificationsStore.activeNotifications,
    ],
    ([notifCount, chatCount, activeNotifs]) => {
      const totalCount = notifCount + chatCount;

      // En son gelen bildirimin rengini belirle
      let dotColor = colors.DEFAULT;
      if (activeNotifs.length > 0) {
        const latest = activeNotifs[activeNotifs.length - 1];
        if (latest.displayType === "MESSAGE") {
          dotColor = colors.MESSAGE;
        } else if (latest.type) {
          dotColor = colors[latest.type] || colors.DEFAULT;
        }
      } else if (chatCount > 0) {
        dotColor = colors.MESSAGE;
      }

      updateFavicon(dotColor, totalCount);
    },
    { deep: true },
  );

  // Başlangıçta izin iste (Browser Notifications)
  const requestPermission = async () => {
    if ("Notification" in window) {
      if (
        Notification.permission !== "granted" &&
        Notification.permission !== "denied"
      ) {
        await Notification.requestPermission();
      }
    }
  };

  return { requestPermission };
}
