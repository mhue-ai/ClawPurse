import { MsgDelegate, MsgUndelegate, MsgBeginRedelegate } from 'cosmjs-types/cosmos/staking/v1beta1/tx';
import { NEUTARO_CONFIG } from './config.js';
import { getSigningClient, parseAmount, formatAmount } from './wallet.js';
/**
 * Get list of active validators
 */
export async function getValidators() {
    const response = await fetch(`${NEUTARO_CONFIG.restEndpoint}/cosmos/staking/v1beta1/validators?status=BOND_STATUS_BONDED&pagination.limit=100`);
    const data = await response.json();
    return data.validators.map((v) => ({
        operatorAddress: v.operator_address,
        moniker: v.description?.moniker || 'Unknown',
        commission: (parseFloat(v.commission?.commission_rates?.rate || '0') * 100).toFixed(2) + '%',
        status: v.status,
        tokens: v.tokens,
        jailed: v.jailed,
    }));
}
/**
 * Get current delegations for an address
 */
export async function getDelegations(delegatorAddress) {
    const response = await fetch(`${NEUTARO_CONFIG.restEndpoint}/cosmos/staking/v1beta1/delegations/${delegatorAddress}`);
    const data = await response.json();
    if (!data.delegation_responses || data.delegation_responses.length === 0) {
        return {
            delegations: [],
            totalStaked: '0',
            totalStakedDisplay: '0.000000 NTMPI',
        };
    }
    // Fetch validator info for monikers
    const validators = await getValidators();
    const validatorMap = new Map(validators.map(v => [v.operatorAddress, v.moniker]));
    const delegations = data.delegation_responses.map((d) => ({
        validatorAddress: d.delegation.validator_address,
        validatorMoniker: validatorMap.get(d.delegation.validator_address) || 'Unknown',
        amount: d.balance.amount,
        displayAmount: formatAmount(BigInt(d.balance.amount)),
    }));
    const totalStaked = delegations.reduce((sum, d) => sum + BigInt(d.amount), BigInt(0));
    return {
        delegations,
        totalStaked: totalStaked.toString(),
        totalStakedDisplay: formatAmount(totalStaked),
    };
}
/**
 * Delegate (stake) tokens to a validator
 */
export async function delegate(wallet, delegatorAddress, validatorAddress, amount) {
    const microAmount = parseAmount(amount);
    // Validate validator address
    if (!validatorAddress.startsWith('neutarovaloper')) {
        throw new Error(`Invalid validator address. Expected neutarovaloper prefix, got ${validatorAddress.slice(0, 15)}...`);
    }
    const client = await getSigningClient(wallet);
    const msg = {
        typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
        value: MsgDelegate.fromPartial({
            delegatorAddress,
            validatorAddress,
            amount: {
                denom: NEUTARO_CONFIG.denom,
                amount: microAmount.toString(),
            },
        }),
    };
    const result = await client.signAndBroadcast(delegatorAddress, [msg], 'auto', 'Staked via ClawPurse');
    if (result.code !== 0) {
        throw new Error(`Delegation failed with code ${result.code}: ${result.rawLog}`);
    }
    return {
        success: true,
        txHash: result.transactionHash,
        height: result.height,
        gasUsed: Number(result.gasUsed),
        action: 'delegate',
        validator: validatorAddress,
        amount: microAmount.toString(),
        displayAmount: formatAmount(microAmount),
        timestamp: new Date().toISOString(),
    };
}
/**
 * Undelegate (unstake) tokens from a validator
 * Note: Tokens are subject to unbonding period (22 days on Neutaro)
 */
export async function undelegate(wallet, delegatorAddress, validatorAddress, amount) {
    const microAmount = parseAmount(amount);
    if (!validatorAddress.startsWith('neutarovaloper')) {
        throw new Error(`Invalid validator address. Expected neutarovaloper prefix, got ${validatorAddress.slice(0, 15)}...`);
    }
    const client = await getSigningClient(wallet);
    const msg = {
        typeUrl: '/cosmos.staking.v1beta1.MsgUndelegate',
        value: MsgUndelegate.fromPartial({
            delegatorAddress,
            validatorAddress,
            amount: {
                denom: NEUTARO_CONFIG.denom,
                amount: microAmount.toString(),
            },
        }),
    };
    const result = await client.signAndBroadcast(delegatorAddress, [msg], 'auto', 'Unstaked via ClawPurse');
    if (result.code !== 0) {
        throw new Error(`Undelegation failed with code ${result.code}: ${result.rawLog}`);
    }
    return {
        success: true,
        txHash: result.transactionHash,
        height: result.height,
        gasUsed: Number(result.gasUsed),
        action: 'undelegate',
        validator: validatorAddress,
        amount: microAmount.toString(),
        displayAmount: formatAmount(microAmount),
        timestamp: new Date().toISOString(),
    };
}
/**
 * Redelegate tokens from one validator to another
 * Note: Does not require unbonding period
 */
export async function redelegate(wallet, delegatorAddress, srcValidatorAddress, dstValidatorAddress, amount) {
    const microAmount = parseAmount(amount);
    if (!srcValidatorAddress.startsWith('neutarovaloper') || !dstValidatorAddress.startsWith('neutarovaloper')) {
        throw new Error('Invalid validator address. Expected neutarovaloper prefix.');
    }
    const client = await getSigningClient(wallet);
    const msg = {
        typeUrl: '/cosmos.staking.v1beta1.MsgBeginRedelegate',
        value: MsgBeginRedelegate.fromPartial({
            delegatorAddress,
            validatorSrcAddress: srcValidatorAddress,
            validatorDstAddress: dstValidatorAddress,
            amount: {
                denom: NEUTARO_CONFIG.denom,
                amount: microAmount.toString(),
            },
        }),
    };
    const result = await client.signAndBroadcast(delegatorAddress, [msg], 'auto', 'Redelegated via ClawPurse');
    if (result.code !== 0) {
        throw new Error(`Redelegation failed with code ${result.code}: ${result.rawLog}`);
    }
    return {
        success: true,
        txHash: result.transactionHash,
        height: result.height,
        gasUsed: Number(result.gasUsed),
        action: 'redelegate',
        validator: dstValidatorAddress,
        amount: microAmount.toString(),
        displayAmount: formatAmount(microAmount),
        timestamp: new Date().toISOString(),
    };
}
/**
 * Get unbonding delegations (tokens in the process of unstaking)
 */
export async function getUnbondingDelegations(delegatorAddress) {
    const response = await fetch(`${NEUTARO_CONFIG.restEndpoint}/cosmos/staking/v1beta1/delegators/${delegatorAddress}/unbonding_delegations`);
    const data = await response.json();
    if (!data.unbonding_responses || data.unbonding_responses.length === 0) {
        return { entries: [] };
    }
    const entries = [];
    for (const ub of data.unbonding_responses) {
        for (const entry of ub.entries) {
            entries.push({
                validatorAddress: ub.validator_address,
                amount: entry.balance,
                displayAmount: formatAmount(BigInt(entry.balance)),
                completionTime: entry.completion_time,
            });
        }
    }
    return { entries };
}
//# sourceMappingURL=staking.js.map