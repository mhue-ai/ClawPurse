// Wallet operations for Neutaro chain
import { SigningStargateClient, StargateClient, GasPrice } from '@cosmjs/stargate';
import { NEUTARO_CONFIG, KEYSTORE_CONFIG } from './config.js';
let cachedClient = null;
export async function getClient() {
    if (!cachedClient) {
        cachedClient = await StargateClient.connect(NEUTARO_CONFIG.rpcEndpoint);
    }
    return cachedClient;
}
export async function getSigningClient(wallet) {
    return SigningStargateClient.connectWithSigner(NEUTARO_CONFIG.rpcEndpoint, wallet, {
        gasPrice: GasPrice.fromString(NEUTARO_CONFIG.gasPrice),
    });
}
export async function getBalance(address) {
    const client = await getClient();
    const allBalances = await client.getAllBalances(address);
    const balances = [...allBalances]; // Convert readonly to mutable
    // Find primary token balance
    const primaryBalance = balances.find(b => b.denom === NEUTARO_CONFIG.denom);
    const amount = primaryBalance?.amount || '0';
    // Convert to display units
    const displayAmount = (BigInt(amount) / BigInt(10 ** NEUTARO_CONFIG.decimals)).toString() +
        '.' +
        (BigInt(amount) % BigInt(10 ** NEUTARO_CONFIG.decimals)).toString().padStart(NEUTARO_CONFIG.decimals, '0');
    return {
        address,
        balances,
        primary: {
            amount,
            denom: NEUTARO_CONFIG.denom,
            displayAmount: parseFloat(displayAmount).toFixed(6),
            displayDenom: NEUTARO_CONFIG.displayDenom,
        },
    };
}
export function parseAmount(input) {
    // Handle both raw micro units and display units
    if (input.includes('.')) {
        // Display units (e.g., "1.5" NTMPI)
        const [whole, fraction = ''] = input.split('.');
        const paddedFraction = fraction.padEnd(NEUTARO_CONFIG.decimals, '0').slice(0, NEUTARO_CONFIG.decimals);
        return BigInt(whole) * BigInt(10 ** NEUTARO_CONFIG.decimals) + BigInt(paddedFraction);
    }
    else {
        // Assume display units if it's a "reasonable" number, micro units otherwise
        const num = BigInt(input);
        if (num < 1000000n) {
            // Likely display units
            return num * BigInt(10 ** NEUTARO_CONFIG.decimals);
        }
        // Assume micro units
        return num;
    }
}
export function formatAmount(microAmount) {
    const amount = BigInt(microAmount);
    const whole = amount / BigInt(10 ** NEUTARO_CONFIG.decimals);
    const fraction = amount % BigInt(10 ** NEUTARO_CONFIG.decimals);
    return `${whole}.${fraction.toString().padStart(NEUTARO_CONFIG.decimals, '0')} ${NEUTARO_CONFIG.displayDenom}`;
}
export async function send(wallet, fromAddress, toAddress, amount, options = {}) {
    const microAmount = parseAmount(amount);
    // Safety checks
    if (microAmount > BigInt(KEYSTORE_CONFIG.maxSendAmount)) {
        throw new Error(`Amount exceeds safety limit of ${formatAmount(BigInt(KEYSTORE_CONFIG.maxSendAmount))}. ` +
            `Edit KEYSTORE_CONFIG.maxSendAmount to increase.`);
    }
    if (microAmount > BigInt(KEYSTORE_CONFIG.requireConfirmAbove) && !options.skipConfirmation) {
        throw new Error(`Amount exceeds ${formatAmount(BigInt(KEYSTORE_CONFIG.requireConfirmAbove))} - ` +
            `confirmation required. Pass skipConfirmation: true to proceed.`);
    }
    // Validate destination address
    if (!toAddress.startsWith(NEUTARO_CONFIG.bech32Prefix)) {
        throw new Error(`Invalid address prefix. Expected ${NEUTARO_CONFIG.bech32Prefix}, got ${toAddress.slice(0, 8)}...`);
    }
    const client = await getSigningClient(wallet);
    const sendAmount = {
        denom: NEUTARO_CONFIG.denom,
        amount: microAmount.toString(),
    };
    const result = await client.sendTokens(fromAddress, toAddress, [sendAmount], options.gasLimit ? { amount: [{ denom: NEUTARO_CONFIG.denom, amount: '5000' }], gas: options.gasLimit.toString() } : 'auto', options.memo || '');
    if (result.code !== 0) {
        throw new Error(`Transaction failed with code ${result.code}: ${result.rawLog}`);
    }
    return {
        success: true,
        txHash: result.transactionHash,
        height: result.height,
        gasUsed: Number(result.gasUsed),
        gasWanted: Number(result.gasWanted),
        fee: result.events.find(e => e.type === 'tx')?.attributes.find(a => a.key === 'fee')?.value
            ? [{ denom: NEUTARO_CONFIG.denom, amount: '5000' }]
            : [],
        timestamp: new Date().toISOString(),
    };
}
export async function getChainInfo() {
    try {
        const client = await getClient();
        const height = await client.getHeight();
        const chainId = await client.getChainId();
        return { chainId, height, connected: true };
    }
    catch (error) {
        return { chainId: '', height: 0, connected: false };
    }
}
export async function estimateGas(wallet, fromAddress, toAddress, amount) {
    const client = await getSigningClient(wallet);
    const microAmount = parseAmount(amount);
    const sendAmount = {
        denom: NEUTARO_CONFIG.denom,
        amount: microAmount.toString(),
    };
    // Simulate to get gas estimate
    const gasEstimate = await client.simulate(fromAddress, [
        {
            typeUrl: '/cosmos.bank.v1beta1.MsgSend',
            value: {
                fromAddress,
                toAddress,
                amount: [sendAmount],
            },
        },
    ], undefined);
    // Add 20% buffer
    return Math.ceil(gasEstimate * 1.2);
}
export function generateReceiveAddress(address) {
    return {
        address,
        qrData: `neutaro:${address}`,
        displayText: `Send ${NEUTARO_CONFIG.displayDenom} to:\n${address}`,
    };
}
//# sourceMappingURL=wallet.js.map