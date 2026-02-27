import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ── AUTH ──────────────────────────────────────────────
    {
      path: "/auth",
      name: "Auth",
      component: () => import("@/views/Auth.vue"),
      meta: { guest: true, layout: "auth" },
    },
    // Eski URL'leri /auth'a yönlendir
    { path: "/login", redirect: "/auth" },
    { path: "/register", redirect: "/auth" },

    // ── ANA SAYFALAR ──────────────────────────────────────
    {
      path: "/",
      name: "Home",
      component: () => import("@/views/Home.vue"),
      meta: { requiresAuth: true, layout: "main" },
    },
    {
      path: "/search",
      name: "Search",
      component: () => import("@/views/Search.vue"),
      meta: { layout: "main" },
    },
    {
      path: "/notifications",
      name: "Notifications",
      component: () => import("@/views/Notifications.vue"),
      meta: { requiresAuth: true, layout: "main" },
    },
    {
      path: "/requests",
      name: "FollowRequests",
      component: () => import("@/views/FollowRequests.vue"),
      meta: { requiresAuth: true, layout: "main" },
    },
    {
      path: "/messages",
      name: "Messages",
      component: () => import("@/views/Messages.vue"),
      meta: { requiresAuth: true, layout: "main" },
    },
    {
      path: "/messages/:id",
      name: "MessageDetail",
      component: () => import("@/views/Messages.vue"),
      meta: { requiresAuth: true, layout: "main" },
    },
    {
      path: "/settings",
      name: "Settings",
      component: () => import("@/views/Settings.vue"),
      meta: { requiresAuth: true, layout: "main" },
    },
    {
      path: "/profile/:id?",
      name: "Profile",
      component: () => import("@/views/Profile.vue"),
      meta: { layout: "main" },
    },
    {
      path: "/my-profile",
      redirect: (_to) => {
        const authStore = useAuthStore();
        return authStore.user ? `/profile/${authStore.user.username}` : "/auth";
      },
    },
    {
      path: "/my-posts",
      component: () => import("@/views/MyPosts.vue"),
      meta: { requiresAuth: true, layout: "main" },
    },
    {
      path: "/post/:id",
      name: "PostDetail",
      component: () => import("@/views/PostDetail.vue"),
      meta: { layout: "main" },
    },
    {
      path: "/hashtag/:name",
      name: "Hashtag",
      component: () => import("@/views/HashtagPage.vue"),
      meta: { layout: "main" },
    },
    {
      path: "/admin",
      name: "Admin",
      component: () => import("@/views/Admin.vue"),
      meta: { requiresAuth: true, layout: "main" },
      beforeEnter: (to, from, next) => {
        const authStore = useAuthStore();
        if (authStore.user?.role === 'ADMIN' || authStore.user?.email === '2312101063@ogr.mehmetakif.edu.tr') {
          next();
        } else {
          next('/');
        }
      }
    },
    {
      path: "/academic",
      name: "Academic",
      component: () => import("@/views/Academic.vue"),
      meta: { requiresAuth: true, layout: "main" },
      beforeEnter: (to, from, next) => {
        const authStore = useAuthStore();
        if (authStore.user?.role === 'ACADEMIC') {
          next();
        } else {
          next('/');
        }
      }
    },
    {
      path: "/campus",
      name: "Campus",
      component: () => import("@/views/Campus.vue"),
      meta: { requiresAuth: true, layout: "main" },
    },
    {
      path: "/campus/clubs",
      name: "Clubs",
      component: () => import("@/views/Clubs.vue"),
      meta: { requiresAuth: true, layout: "main" },
    },
    {
      path: "/campus/clubs/:slug",
      name: "ClubDetail",
      component: () => import("@/views/ClubDetail.vue"),
      meta: { requiresAuth: true, layout: "main" },
    },

    // ── 404 ───────────────────────────────────────────────
    {
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next("/auth");
  } else if (to.meta.guest && authStore.isAuthenticated) {
    next("/");
  } else {
    next();
  }
});

export default router;
