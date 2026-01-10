import App from "@/components/App";
import ProfilerBanksScreen from './ProfilerBanksScreen';
import { navItemsObject } from "@/components/NavbarItems";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Profiler - Banks",
};

export default function ProfilerBanksPage() {
    return (
        <App activeHref={navItemsObject.Profiler.subItems?.Banks.href || ''}>
            <ProfilerBanksScreen />
        </App>
    );
}
