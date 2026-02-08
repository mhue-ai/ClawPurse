import { z } from 'zod';
declare const DestinationSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    address: z.ZodString;
    maxAmount: z.ZodOptional<z.ZodNumber>;
    needsMemo: z.ZodOptional<z.ZodBoolean>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
declare const AllowlistSchema: z.ZodObject<{
    defaultPolicy: z.ZodOptional<z.ZodObject<{
        maxAmount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        requireMemo: z.ZodOptional<z.ZodBoolean>;
        blockUnknown: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
    destinations: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        address: z.ZodString;
        maxAmount: z.ZodOptional<z.ZodNumber>;
        needsMemo: z.ZodOptional<z.ZodBoolean>;
        notes: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type AllowlistConfig = z.infer<typeof AllowlistSchema>;
export type AllowlistDestination = z.infer<typeof DestinationSchema>;
export declare function loadAllowlist(configPath?: string): Promise<AllowlistConfig | null>;
export declare function saveAllowlist(config: AllowlistConfig, configPath?: string): Promise<string>;
export declare function allowlistExists(configPath?: string): Promise<boolean>;
export interface AllowlistCheckResult {
    allowed: boolean;
    requireMemo?: boolean;
    reason?: string;
    destination?: AllowlistDestination;
}
export declare function evaluateAllowlist(config: AllowlistConfig, toAddress: string, amountMicro: bigint, memo?: string): AllowlistCheckResult;
export declare function getAllowlistPath(): string;
export {};
//# sourceMappingURL=allowlist.d.ts.map