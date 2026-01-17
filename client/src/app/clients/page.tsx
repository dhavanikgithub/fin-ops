import ClientsScreen from "./ClientsScreen";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Clients", // Will display as "FinOps - Clients"
};
export default function Page() {
    return (
        <ClientsScreen />
    );
}
