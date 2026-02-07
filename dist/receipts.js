// Transaction receipts for audit trail
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { NEUTARO_CONFIG } from './config.js';
function getReceiptsPath() {
    return path.join(os.homedir(), '.clawpurse', 'receipts.json');
}
export async function loadReceipts() {
    const receiptsPath = getReceiptsPath();
    try {
        const data = await fs.readFile(receiptsPath, 'utf8');
        return JSON.parse(data);
    }
    catch {
        return [];
    }
}
async function saveReceipts(receipts) {
    const receiptsPath = getReceiptsPath();
    await fs.mkdir(path.dirname(receiptsPath), { recursive: true });
    await fs.writeFile(receiptsPath, JSON.stringify(receipts, null, 2));
}
export async function recordSendReceipt(result, fromAddress, toAddress, amount, memo) {
    const receipts = await loadReceipts();
    const receipt = {
        id: `send-${result.txHash.slice(0, 8)}-${Date.now()}`,
        type: 'send',
        txHash: result.txHash,
        fromAddress,
        toAddress,
        amount,
        displayAmount: formatForReceipt(amount),
        denom: NEUTARO_CONFIG.denom,
        memo,
        height: result.height,
        gasUsed: result.gasUsed,
        timestamp: result.timestamp,
        status: 'confirmed',
    };
    receipts.push(receipt);
    await saveReceipts(receipts);
    return receipt;
}
function formatForReceipt(microAmount) {
    const amount = BigInt(microAmount);
    const whole = amount / BigInt(10 ** NEUTARO_CONFIG.decimals);
    const fraction = amount % BigInt(10 ** NEUTARO_CONFIG.decimals);
    return `${whole}.${fraction.toString().padStart(NEUTARO_CONFIG.decimals, '0')} ${NEUTARO_CONFIG.displayDenom}`;
}
export async function getRecentReceipts(limit = 10) {
    const receipts = await loadReceipts();
    return receipts.slice(-limit).reverse();
}
export async function getReceiptByTxHash(txHash) {
    const receipts = await loadReceipts();
    return receipts.find(r => r.txHash === txHash) || null;
}
export function formatReceipt(receipt) {
    const lines = [
        `╔══════════════════════════════════════════════════════════════╗`,
        `║                    CLAWPURSE RECEIPT                         ║`,
        `╠══════════════════════════════════════════════════════════════╣`,
        `║ Type: ${receipt.type.toUpperCase().padEnd(55)}║`,
        `║ Status: ${receipt.status.toUpperCase().padEnd(53)}║`,
        `║ Amount: ${receipt.displayAmount.padEnd(53)}║`,
        `╠══════════════════════════════════════════════════════════════╣`,
        `║ From: ${receipt.fromAddress.slice(0, 54).padEnd(55)}║`,
        `║ To:   ${receipt.toAddress.slice(0, 54).padEnd(55)}║`,
        `╠══════════════════════════════════════════════════════════════╣`,
        `║ Tx Hash: ${receipt.txHash.slice(0, 52).padEnd(52)}║`,
        `║ Block: ${receipt.height.toString().padEnd(54)}║`,
        `║ Gas Used: ${receipt.gasUsed.toString().padEnd(51)}║`,
        `║ Time: ${receipt.timestamp.padEnd(55)}║`,
    ];
    if (receipt.memo) {
        lines.push(`║ Memo: ${receipt.memo.slice(0, 55).padEnd(55)}║`);
    }
    lines.push(`╚══════════════════════════════════════════════════════════════╝`);
    return lines.join('\n');
}
//# sourceMappingURL=receipts.js.map