import App from "@/components/App";
import ProfileTransactionScreen from './ProfileTransactionScreen';
import { navItemsObject } from "@/components/NavbarItems";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Profiler - Profile Transactions",
};

export default function ProfileTransactionPage() {
    return (
        <App activeHref={navItemsObject.Profiler.subItems?.Profiles.href || ''}>
            <ProfileTransactionScreen />
        </App>
    );
}
