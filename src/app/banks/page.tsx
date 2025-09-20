import App from "@/components/App";
import BanksScreen from "./BanksScreen";

export default function Page() {
    return (
        <App activeHref="/banks">
            <BanksScreen/>
        </App>
    );
}
