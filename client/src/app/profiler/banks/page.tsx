import ProfilerBanksScreen from './ProfilerBanksScreen';
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Profiler - Banks",
};

export default function ProfilerBanksPage() {
    return (
        <ProfilerBanksScreen />
    );
}
