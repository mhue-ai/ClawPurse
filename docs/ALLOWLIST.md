# ClawPurse Destination Allowlists

This doc describes the forthcoming allowlist feature and how to configure it while the implementation lands.

## Goal

Force every outbound transfer to pass through a policy file so:
- Only known counterparties receive funds automatically
- Large transfers require explicit confirmation even if the address is trusted
- Operators can rotate trust relationships without touching code

## Proposed Config Structure

```json
{
  "defaultPolicy": {
    "maxAmount": 100.0,        // default hard cap (NTMPI)
    "requireMemo": false
  },
  "destinations": [
    {
      "name": "Mhue Treasury",
      "address": "neutaro1abc...",
      "maxAmount": 1000.0,
      "needsMemo": true,
      "notes": "Monthly operations funding"
    },
    {
      "name": "Node Atlas",
      "address": "neutaro1def...",
      "maxAmount": 50.0,
      "needsMemo": false
    }
  ]
}
```

- Stored at `~/.clawpurse/allowlist.json` by default
- `destinations` is array of known wallets with per-recipient caps
- `defaultPolicy` catches addresses not listed (e.g., block entirely or allow tiny test sends)

## Enforcement Hooks (WIP)

1. `clawpurse send` loads allowlist before broadcasting
2. If target address not in `destinations`:
   - Either block outright or ask for `--yes --override`
   - Optionally enforce a micro-cap (e.g., <= 0.01 NTMPI) for first-contact tests
3. If listed but amount > `maxAmount` → require `--yes` regardless of `requireConfirmAbove`
4. If `needsMemo` true but no memo supplied → reject or prompt

## Roadmap

- [x] Document desired behavior (this file)
- [ ] Implement parser + validator (zod schema)
- [ ] Integrate into CLI send flow
- [ ] Add `clawpurse allowlist list|add|remove` helper commands
- [ ] Optional: auto-sync allowlist via git or shared Drive

## Interim Recommendation

While feature lands, manually check recipient addresses before sending and keep a text file of trusted counterparties. Once the allowlist code is merged, migrating that file to JSON will be trivial.
