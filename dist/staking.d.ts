import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
export interface Delegation {
    validatorAddress: string;
    validatorMoniker?: string;
    amount: string;
    displayAmount: string;
}
export interface DelegationResult {
    delegations: Delegation[];
    totalStaked: string;
    totalStakedDisplay: string;
}
export interface StakeResult {
    success: boolean;
    txHash: string;
    height: number;
    gasUsed: number;
    action: 'delegate' | 'undelegate' | 'redelegate';
    validator: string;
    amount: string;
    displayAmount: string;
    timestamp: string;
}
export interface Validator {
    operatorAddress: string;
    moniker: string;
    commission: string;
    status: string;
    tokens: string;
    jailed: boolean;
}
/**
 * Get list of active validators
 */
export declare function getValidators(): Promise<Validator[]>;
/**
 * Get current delegations for an address
 */
export declare function getDelegations(delegatorAddress: string): Promise<DelegationResult>;
/**
 * Delegate (stake) tokens to a validator
 */
export declare function delegate(wallet: DirectSecp256k1HdWallet, delegatorAddress: string, validatorAddress: string, amount: string): Promise<StakeResult>;
/**
 * Undelegate (unstake) tokens from a validator
 * Note: Tokens are subject to unbonding period (22 days on Neutaro)
 */
export declare function undelegate(wallet: DirectSecp256k1HdWallet, delegatorAddress: string, validatorAddress: string, amount: string): Promise<StakeResult>;
/**
 * Redelegate tokens from one validator to another
 * Note: Does not require unbonding period
 */
export declare function redelegate(wallet: DirectSecp256k1HdWallet, delegatorAddress: string, srcValidatorAddress: string, dstValidatorAddress: string, amount: string): Promise<StakeResult>;
/**
 * Get unbonding delegations (tokens in the process of unstaking)
 */
export declare function getUnbondingDelegations(delegatorAddress: string): Promise<{
    entries: Array<{
        validatorAddress: string;
        amount: string;
        displayAmount: string;
        completionTime: string;
    }>;
}>;
//# sourceMappingURL=staking.d.ts.map