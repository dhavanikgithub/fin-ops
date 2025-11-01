import App from "@/components/App";
import CardsScreen from "./CardsScreen";
import { navItemsObject } from "@/components/NavbarItems";

export default function Page() {
    return (
        <App activeHref={navItemsObject.Cards?.href || ''}>
            <CardsScreen />
        </App>
    );
}
