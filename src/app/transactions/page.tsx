import App from "@/components/App";
import TransactionScreen from "@/app/transactions/TransactionsScreen";
import AddDepositScreen from "./AddDeposit";
import AddWithdrawScreen from "./AddWithdraw";

export default function Page() {
    return (
        <App activeHref="/transactions">
            <TransactionScreen />
        </App>
    );
}
