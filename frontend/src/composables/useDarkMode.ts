import { ref, watch, onMounted } from "vue";

const isDark = ref(false);

export function useDarkMode() {
  onMounted(() => {
    const saved = localStorage.getItem("makutalk-dark-mode");

    if (saved !== null) {
      isDark.value = saved === "true";
    } else {
      isDark.value = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    applyDarkMode(isDark.value);
  });

  watch(isDark, (val) => {
    applyDarkMode(val);
    localStorage.setItem("makutalk-dark-mode", String(val));
  });

  function applyDarkMode(val: boolean) {
    if (val) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  function toggleDarkMode() {
    isDark.value = !isDark.value;
  }

  return {
    isDark,
    toggleDarkMode,
  };
}
