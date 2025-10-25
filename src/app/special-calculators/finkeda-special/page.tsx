import App from "@/components/App";
import FinkedaScreen from "./FinkedaScreen";
import { navItemsObject } from "@/components/NavbarItems";

export default function Finkeda() {
  return (
      <App activeHref={navItemsObject.SpecialCalculators?.subItems?.Finkeda.href || ''}>
        <FinkedaScreen />
      </App>
  );
}
