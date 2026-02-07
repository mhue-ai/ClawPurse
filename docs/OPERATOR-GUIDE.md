# ClawPurse Operator Guide

How to run ClawPurse safely and how other nodes can trust your transactions.

## Setup

```bash
cd ClawPurse
npm install
npm run build
npm link   # makes 'clawpurse' available globally
```

## First-Time Wallet Setup

```bash
# Create a new wallet (saves encrypted keystore to ~/.clawpurse/keystore.enc)
clawpurse init --password <strong-password>

# IMPORTANT: Back up the 24-word mnemonic shown during init!
# It's the ONLY way to recover your wallet.
```

## Daily Operations

```bash
# Check connection to Neutaro chain
clawpurse status

# Check your balance
clawpurse balance --password <password>

# Get your receive address
clawpurse receive

# Send tokens
clawpurse send <recipient-address> <amount> --password <password>

# View recent transactions
clawpurse history
```

## Safety Rails

ClawPurse includes built-in safety limits:

| Setting | Default | Purpose |
|---------|---------|---------|
| `maxSendAmount` | 1000 NTMPI | Hard cap per transaction |
| `requireConfirmAbove` | 100 NTMPI | Requires `--yes` flag above this |

To adjust, edit `src/config.ts` and rebuild:

```typescript
export const KEYSTORE_CONFIG = {
  maxSendAmount: 5000_000000,      // 5000 NTMPI
  requireConfirmAbove: 500_000000, // 500 NTMPI
  // ...
};
```

## Transaction Receipts

Every send creates a local receipt in `~/.clawpurse/receipts.json`:

```json
{
  "id": "send-abc123-1707300000000",
  "type": "send",
  "txHash": "ABC123...",
  "fromAddress": "neutaro1...",
  "toAddress": "neutaro1...",
  "amount": "1000000",
  "displayAmount": "1.000000 NTMPI",
  "height": 13834000,
  "timestamp": "2026-02-07T12:00:00.000Z",
  "status": "confirmed"
}
```

## Verifying Transactions (For Other Nodes)

If another node sends you NTMPI via ClawPurse, verify the transaction:

### 1. Get the tx hash from the sender
They should provide the `txHash` from their receipt.

### 2. Query the chain directly
```bash
curl "https://api2.neutaro.io/cosmos/tx/v1beta1/txs/<TX_HASH>"
```

### 3. Confirm these match:
- `fromAddress` matches sender's known wallet
- `toAddress` matches your wallet  
- `amount` matches agreed amount
- Transaction is in a finalized block

### 4. Optional: Check sender's receipt
Ask for their `receipts.json` entry and compare against chain data.

## Security Checklist

- [ ] Keystore file (`~/.clawpurse/keystore.enc`) has mode 0600
- [ ] Mnemonic backed up offline (paper, hardware wallet)
- [ ] Password is strong (12+ chars, not reused)
- [ ] `receipts.json` backed up for audit trail
- [ ] Safety limits set appropriately for your use case

## Troubleshooting

**"Chain disconnected"**  
→ Check internet connection; try alternate RPC in `src/config.ts`

**"Amount exceeds safety limit"**  
→ Adjust `maxSendAmount` in config or split into smaller sends

**"Invalid address prefix"**  
→ Neutaro addresses start with `neutaro1...`

**Forgot password**  
→ Cannot recover keystore. Restore from mnemonic:
```bash
clawpurse import --mnemonic "your 24 words..." --password <new-password>
```
