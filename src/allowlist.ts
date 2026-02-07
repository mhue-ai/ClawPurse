// Address allowlist for trusted senders/recipients
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

export interface AllowlistConfig {
  enabled: boolean;
  mode: 'send' | 'receive' | 'both';
  addresses: string[];
  labels: Record<string, string>; // address -> human-readable label
}

const DEFAULT_CONFIG: AllowlistConfig = {
  enabled: false,
  mode: 'both',
  addresses: [],
  labels: {},
};

function getAllowlistPath(): string {
  return path.join(os.homedir(), '.clawpurse', 'allowlist.json');
}

export async function loadAllowlist(): Promise<AllowlistConfig> {
  try {
    const data = await fs.readFile(getAllowlistPath(), 'utf8');
    return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function saveAllowlist(config: AllowlistConfig): Promise<void> {
  const filePath = getAllowlistPath();
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(config, null, 2));
}

export async function addToAllowlist(
  address: string,
  label?: string
): Promise<void> {
  const config = await loadAllowlist();
  
  if (!config.addresses.includes(address)) {
    config.addresses.push(address);
  }
  
  if (label) {
    config.labels[address] = label;
  }
  
  await saveAllowlist(config);
}

export async function removeFromAllowlist(address: string): Promise<boolean> {
  const config = await loadAllowlist();
  const index = config.addresses.indexOf(address);
  
  if (index === -1) {
    return false;
  }
  
  config.addresses.splice(index, 1);
  delete config.labels[address];
  await saveAllowlist(config);
  return true;
}

export async function isAllowed(
  address: string,
  operation: 'send' | 'receive'
): Promise<{ allowed: boolean; reason?: string }> {
  const config = await loadAllowlist();
  
  // If allowlist is disabled, everything is allowed
  if (!config.enabled) {
    return { allowed: true };
  }
  
  // Check if operation type matches
  if (config.mode !== 'both' && config.mode !== operation) {
    return { allowed: true }; // Allowlist doesn't apply to this operation
  }
  
  // Check if address is in allowlist
  if (config.addresses.includes(address)) {
    return { allowed: true };
  }
  
  const label = config.labels[address];
  return {
    allowed: false,
    reason: `Address ${address}${label ? ` (${label})` : ''} is not in the allowlist. ` +
            `Add it with: clawpurse allowlist add ${address}`,
  };
}

export async function listAllowlist(): Promise<Array<{ address: string; label?: string }>> {
  const config = await loadAllowlist();
  return config.addresses.map(address => ({
    address,
    label: config.labels[address],
  }));
}

export async function setAllowlistEnabled(enabled: boolean): Promise<void> {
  const config = await loadAllowlist();
  config.enabled = enabled;
  await saveAllowlist(config);
}

export async function setAllowlistMode(mode: 'send' | 'receive' | 'both'): Promise<void> {
  const config = await loadAllowlist();
  config.mode = mode;
  await saveAllowlist(config);
}
