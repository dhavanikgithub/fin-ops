import App from "@/components/App";
import ProfilerTransactionsScreen from './ProfilerTransactionsScreen';
import { navItemsObject } from "@/components/NavbarItems";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Profiler - Transactions",
};

export default function ProfilerTransactionsPage() {
    return (
        <App activeHref={navItemsObject.Profiler.subItems?.Transactions.href || ''}>
            <ProfilerTransactionsScreen />
        </App>
    );
}
