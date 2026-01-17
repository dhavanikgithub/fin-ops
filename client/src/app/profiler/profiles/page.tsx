import ProfilerProfilesScreen from './ProfilerProfilesScreen';
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Profiler - Profiles",
};

export default function ProfilerProfilesPage() {
    return (
        <ProfilerProfilesScreen />
    );
}
