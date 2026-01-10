import App from "@/components/App";
import ProfilerDashboard from './ProfilerDashboard';
import { navItemsObject } from "@/components/NavbarItems";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Profiler", // Will display as "FinOps - Profiler"
};

export default function ProfilerPage() {
    return (
        <App activeHref={navItemsObject.Profiler.subItems?.Dashboard.href || ''}>
            <ProfilerDashboard />
        </App>
    );
}
