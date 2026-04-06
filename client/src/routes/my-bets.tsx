import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { rootRoute } from "./root";

export const myBetsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/my-bets",
  validateSearch: (search: Record<string, unknown>) => ({
    tab: typeof search.tab === "string" ? search.tab : "normal",
    filter: typeof search.filter === "string" ? search.filter : "all",
    page: typeof search.page === "string" ? search.page : "1",
  }),
  component: lazyRouteComponent(() => import("@/features/user/pages/my-bets")),
});
