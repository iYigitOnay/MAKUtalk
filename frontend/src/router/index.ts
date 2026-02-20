import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "Home",
      component: () => import("@/views/Home.vue"),
    },
    {
      path: "/login",
      name: "Login",
      component: () => import("@/views/Login.vue"),
      meta: { guest: true },
    },
    {
      path: "/register",
      name: "Register",
      component: () => import("@/views/Register.vue"),
      meta: { guest: true },
    },
    {
      path: "/profile",
      name: "Profile",
      component: () => import("@/views/Profile.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/my-posts",
      name: "MyPosts",
      component: () => import("@/views/MyPosts.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/search",
      name: "Search",
      component: () => import("@/views/Search.vue"),
    },
    {
      path: "/user/:id",
      name: "UserProfile",
      component: () => import("@/views/UserProfile.vue"),
    },
    {
      path: "/hashtag/:name",
      name: "Hashtag",
      component: () => import("@/views/HashtagPage.vue"),
    },
  ],
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next("/login");
  } else if (to.meta.guest && authStore.isAuthenticated) {
    next("/");
  } else {
    next();
  }
});

export default router;
