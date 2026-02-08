export declare const NEUTARO_CONFIG: {
    readonly chainId: "Neutaro-1";
    readonly rpcEndpoint: "https://rpc2.neutaro.io";
    readonly restEndpoint: "https://api2.neutaro.io";
    readonly denom: "uneutaro";
    readonly displayDenom: "NTMPI";
    readonly decimals: 6;
    readonly gasPrice: "0.025uneutaro";
    readonly defaultGasLimit: 200000;
    readonly bech32Prefix: "neutaro";
};
export declare const KEYSTORE_CONFIG: {
    readonly defaultPath: ".clawpurse/keystore.enc";
    readonly scryptN: number;
    readonly scryptR: 8;
    readonly scryptP: 1;
    readonly maxSendAmount: 1000000000;
    readonly requireConfirmAbove: 100000000;
};
export declare const CLI_CONFIG: {
    readonly name: "clawpurse";
    readonly version: "2.0.0";
    readonly description: "Local Timpi/NTMPI wallet for agentic AI, automation, and individuals";
};
//# sourceMappingURL=config.d.ts.map