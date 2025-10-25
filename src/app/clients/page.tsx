import App from "@/components/App";
import ClientsScreen from "./ClientsScreen";
import { navItemsObject } from "@/components/NavbarItems";

export default function Page() {
    return (
        <App activeHref={navItemsObject.Clients.href || ''}>
            <ClientsScreen />
        </App>
    );
}
