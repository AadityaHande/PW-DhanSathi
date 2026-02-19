# **App Name**: AlgoSave

## Core Features:

- Goal Creation: Form to create savings goals with name, target amount (ALGO), and deadline; automatically assigns createdAt, currentSaved = 0, status = 'active'; stores data in Firestore and redirects to dashboard.
- Dashboard View: Displays all goals from Firestore as cards showing goal name, target amount, amount saved, progress bar, status badge, and a 'View Details' button.
- Goal Detail Page: Detailed view showing goal metadata, total saved amount, deposit list (chronological), deposit button (mock), horizontal progress bar, and line chart visualizing savings over time.
- Deposit Simulation: Simulates a deposit; user enters amount, increases currentSaved, appends a deposit object with amount, timestamp, and mockTxId, and updates Firestore. Contains clearly structured tool to later incorporate Algorand transactions.
- Achievement Logic: Automatically assigns achievements ('First Deposit', '50% Saver', 'Goal Completed') based on savings progress and stores achievements per goal in Firestore.
- Placeholder functions: Functions such as connectWallet(), sendAlgoTransaction(amount), fetchOnChainBalance() that return mock values.

## Style Guidelines:

- Primary color: Dark Blue (#3498db) for a sense of trust and security.
- Background color: Very light blue (#f0f8ff) to maintain a clean and student-friendly feel.
- Accent color: Teal (#2ecc71) to highlight progress and success states, reinforcing the app's savings-oriented purpose.
- Body and headline font: 'Inter' for a modern and readable experience. 'Inter' is a grotesque-style sans-serif font that brings a machined and objective feel.
- Use simple, clean icons from a set like Font Awesome or Material Design to represent different features and actions.
- Emphasize a card-based layout for goals, a horizontal progress bar, and a line chart showing savings over time to clearly visualize data.
- Use subtle animations and transitions to provide feedback on user actions and create a more engaging experience.