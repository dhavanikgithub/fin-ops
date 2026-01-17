import CalculatorScreen from "./SimpleCalculatorScreen";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Simple Calculator", // Will display as "FinOps - Simple Calculator"
};
export default function Page() {
    return (
        <CalculatorScreen/>
    );
}
