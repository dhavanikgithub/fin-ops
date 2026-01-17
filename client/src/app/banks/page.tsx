import BanksScreen from "./BanksScreen";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Banks", // Will display as "FinOps - Banks"
};
export default function Page() {
    return (
        <BanksScreen/>
    );
}
