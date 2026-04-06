import { createRoute, redirect } from "@tanstack/react-router";
import { rootRoute } from "./root";

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    // Get user from localStorage to check role without making API call
    const persistedUserJson =
      typeof window !== "undefined"
        ? window.localStorage.getItem("betixpro-auth-user")
        : null;

    if (persistedUserJson) {
      try {
        const user = JSON.parse(persistedUserJson);
        if (user && typeof user === "object" && "role" in user) {
          if (user.role === "ADMIN") {
            throw redirect({ to: "/admin" });
          }
          if (user.role === "USER") {
            throw redirect({ to: "/user" });
          }
        }
      } catch (error) {
        // Re-throw redirect errors so they can be handled by the router
        throw error;
      }
    }
    // If not authenticated, stay on home
  },
});
