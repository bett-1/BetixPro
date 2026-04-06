import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { myBetsRoute } from "./my-bets";

export const myBetDetailRoute = createRoute({
  getParentRoute: () => myBetsRoute,
  path: "/$betId",
  component: lazyRouteComponent(
    () => import("@/features/user/pages/my-bet-detail"),
  ),
});
