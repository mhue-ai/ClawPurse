import { SendResult } from './wallet.js';
export interface Receipt {
    id: string;
    type: 'send' | 'receive';
    txHash: string;
    fromAddress: string;
    toAddress: string;
    amount: string;
    displayAmount: string;
    denom: string;
    memo?: string;
    height: number;
    gasUsed: number;
    timestamp: string;
    status: 'confirmed' | 'pending' | 'failed';
}
export declare function loadReceipts(): Promise<Receipt[]>;
export declare function recordSendReceipt(result: SendResult, fromAddress: string, toAddress: string, amount: string, memo?: string): Promise<Receipt>;
export declare function getRecentReceipts(limit?: number): Promise<Receipt[]>;
export declare function getReceiptByTxHash(txHash: string): Promise<Receipt | null>;
export declare function formatReceipt(receipt: Receipt): string;
//# sourceMappingURL=receipts.d.ts.map