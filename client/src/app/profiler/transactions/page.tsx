import ProfilerTransactionsScreen from './ProfilerTransactionsScreen';
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Profiler - Transactions",
};

export default function ProfilerTransactionsPage() {
    return (
        <ProfilerTransactionsScreen />
    );
}
