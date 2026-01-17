import ProfilerClientsScreen from './ProfilerClientsScreen';
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Profiler - Clients",
};

export default function ProfilerClientsPage() {
    return (
        <ProfilerClientsScreen />
    );
}
