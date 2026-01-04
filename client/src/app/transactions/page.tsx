import App from "@/components/App";
import TransactionScreen from "@/app/transactions/TransactionsScreen";
import { navItemsObject } from "@/components/NavbarItems";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Transactions", // Will display as "FinOps - Transactions"
};
export default function Page() {
    return (
        <App activeHref={navItemsObject.Transactions.href || ''}>
            <TransactionScreen />
        </App>
    );
}
