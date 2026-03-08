import React from "react";

import RootNavigator from "./navigation/RootNavigator";
import { DatabaseProvider } from "./providers/DatabaseProvider";
import { NotificationProvider } from "./providers/NotificationProvider";
import { SubscriptionProvider } from "./providers/SubscriptionProvider";
import { ThemeProvider } from "./providers/ThemeProvider";

const App: React.FC = () => {
  return (
    <DatabaseProvider>
      <SubscriptionProvider>
        <ThemeProvider>
          <NotificationProvider>
            <RootNavigator />
          </NotificationProvider>
        </ThemeProvider>
      </SubscriptionProvider>
    </DatabaseProvider>
  );
};

export default App;
