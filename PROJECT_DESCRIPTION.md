# Project Description

**Deployed Frontend URL:** [TODO: Link to your deployed frontend]

**Solana Program ID:** DthHhMcvU2VX1uT8HUCbqBjbjC3hktVyPpUPSUxmKtMa

## Project Overview

### Description
This project is a decentralized "Tip Jar" application built on the Solana blockchain. It allows content creators to establish a personal "tip jar" to receive tips in SOL from their supporters (tippers). The dApp consists of a Solana program (backend) that manages the logic and state, and a Next.js web application (frontend) for user interaction.

Creators can initialize their own tip jar, which is represented by a unique account on the blockchain. They can then view a history of all tips they have received.

Tippers can browse a list of all available tip jars, select a creator they wish to support, and send a specific amount of SOL as a tip. The application also keeps a record of each tip sent by a user, allowing them to track their own tipping history. Tippers also have the option to delete their personal tipping record for a specific jar, which closes the associated blockchain account and returns the rent exemption lamports to them.

### Key Features
- **For Creators:**
  - **Create a Tip Jar:** A creator can create a unique, on-chain tip jar associated with their wallet address.
  - **View Received Tips:** Creators can see a list of all tips they have received, including the tipper's address and the total amount tipped from that address.

- **For Tippers:**
  - **Discover Creators:** Tippers can view a list of all existing tip jars to find creators to support.
  - **Send Tips:** Tippers can send SOL to any creator's tip jar.
  - **Track Tipping History:** Tippers can view a history of all the tips they have sent to various creators.
  - **Delete Tip Record:** Tippers can delete their tipping history for a specific jar, reclaiming the SOL used for account rent.
  
### How to Use the dApp
1. **Connect Wallet:** Both creators and tippers must first connect their Solana wallet (e.g., Phantom) to the web application.

2. **For Creators (Creator Space):**
   - Navigate to the "Creator Space" page.
   - If you don't have a tip jar, click the "Create Tip Jar" button. This will prompt you to approve a transaction to create your on-chain account.
   - Once the tip jar is created, its address will be displayed.
   - Any tips you receive will appear in the "Tip Records" section, showing the tipper's address and the amount they've tipped in total.

3. **For Tippers (Tipper Space):**
   - Navigate to the "Tipper Space" page.
   - Browse the "Available Tip Jars" list to find a creator you want to tip.
   - Click "Select to Tip" on the desired jar. The jar's address will populate in the tipping form.
   - Enter the amount of SOL you wish to tip in the "Amount (SOL)" field.
   - Click "Tip Creator" and approve the transaction in your wallet.
   - Your tipping history is displayed under "Your Tip History". You can delete any of these records by clicking "Delete Record".

## Program Architecture
The Solana program is built with Anchor and manages two primary account types: `TipJar` and `TipRecord`. The program logic is exposed through three main instructions that the frontend calls to interact with the blockchain.

### PDA Usage
Program Derived Addresses (PDAs) are used to create deterministic and unique addresses for the `TipJar` and `TipRecord` accounts, ensuring that accounts are owned and managed by the program itself.

**PDAs Used:**
- **Tip Jar PDA:** A `TipJar` account is a PDA created with the seeds `[b"tip-jar", creator.key().as_ref()]`. This ensures that each creator can have only one tip jar, as the address is uniquely determined by the program ID and the creator's public key.
- **Tip Record PDA:** A `TipRecord` account is a PDA created with the seeds `[b"tip-record", tipper.key().as_ref(), tip_jar.key().as_ref()]`. This creates a unique record for each tipper-jar combination, allowing the program to track the total amount a specific user has tipped to a specific creator's jar.

### Program Instructions
**Instructions Implemented:**
- **`initialize`:** This instruction is called by a creator to create their personal `TipJar` account. It initializes a new PDA account with the creator's public key stored in its state.
- **`tip(amount: u64)`:** This instruction is called by a tipper. It performs two main actions:
    1. It transfers the specified `amount` of lamports from the tipper's wallet to the creator's wallet.
    2. It creates (if it's the first time this tipper is tipping this jar) or updates an existing `TipRecord` account to log the cumulative total tipped.
- **`delete_tip_record`:** This instruction is called by a tipper to close one of their `TipRecord` accounts. This effectively erases their tipping history for that specific jar and returns the lamports that were used for the account's rent back to the tipper.

### Account Structure
**`TipJar`**
This account represents a creator's tip jar.
```rust
#[account]
#[derive(InitSpace)]
pub struct TipJar {
    // The public key of the creator who owns this tip jar.
    pub creator: Pubkey,
    // The bump seed for the PDA.
    pub bump: u8,
}
```

**`TipRecord`**
This account tracks the total amount a specific tipper has sent to a specific tip jar.
```rust
#[account]
#[derive(InitSpace)]
pub struct TipRecord {
    // The public key of the user who sent the tip.
    pub tipper: Pubkey,
    // The public key of the TipJar account that was tipped.
    pub tip_jar: Pubkey,
    // The bump seed for the PDA.
    pub bump: u8,
    // The cumulative total amount of lamports tipped.
    pub total_tips: u64,
}
```

## Testing

### Test Coverage
The testing approach uses the Anchor framework with Mocha and Assert to cover both happy paths and unhappy paths, ensuring the program behaves as expected under various conditions.

**Happy Path Tests:**
- **Initialize Tip Jar:** Tests that a creator can successfully initialize their `TipJar` account. It verifies that the account is created with the correct creator public key and bump seed.
- **Succeed Tipping Once:** Tests that a tipper can successfully send a tip to a creator. It verifies that the `TipRecord` account is created correctly and that the creator's wallet balance increases by the tip amount.
- **Succeed Tipping Multiple Times:** Tests that the `total_tips` in a `TipRecord` account correctly accumulates when the same tipper sends multiple tips to the same creator.
- **Succeed Deleting Tip Record:** Tests that a tipper can successfully delete their `TipRecord` for a specific jar. It confirms this by checking that the tipper's wallet balance increases from the returned rent exemption lamports.

**Unhappy Path Tests:**
- **Fail on Zero Tip Amount:** Tests that the `tip` instruction fails if the tip amount is 0, expecting a `ZeroTipAmount` error.
- **Fail on Insufficient Funds:** Tests that the `tip` instruction fails if the tipper has an insufficient SOL balance, expecting a `NotEnoughLamports` error.
- **Fail on Duplicate Initialization:** Tests that a creator cannot initialize a `TipJar` more than once. The second attempt is expected to fail.
- **Fail on Wrong Creator for Tip:** Tests that the `tip` instruction fails if the provided creator public key does not match the one stored in the `TipJar`, expecting a `ConstraintHasOne` error.
- **Fail on Deleting Non-Existent Record:** Tests that the `delete_tip_record` instruction fails if the `TipRecord` account does not exist, expecting an `AccountNotInitialized` error.
- **Fail on Deleting Another User's Record:** Tests that a user cannot delete a `TipRecord` belonging to another user, expecting a `ConstraintSeeds` error.

### Running Tests
```bash
# Commands to run your tests
anchor test
```

### Additional Notes for Evaluators

[TODO: Add any specific notes or context that would help evaluators understand your project better]
