# ClawPurse

Local Timpi/NTMPI wallet for OpenClaw nodes on the Neutaro chain.

## Features

- 🔐 **Encrypted local keystore** - Keys never leave your machine
- 💰 **Send/receive NTMPI** - Full wallet functionality
- 🛡️ **Safety rails** - Configurable limits and confirmations
- 📝 **Transaction receipts** - Local audit trail
- 🔌 **Programmatic API** - Import and use in scripts

## Installation

```bash
# From the ClawPurse directory
npm install
npm run build
npm link  # Makes 'clawpurse' available globally
```

## Quick Start

```bash
# Create a new wallet
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
```

## Commands

| Command | Description |
|---------|-------------|
| `init` | Create a new wallet |
| `import` | Import wallet from mnemonic |
| `balance` | Check wallet balance |
| `send <to> <amount>` | Send NTMPI tokens |
| `receive` | Show receive address |
| `history` | View transaction history |
| `status` | Check chain connection |
| `address` | Display wallet address |
| `export --yes` | Export mnemonic (dangerous) |

## Options

- `--password <pass>` - Wallet password (or set `CLAWPURSE_PASSWORD` env var)
- `--keystore <path>` - Custom keystore location (default: `~/.clawpurse/keystore.enc`)
- `--memo <text>` - Add memo to transaction
- `--yes` - Skip confirmations
- `--allowlist <path>` - Use custom allowlist file (default `~/.clawpurse/allowlist.json`)
- `--override-allowlist` - Bypass allowlist checks (one-time)

## Safety Features

- **Max send limit**: 1000 NTMPI (configurable in `src/config.ts`)
- **Confirmation required**: Above 100 NTMPI
- **Address validation**: Verifies `neutaro` prefix
- **Encrypted storage**: AES-256-GCM with scrypt key derivation
- **Destination allowlist** (optional): Drop an `allowlist.json` in `~/.clawpurse/` to limit who can receive funds (see `docs/ALLOWLIST.md`)

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
const result = await send(wallet, address, 'neutaro1...', '10.5');
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

## Security Notes

- **Backup your mnemonic** - It's only shown once during `init`
- **Use a strong password** - At least 8 characters
- **Keystore permissions** - File is created with mode 0600
- **Never share** your mnemonic or keystore file

## For Other OpenClaw Nodes

To trust transactions from a ClawPurse wallet:

1. Verify the sending address is in your allowlist
2. Check the transaction receipt matches the chain
3. Use the programmatic API for automated verification

## License

ISC
