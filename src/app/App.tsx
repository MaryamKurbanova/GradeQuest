import React from "react";

import RootNavigator from "./navigation/RootNavigator";
import { AppSettingsProvider } from "./providers/AppSettingsProvider";
import { CalculatorProvider } from "./providers/CalculatorProvider";
import { CelebrationProvider } from "./providers/CelebrationProvider";
import { DatabaseProvider } from "./providers/DatabaseProvider";
import { GamificationProvider } from "./providers/GamificationProvider";
import { NotificationProvider } from "./providers/NotificationProvider";
import { StudyDataProvider } from "./providers/StudyDataProvider";
import { SubscriptionProvider } from "./providers/SubscriptionProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import { WidgetProvider } from "./providers/WidgetProvider";

const App: React.FC = () => {
  return (
    <DatabaseProvider>
      <SubscriptionProvider>
        <AppSettingsProvider>
          <ThemeProvider>
            <NotificationProvider>
              <CalculatorProvider>
                <StudyDataProvider>
                  <GamificationProvider>
                    <WidgetProvider>
                      <CelebrationProvider>
                        <RootNavigator />
                      </CelebrationProvider>
                    </WidgetProvider>
                  </GamificationProvider>
                </StudyDataProvider>
              </CalculatorProvider>
            </NotificationProvider>
          </ThemeProvider>
        </AppSettingsProvider>
      </SubscriptionProvider>
    </DatabaseProvider>
  );
};

export default App;
