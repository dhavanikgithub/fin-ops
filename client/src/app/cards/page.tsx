import App from "@/components/App";
import CardsScreen from "./CardsScreen";
import { navItemsObject } from "@/components/NavbarItems";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Cards", // Will display as "FinOps - Cards"
};
export default function Page() {
    return (
        <App activeHref={navItemsObject.Cards?.href || ''}>
            <CardsScreen />
        </App>
    );
}
