import ProfileTransactionScreen from './ProfileTransactionScreen';
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Profiler - Profile Transactions",
};

export default function ProfileTransactionPage() {
    return (
        <ProfileTransactionScreen />
    );
}
