import App from "@/components/App";
import CalculatorScreen from "./SimpleCalculatorScreen";
import { navItemsObject } from "@/components/NavbarItems";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Simple Calculator", // Will display as "FinOps - Simple Calculator"
};
export default function Page() {
    return (
        <App activeHref={navItemsObject.SpecialCalculators?.subItems?.Simple.href || ''}>
        <CalculatorScreen/>
        </App>
    );
}
