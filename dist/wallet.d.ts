import { SigningStargateClient, StargateClient } from '@cosmjs/stargate';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { Coin } from '@cosmjs/proto-signing';
export interface BalanceResult {
    address: string;
    balances: Coin[];
    primary: {
        amount: string;
        denom: string;
        displayAmount: string;
        displayDenom: string;
    };
}
export interface SendResult {
    success: boolean;
    txHash: string;
    height: number;
    gasUsed: number;
    gasWanted: number;
    fee: Coin[];
    timestamp: string;
}
export interface SendOptions {
    memo?: string;
    gasLimit?: number;
    skipConfirmation?: boolean;
}
export declare function getClient(): Promise<StargateClient>;
export declare function getSigningClient(wallet: DirectSecp256k1HdWallet): Promise<SigningStargateClient>;
export declare function getBalance(address: string): Promise<BalanceResult>;
export declare function parseAmount(input: string): bigint;
export declare function formatAmount(microAmount: bigint | string): string;
export declare function send(wallet: DirectSecp256k1HdWallet, fromAddress: string, toAddress: string, amount: string, options?: SendOptions): Promise<SendResult>;
export declare function getChainInfo(): Promise<{
    chainId: string;
    height: number;
    connected: boolean;
}>;
export declare function estimateGas(wallet: DirectSecp256k1HdWallet, fromAddress: string, toAddress: string, amount: string): Promise<number>;
export declare function generateReceiveAddress(address: string): {
    address: string;
    qrData: string;
    displayText: string;
};
//# sourceMappingURL=wallet.d.ts.map