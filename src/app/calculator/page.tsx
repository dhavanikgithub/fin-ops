import App from "@/components/App";
import CalculatorScreen from "./CalculatorScreen";

export default function Page() {
    return (
        <App activeHref="/calculator">
        <CalculatorScreen/>
        </App>
    );
}
