// Encrypted local keystore for ClawPurse
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { KEYSTORE_CONFIG, NEUTARO_CONFIG } from './config.js';
function getDefaultKeystorePath() {
    return path.join(os.homedir(), KEYSTORE_CONFIG.defaultPath);
}
function deriveKey(password, salt) {
    // Use scrypt for key derivation
    return crypto.scryptSync(password, salt, 32, {
        N: KEYSTORE_CONFIG.scryptN,
        r: KEYSTORE_CONFIG.scryptR,
        p: KEYSTORE_CONFIG.scryptP,
    });
}
function encrypt(plaintext, password) {
    const salt = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const key = deriveKey(password, salt);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return {
        ciphertext: encrypted + ':' + authTag.toString('hex'),
        salt: salt.toString('hex'),
        iv: iv.toString('hex'),
    };
}
function decrypt(ciphertext, salt, iv, password) {
    const [encryptedData, authTagHex] = ciphertext.split(':');
    const key = deriveKey(password, Buffer.from(salt, 'hex'));
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
export async function generateWallet() {
    const wallet = await DirectSecp256k1HdWallet.generate(24, {
        prefix: NEUTARO_CONFIG.bech32Prefix,
    });
    const [account] = await wallet.getAccounts();
    const mnemonic = wallet.mnemonic;
    return {
        mnemonic,
        address: account.address,
        wallet,
    };
}
export async function walletFromMnemonic(mnemonic) {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
        prefix: NEUTARO_CONFIG.bech32Prefix,
    });
    const [account] = await wallet.getAccounts();
    return {
        address: account.address,
        wallet,
    };
}
export async function saveKeystore(mnemonic, address, password, keystorePath) {
    const filePath = keystorePath || getDefaultKeystorePath();
    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const { ciphertext, salt, iv } = encrypt(mnemonic, password);
    const keystoreData = {
        version: 1,
        address,
        encryptedMnemonic: ciphertext,
        salt,
        iv,
        createdAt: new Date().toISOString(),
    };
    await fs.writeFile(filePath, JSON.stringify(keystoreData, null, 2), { mode: 0o600 });
    return filePath;
}
export async function loadKeystore(password, keystorePath) {
    const filePath = keystorePath || getDefaultKeystorePath();
    const data = await fs.readFile(filePath, 'utf8');
    const keystore = JSON.parse(data);
    if (keystore.version !== 1) {
        throw new Error(`Unsupported keystore version: ${keystore.version}`);
    }
    const mnemonic = decrypt(keystore.encryptedMnemonic, keystore.salt, keystore.iv, password);
    const { wallet } = await walletFromMnemonic(mnemonic);
    return {
        mnemonic,
        address: keystore.address,
        wallet,
    };
}
export async function keystoreExists(keystorePath) {
    const filePath = keystorePath || getDefaultKeystorePath();
    try {
        await fs.access(filePath);
        return true;
    }
    catch {
        return false;
    }
}
export async function getKeystoreAddress(keystorePath) {
    const filePath = keystorePath || getDefaultKeystorePath();
    try {
        const data = await fs.readFile(filePath, 'utf8');
        const keystore = JSON.parse(data);
        return keystore.address;
    }
    catch {
        return null;
    }
}
export { getDefaultKeystorePath };
//# sourceMappingURL=keystore.js.map