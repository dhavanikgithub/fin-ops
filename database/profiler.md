## 📌 Application Purpose & Feature Requirement Prompt

**Prompt:**

> Design and describe a financial profiling application whose primary purpose is to help users manage clients, create multiple financial profiles per client, and track deposit and withdrawal transactions against pre-planned deposit amounts.
>
> The application must allow users to create and manage **clients**, where each client can have **multiple independent profiles** over time. Each profile represents a separate financial plan (for example, a credit-card–based deposit plan) and must maintain its own balance, transactions, and completion state.
>
> The system should support **negative balances**, profile closure, and carry-forward logic, while ensuring all transactions are always linked to the correct profile.

---

## 🎯 Core Functional Requirements

### 1. Client Management

* Allow users to create, view, update, and list clients.
* Each client must store:

  * Name
  * Email
  * Mobile number
  * Aadhaar card number
  * Aadhaar card image
  * Notes

* View or list clients
    * Pagination
    * Infinite scroll support
    * Sort
    * Filters (with multi select support)
    * Search by Name or email or mobile number or Aadhaar card number or Notes 
---

### 2. Credit Card Bank Management

* Allow users to create and manage a list of credit card banks.
* Each bank must contain:

  * Bank name
* Banks should be selectable during client profile creation.
* View or list Credit Card Bank
    * Pagination
    * Infinite scroll support
    * Sort
    * Filters (with multi select support)
    * Search by Name or email or mobile number or Aadhaar card number or Notes
---

### 3. Client Profile Management

* Allow users to create **multiple profiles per client** at any time.
* Each profile must include:

  * Selection of a pre-created client
  * Credit card bank selection
  * Credit card number
  * Pre-planned deposit amount (₹)
  * Carry-forward toggle (on/off)
  * Notes
* Each profile must maintain:

  * Current balance
  * Profile status: **Active** or **Marked as Done (Cleared)**
* Profiles must be independent, even for the same client.
* Users must be able to **mark a profile as done**, after which it is considered closed and excluded from active dashboards.
* A single client may have **multiple profiles**, even with the same or different pre-planned deposit amounts or Credit card number or Credit card bank.

* View or list Client Profile
    * Pagination
    * Infinite scroll support
    * Sort
    * Filters (with multi select support)
    * Search by Name or email or mobile number or Aadhaar card number or Notes
---

### 4. Transaction Management

* The system must support two transaction types:

  * **Deposit**
  * **Withdraw**
* Each transaction must always belong to **one specific client profile**.

* View or list Transaction
    * Pagination
    * Infinite scroll support
    * Sort
    * Filters (with multi select support)
    * Search by Name or email or mobile number or Aadhaar card number or Notes

#### Deposit Transaction

* Fields:

  * Client profile selection
  * Deposit amount (₹)
  * Notes
* Logic:

  * Deposit amount must be **deducted from the profile’s pre-planned balance**.

#### Withdraw Transaction

* Fields:

  * Client profile selection
  * Withdraw amount (₹)
  * Withdraw charges (percentage)
  * Notes

* Logic:

  * Withdraw amount plus charges must be **deducted from the profile’s balance**.

* Profiles must allow balances to go **negative**.

---

### 5. Profile-Level Transaction Access

* From the **client profile detail screen**, users must be able to:

  * Add deposit transactions
  * Add withdraw transactions
  * View the full transaction history for that profile

---

### 6. Carry-Forward Logic

* Each profile must include a carry-forward option:

  * **Enabled**: Remaining balance may be logically reused when creating a new profile.
  * **Disabled**: New profiles always start fresh with a new pre-planned deposit amount.

---

### 7. Dashboard

* Provide a dashboard view that displays:

  * Only **active client profiles**
  * Profiles where the remaining balance is **greater than zero**
  * Profiles that are **not marked as done**
* Dashboard should provide quick access to:

  * Profile details
  * Transaction creation

---

### 8. Data Integrity & Tracking

* All transactions must be permanently linked to their respective profiles.
* Clearing a profile must not affect historical transactions.
* Profile closure must preserve final balance and closure date.
* System must ensure accurate balance calculations at all times.

---

### ✅ Expected Outcome

The application should function as a **client-centric financial profiling and transaction tracking system**, enabling users to:

* Manage clients securely
* Create multiple independent financial profiles per client
* Track deposits and withdrawals accurately
* Support negative balances and profile closures
* Maintain clean financial history and reporting
* View actionable data via a focused dashboard

---

