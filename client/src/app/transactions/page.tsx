import App from "@/components/App";
import TransactionScreen from "@/app/transactions/TransactionsScreen";
import { navItemsObject } from "@/components/NavbarItems";

export default function Page() {
    return (
        <App activeHref={navItemsObject.Transactions.href || ''}>
            <TransactionScreen />
        </App>
    );
}
