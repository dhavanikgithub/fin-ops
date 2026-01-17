import TransactionScreen from "@/app/transactions/TransactionsScreen";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Transactions", // Will display as "FinOps - Transactions"
};
export default function Page() {
    return (
        <TransactionScreen />
    );
}
