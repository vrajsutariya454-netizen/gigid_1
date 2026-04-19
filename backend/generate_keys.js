import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const platforms = ['Zomato', 'Uber', 'Swiggy', 'Ola', 'Dunzo'];
const keys = {};

platforms.forEach(p => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });
  keys[p.toLowerCase()] = { publicKey, privateKey };
});

const tsContent = `// Auto-generated mock private keys for platforms
import crypto from 'crypto';

export const PLATFORM_KEYS: Record<string, { privateKey: string, publicKey: string }> = ${JSON.stringify(keys, null, 2)};

export function signData(platformId: string, data: any) {
  const payloadStr = JSON.stringify(data);
  const privateKey = PLATFORM_KEYS[platformId]?.privateKey;
  if (!privateKey) throw new Error("No private key for " + platformId);
  
  const sign = crypto.createSign('SHA256');
  sign.update(payloadStr);
  sign.end();
  
  return {
    data,
    signature: sign.sign(privateKey, 'base64'),
    public_key: PLATFORM_KEYS[platformId].publicKey,
    signed_at: new Date().toISOString()
  };
}
`;

fs.writeFileSync(path.resolve('../src/lib/services/crypto-mock.ts'), tsContent);

const backendContent = `// Auto-generated mock public keys for backend verification
import crypto from 'crypto';

export const PUBLIC_KEYS = {}
`;
// Wait, I will just write the public keys to backend explicitly.
const pubKeysOnly = {};
platforms.forEach(p => pubKeysOnly[p.toLowerCase()] = keys[p.toLowerCase()].publicKey);

const backendJsContent = `// Auto-generated public keys for signature verification
export const PUBLIC_KEYS = ${JSON.stringify(pubKeysOnly, null, 2)};

export function verifySignature(data, signatureBase64, publicKeyPem) {
  const verify = crypto.createVerify('SHA256');
  verify.update(JSON.stringify(data));
  verify.end();
  return verify.verify(publicKeyPem, signatureBase64, 'base64');
}
`;

fs.writeFileSync(path.resolve('./utils/cryptoConfig.js'), backendJsContent);
console.log("Keys successfully generated and written.");
