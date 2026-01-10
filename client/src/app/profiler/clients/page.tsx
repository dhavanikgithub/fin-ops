import App from "@/components/App";
import ProfilerClientsScreen from './ProfilerClientsScreen';
import { navItemsObject } from "@/components/NavbarItems";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Profiler - Clients",
};

export default function ProfilerClientsPage() {
    return (
        <App activeHref={navItemsObject.Profiler.subItems?.Clients.href || ''}>
            <ProfilerClientsScreen />
        </App>
    );
}
