import App from "@/components/App";
import ClientsScreen from "./ClientsScreen";
import { navItemsObject } from "@/components/NavbarItems";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Clients", // Will display as "FinOps - Clients"
};
export default function Page() {
    return (
        <App activeHref={navItemsObject.Clients.href || ''}>
            <ClientsScreen />
        </App>
    );
}
