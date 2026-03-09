import React, { createContext, useContext, useMemo } from "react";

import type { RouteKey } from "./types";

type NavigationContextValue = {
  activeRoute: RouteKey;
  navigate: (route: RouteKey) => void;
};

const NavigationContext = createContext<NavigationContextValue | undefined>(undefined);

type NavigationProviderProps = React.PropsWithChildren<NavigationContextValue>;

export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  activeRoute,
  navigate,
  children,
}) => {
  const value = useMemo(
    () => ({
      activeRoute,
      navigate,
    }),
    [activeRoute, navigate],
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
};

export const useAppNavigation = (): NavigationContextValue => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useAppNavigation must be used within NavigationProvider");
  }
  return context;
};
