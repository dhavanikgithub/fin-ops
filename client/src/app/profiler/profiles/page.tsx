import App from "@/components/App";
import ProfilerProfilesScreen from './ProfilerProfilesScreen';
import { navItemsObject } from "@/components/NavbarItems";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Profiler - Profiles",
};

export default function ProfilerProfilesPage() {
    return (
        <App activeHref={navItemsObject.Profiler.subItems?.Profiles.href || ''}>
            <ProfilerProfilesScreen />
        </App>
    );
}
