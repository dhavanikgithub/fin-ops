import App from "@/components/App";
import BanksScreen from "./BanksScreen";
import { navItemsObject } from "@/components/NavbarItems";

export default function Page() {
    return (
        <App activeHref={navItemsObject.Banks.href || ''}>
            <BanksScreen/>
        </App>
    );
}
