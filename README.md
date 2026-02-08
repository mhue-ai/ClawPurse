# ClawPurse

Local Timpi/NTMPI wallet for agentic AI (including OpenClaw), automation scripts, and individual users on the Neutaro chain.

## Features

- 🔐 **Encrypted local keystore** – AES-256-GCM encryption with scrypt key derivation
- 💰 **Send/receive NTMPI** – Full wallet functionality on Neutaro blockchain
- 🛡️ **Configurable guardrails** – Max send limits, confirmation thresholds, destination allowlists
- 📝 **Transaction receipts** – Local audit trail for all sends
- ✅ **Destination allowlists** – Control which addresses can receive funds
- 🔌 **Programmatic API** – Import and use in scripts and other applications
- 🤖 **Agent-ready** – Designed for AI agents, automation, and human operators alike

## Installation

```bash
# From the ClawPurse directory
npm install
npm run build
npm link  # Makes 'clawpurse' available globally
```

## Quick Start

```bash
# Create a new wallet (you'll be prompted to choose guardrails)
clawpurse init --password <your-password>

# Check chain status
clawpurse status

# View your address
clawpurse address

# Check balance
clawpurse balance --password <your-password>

# Receive tokens
clawpurse receive

# Send tokens
clawpurse send <to-address> <amount> --password <your-password>

# View transaction history
clawpurse history
```

## Guardrail Wizard

During `clawpurse init` (and `import`), the CLI pauses to explain the destination allowlist and asks you to choose:

- **Enforce** – Blocks sends to unknown addresses unless you pass `--override-allowlist`
- **Allow** – Lets you send anywhere, but still logs entries for documentation

Pre-set the choice with `--allowlist-mode enforce|allow` or rerun the wizard via `clawpurse allowlist init`.

## Commands

### Wallet Management

| Command | Description |
|---------|-------------|
| `init` | Create a new wallet (runs guardrail wizard) |
| `import` | Import wallet from mnemonic |
| `address` | Display wallet address |
| `balance` | Check wallet balance |
| `receive` | Show receive address |
| `export --yes` | Export mnemonic (dangerous!) |

### Transactions

| Command | Description |
|---------|-------------|
| `send <to> <amount>` | Send NTMPI tokens |
| `history` | View transaction history |

### Network

| Command | Description |
|---------|-------------|
| `status` | Check chain connection |

### Allowlist Management

| Command | Description |
|---------|-------------|
| `allowlist init` | Run guardrail wizard / create config |
| `allowlist list` | Show trusted destinations + default policy |
| `allowlist add <addr>` | Add/update a destination |
| `allowlist remove <addr>` | Remove a destination |

## Options

| Flag | Description |
|------|-------------|
| `--password <pass>` | Wallet password (or set `CLAWPURSE_PASSWORD` env var) |
| `--keystore <path>` | Custom keystore location (default: `~/.clawpurse/keystore.enc`) |
| `--memo <text>` | Add memo to transaction |
| `--yes` | Skip confirmations |
| `--allowlist <path>` | Custom allowlist file (default: `~/.clawpurse/allowlist.json`) |
| `--allowlist-mode <enforce\|allow>` | Skip guardrail prompt during init/import |
| `--override-allowlist` | Bypass allowlist checks for one transaction |

## Allowlist Add Options

| Flag | Description |
|------|-------------|
| `--name "Label"` | Human-readable name for the destination |
| `--max <amount>` | Maximum send amount in NTMPI |
| `--memo-required` | Require memo when sending to this address |
| `--notes "text"` | Optional notes for documentation |

## Safety Features

| Feature | Default | Description |
|---------|---------|-------------|
| Max send limit | 1000 NTMPI | Hard cap per transaction |
| Confirmation threshold | 100 NTMPI | Requires `--yes` above this |
| Address validation | Enabled | Verifies `neutaro1` prefix |
| Encrypted storage | AES-256-GCM | Scrypt key derivation |
| Allowlist | Optional | Block or warn on unknown destinations |

## Programmatic Usage

```typescript
import {
  generateWallet,
  saveKeystore,
  loadKeystore,
  getBalance,
  send,
} from 'clawpurse';

// Generate and save a wallet
const { mnemonic, address } = await generateWallet();
await saveKeystore(mnemonic, address, 'password');

// Load and use
const { wallet, address } = await loadKeystore('password');
const balance = await getBalance(address);

// Send tokens
const result = await send(wallet, address, 'neutaro1...', '10.5', {
  memo: 'Payment for services',
  skipConfirmation: true,
});
console.log(`TxHash: ${result.txHash}`);
```

## Configuration

Edit `src/config.ts` to customize:

```typescript
export const NEUTARO_CONFIG = {
  rpcEndpoint: 'https://rpc2.neutaro.io',
  // ...
};

export const KEYSTORE_CONFIG = {
  maxSendAmount: 1000_000000,      // 1000 NTMPI
  requireConfirmAbove: 100_000000, // 100 NTMPI
  // ...
};
```

## Documentation

- **[OPERATOR-GUIDE.md](./docs/OPERATOR-GUIDE.md)** – Complete setup and usage guide
- **[TRUST-MODEL.md](./docs/TRUST-MODEL.md)** – Security model and transaction verification
- **[ALLOWLIST.md](./docs/ALLOWLIST.md)** – Destination allowlist configuration
- **[SKILL.md](./SKILL.md)** – AI agent integration guide

## Security Notes

- **Backup your mnemonic** – It's only shown once during `init`
- **Use a strong password** – At least 12 characters recommended
- **Keystore permissions** – File is created with mode 0600
- **Never share** your mnemonic or keystore file
- **Enable allowlist enforcement** – Prevents accidental sends to wrong addresses

## Environment Variables

| Variable | Description |
|----------|-------------|
| `CLAWPURSE_PASSWORD` | Wallet password |
| `CLAWPURSE_MNEMONIC` | Mnemonic for import |

## Files

| Path | Purpose |
|------|---------|
| `~/.clawpurse/keystore.enc` | Encrypted wallet (mode 0600) |
| `~/.clawpurse/receipts.json` | Transaction receipts |
| `~/.clawpurse/allowlist.json` | Trusted destinations config |

## Verifying Transactions

For receiving nodes to verify a payment:

1. Obtain tx hash from sender
2. Query chain: `curl "https://api2.neutaro.io/cosmos/tx/v1beta1/txs/<TX_HASH>"`
3. Confirm `from_address`, `to_address`, and `amount` match expectations
4. Optional: compare against sender's receipt

See [TRUST-MODEL.md](./docs/TRUST-MODEL.md) for detailed verification procedures.

## License

ISC
