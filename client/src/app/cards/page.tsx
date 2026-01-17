import CardsScreen from "./CardsScreen";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Cards", // Will display as "FinOps - Cards"
};
export default function Page() {
    return (
        <CardsScreen />
    );
}
