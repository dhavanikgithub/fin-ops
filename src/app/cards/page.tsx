import App from "@/components/App";
import CardsScreen from "./CardsScreen";

export default function Page() {
    return (
        <App activeHref="/cards">
            <CardsScreen />
        </App>
    );
}
