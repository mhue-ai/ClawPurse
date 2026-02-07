# ClawPurse Trust Model

How ClawPurse handles trust between OpenClaw nodes.

## Core Principles

1. **Keys never leave the machine** – Private keys are encrypted locally; no external KMS or cloud storage.
2. **Chain is the source of truth** – Receipts are convenience; always verify against Neutaro blockchain.
3. **Safety rails are configurable** – Each node operator sets their own limits.
4. **Transparency over obscurity** – All code is open; receipts provide audit trail.

## Trust Levels

### Level 1: Verify on Chain (Minimum)
Any recipient can verify a transaction by querying the Neutaro blockchain directly. No trust in the sender required.

```bash
# Query any transaction
curl "https://api2.neutaro.io/cosmos/tx/v1beta1/txs/<TX_HASH>"
```

### Level 2: Receipt Exchange (Recommended)
Sender shares their receipt JSON. Recipient cross-references with chain data.

Benefits:
- Human-readable record
- Timestamps and metadata
- Local audit trail

### Level 3: Known Wallet Allowlist (High Trust)
Operators maintain a list of trusted wallet addresses. Only process transactions from known sources.

```typescript
// Example allowlist (future feature)
const TRUSTED_SENDERS = [
  'neutaro1abc...',  // Node A
  'neutaro1def...',  // Node B
];
```

### Level 4: Multi-Sig (Future)
For high-value operations, require multiple signatures. Not yet implemented.

## What ClawPurse Does NOT Guarantee

- **Sender identity** – A wallet address doesn't prove who controls it. Use out-of-band verification for first contact.
- **Transaction reversal** – Blockchain transactions are final. Verify before sending.
- **Key security** – If your machine is compromised, your keys may be too. Standard operational security applies.

## Recommended Workflow for Node-to-Node Payments

1. **Establish identity** – Exchange wallet addresses through a trusted channel (encrypted chat, in person, etc.)
2. **Add to allowlist** – Configure your node to recognize the other party's address
3. **Send with memo** – Include identifying info in the transaction memo
4. **Share receipt** – Send the receipt JSON to the recipient
5. **Recipient verifies** – Cross-check receipt against chain, confirm address matches known sender
6. **Acknowledge** – Confirm receipt through your communication channel

## Dispute Resolution

Since blockchain transactions are irreversible:

1. Always verify recipient address before sending
2. Start with small test transactions for new relationships
3. Keep all receipts for audit purposes
4. For disputes, chain data is the final arbiter

## Future Enhancements

- [ ] Configurable address allowlists
- [ ] Webhook notifications for incoming transactions
- [ ] Multi-signature support
- [ ] Hardware wallet integration
- [ ] Automated receipt verification tool
