import App from "@/components/App";
import FinkedaScreen from "./FinkedaScreen";
import { navItemsObject } from "@/components/NavbarItems";
import finkedaSettingsService, { FinkedaSettings } from "@/services/finkedaSettingsService";

async function getInitialSettings(): Promise<FinkedaSettings | null> {
  try {
    return await finkedaSettingsService.getLatestSettings();
  } catch (error) {
    console.error('Failed to fetch initial finkeda settings:', error);
    return null;
  }
}

export default async function Finkeda() {
  const initialSettings = await getInitialSettings();

  return (
      <App activeHref={navItemsObject.SpecialCalculators?.subItems?.Finkeda.href || ''}>
        <FinkedaScreen initialSettings={initialSettings} />
      </App>
  );
}
