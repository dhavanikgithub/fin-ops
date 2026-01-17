import ProfilerDashboard from './ProfilerDashboard';
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Profiler", // Will display as "FinOps - Profiler"
};

export default function ProfilerPage() {
    return (
        <ProfilerDashboard />
    );
}
