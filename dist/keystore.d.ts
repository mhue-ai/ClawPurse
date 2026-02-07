import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
export interface KeystoreData {
    version: 1;
    address: string;
    encryptedMnemonic: string;
    salt: string;
    iv: string;
    createdAt: string;
}
export interface DecryptedWallet {
    mnemonic: string;
    address: string;
    wallet: DirectSecp256k1HdWallet;
}
declare function getDefaultKeystorePath(): string;
export declare function generateWallet(): Promise<{
    mnemonic: string;
    address: string;
    wallet: DirectSecp256k1HdWallet;
}>;
export declare function walletFromMnemonic(mnemonic: string): Promise<{
    address: string;
    wallet: DirectSecp256k1HdWallet;
}>;
export declare function saveKeystore(mnemonic: string, address: string, password: string, keystorePath?: string): Promise<string>;
export declare function loadKeystore(password: string, keystorePath?: string): Promise<DecryptedWallet>;
export declare function keystoreExists(keystorePath?: string): Promise<boolean>;
export declare function getKeystoreAddress(keystorePath?: string): Promise<string | null>;
export { getDefaultKeystorePath };
//# sourceMappingURL=keystore.d.ts.map