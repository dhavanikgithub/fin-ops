import App from "@/components/App";
import TransactionScreen from "@/app/transactions/TransactionsScreen";

export default function Page() {
    return (
        <App activeHref="/transactions">
            <TransactionScreen />
        </App>
    );
}
