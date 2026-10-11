import { UserIdentity, IdentityAssertion } from '../types/auth';

/**
 * Generate a random alphanumeric string for codes and state
 */
export function generateRandomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const cryptoObj = window.crypto || (window as unknown as { msCrypto: Crypto }).msCrypto;
  if (cryptoObj && cryptoObj.getRandomValues) {
    const values = new Uint8Array(length);
    cryptoObj.getRandomValues(values);
    for (let i = 0; i < length; i++) {
      result += chars[values[i] % chars.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return result;
}

/**
 * Encodes an object to standard Base64URL string (for mock ID token payload)
 */
function base64UrlEncode(obj: Record<string, unknown>): string {
  const json = JSON.stringify(obj);
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Generate a mock signed JWT ID Token representing verified user identity
 */
export function generateIdToken(identity: UserIdentity, clientId: string, nonce?: string): string {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
    kid: 'inv_key_2026_01',
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: 'https://invariantproject.com',
    sub: identity.id,
    aud: clientId,
    exp: now + 3600,
    iat: now,
    auth_time: Math.floor(identity.authTime / 1000),
    nonce: nonce || undefined,
    email: identity.email,
    email_verified: identity.emailVerified,
    name: identity.name,
    preferred_username: identity.username,
    picture: identity.avatarUrl,
    idp: identity.provider,
    // Pure identity verification indicator
    purpose: 'identity_verification',
  };

  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(payload);
  const mockSignature = generateRandomString(43);

  return `${encodedHeader}.${encodedPayload}.${mockSignature}`;
}

/**
 * Create full Identity Assertion for CLI completion
 */
export function createIdentityAssertion(
  identity: UserIdentity,
  state: string,
  clientId: string,
  nonce?: string
): IdentityAssertion {
  const code = `inv_id_${generateRandomString(24)}`;
  const idToken = generateIdToken(identity, clientId, nonce);

  return {
    code,
    state,
    nonce,
    identity,
    idToken,
    expiresIn: 300,
    issuedAt: Date.now(),
  };
}
