import {
  Navigate,
  Outlet,
  createRoute,
  lazyRouteComponent,
} from "@tanstack/react-router";
import { userRoute } from "./route";

function LegacyUserBetsRedirect() {
  return (
    <Navigate
      to="/my-bets"
      search={{
        tab: "normal",
        filter: "all",
        page: "1",
      }}
    />
  );
}

const userIndexLayoutRoute = createRoute({
  getParentRoute: () => userRoute,
  id: "user-index-layout",
  component: Outlet,
});

const userHomePageRoute = createRoute({
  getParentRoute: () => userIndexLayoutRoute,
  path: "/",
  component: lazyRouteComponent(() => import("@/features/user/home")),
});

const userBetsPageRoute = createRoute({
  getParentRoute: () => userIndexLayoutRoute,
  path: "/bets",
  component: LegacyUserBetsRedirect,
});

export const userIndexRoute = userIndexLayoutRoute.addChildren([
  userHomePageRoute,
  userBetsPageRoute,
]);
