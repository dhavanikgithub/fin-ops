import App from "@/components/App";
import ClientsScreen from "./ClientsScreen";

export default function Page() {
    return (
        <App activeHref="/clients">
            <ClientsScreen />
        </App>
    );
}
