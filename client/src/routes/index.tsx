import { createRoute, redirect } from "@tanstack/react-router";
import { rootRoute } from "./root";

function getLandingPath(): "/admin" | "/user" {
  try {
    const storedUser = localStorage.getItem("betwise-auth-user");
    if (!storedUser) {
      return "/user";
    }

    const parsedUser = JSON.parse(storedUser) as { role?: string };
    return parsedUser.role === "ADMIN" ? "/admin" : "/user";
  } catch {
    return "/user";
  }
}

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: getLandingPath() });
  },
});
