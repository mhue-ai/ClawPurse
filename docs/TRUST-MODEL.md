# ClawPurse Trust Model

Guidance for how OpenClaw nodes can trust transactions produced by ClawPurse.

## Principles

1. **Keys stay local** – Private keys never leave the operator's machine; keystore is encrypted at rest.
2. **Chain = source of truth** – Receipts are convenience; the Neutaro blockchain is authoritative.
3. **Operator-configurable guardrails** – Limits and allowlists can be tuned per node.
4. **Auditability** – Every send generates a structured receipt for later verification.

## Trust Levels

| Level | Description | Actions |
|-------|-------------|---------|
| 1. Chain-only | Minimum bar | Recipient verifies tx hash directly on Neutaro RPC/REST |
| 2. Receipt + chain | Recommended | Sender shares `receipts.json` entry; recipient cross-checks chain |
| 3. Allowlist enforcement | Higher trust | Recipient processes only from pre-approved addresses |
| 4. Multi-sig / review | Future | Require multiple operators to sign high-value txs |

## Verifying a Payment

1. **Obtain details** – Sender provides tx hash, amount, memo, and optionally the receipt snippet.
2. **Query chain**
   ```bash
   curl "https://api2.neutaro.io/cosmos/tx/v1beta1/txs/<TX_HASH>"
   ```
3. **Confirm fields**
   - `from_address` matches sender's registered wallet
   - `to_address` matches yours
   - `amount` and `denom` are correct
   - `memo` matches the agreed context (optional but helpful)
4. **Record** – Store the tx hash + receipt for your accounting.

## Allowlist Pattern (Coming Next)

Add a JSON/YAML file with approved counterparties:

```json
{
  "trusted": [
    {
      "name": "Node Atlas",
      "address": "neutaro1abc...",
      "limit": 250.0
    }
  ]
}
```

ClawPurse will read this file before sending and require confirmation if the destination is not listed.

## Receipt Anatomy

```
id: send-79ec3bc1-...
type: send
from: neutaro1fnp...
to:   neutaro16us...
amount: 0.400000 NTMPI
txHash: 79EC3BC17965A0987F4B7462C40B5FAC0889C5D3F9DD63C72B5968B36E0E8C82
block: 13835843
timestamp: 2026-02-07T15:31:02.434Z
memo: test tx
```

Anyone reviewing the receipt can verify the `txHash` on-chain and ensure the metadata lines up.

## Roadmap Items

- [ ] Configurable destination allowlists
- [ ] Automated incoming-payment watcher
- [ ] Multi-signature + hardware wallet support
- [ ] REST API / skill wrapper for other agents to call ClawPurse securely
