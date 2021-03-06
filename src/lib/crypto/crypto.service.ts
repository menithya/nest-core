import * as crypto from 'crypto';

import { CryptoConfig } from './crypto.dto';

/*
|--------------------------------------------------------------------------
| References
|--------------------------------------------------------------------------
| https://gist.github.com/AndiDittrich/4629e7db04819244e843
| https://gist.github.com/vlucas/2bd40f62d20c1d49237a109d491974eb
| https://gist.github.com/yoavniran/c78a0991e0152b306c25|
| https://gist.github.com/chris-rock/993d8a22c7138d1f0d2e
|
*/

/**
 * Encryption and Decryption
 * @description https://gist.github.com/AndiDittrich/4629e7db04819244e843
 */
export class CryptoService {
  constructor(private readonly config: CryptoConfig) {}

  encrypt(text: string) {
    // random initialization vector
    const iv = crypto.randomBytes(16);

    // random salt
    const salt = crypto.randomBytes(64);

    // derive key: 32 byte key length - in assumption the masterkey is a cryptographic and NOT a password there is no need for
    // a large number of iterations. It may can replaced by HKDF
    const key = crypto.pbkdf2Sync(this.config.CRYPTO_ENCRYPTION_KEY, salt, 2145, 32, 'sha512');

    // AES 256 GCM Mode
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    // encrypt the given text
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);

    // extract the auth tag
    const tag = cipher.getAuthTag();

    // generate output
    return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
  }

  decrypt(cipherText: string) {
    // base64 decoding
    const bData = Buffer.from(cipherText, 'base64');

    // convert data to buffers
    const salt = bData.slice(0, 64);
    const iv = bData.slice(64, 80);
    const tag = bData.slice(80, 96);
    const text = bData.slice(96);

    // derive key using; 32 byte key length
    const key = crypto.pbkdf2Sync(this.config.CRYPTO_ENCRYPTION_KEY, salt, 2145, 32, 'sha512');

    // AES 256 GCM Mode
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);

    // encrypt the given text (NOTE: text as any)
    const decrypted = decipher.update(text as any, 'binary', 'utf8') + decipher.final('utf8');

    return decrypted;
  }

  /**
   * NodeJS create md5 hash from string
   * @see https://gist.github.com/kitek/1579117/8cd97e0d85c3fca35036d4f76dd6f32d8ffe1e46
   */
  createMD5Hex(data: string) {
    return crypto.createHash('md5').update(data).digest('hex');
  }
}
