import App from "@/components/App";
import CalculatorScreen from "./SimpleCalculatorScreen";
import { navItemsObject } from "@/components/NavbarItems";

export default function Page() {
    return (
        <App activeHref={navItemsObject.SpecialCalculators?.subItems?.Simple.href || ''}>
        <CalculatorScreen/>
        </App>
    );
}
