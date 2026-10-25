export interface OAuthParams {
  clientId: string;
  redirectUri: string;
  state: string;
  nonce?: string;
  responseType: string;
  codeChallenge?: string;
  codeChallengeMethod?: string;
  prompt?: string;
  invite?: string;
  expectedEmail?: string;
  isHeadlessMode: boolean;
}

export interface ParsedInvitation {
  rawCode: string;
  controlPlaneUrl?: string;
}

export interface UserIdentity {
  id: string;
  email: string;
  name: string;
  username: string;
  avatarUrl: string;
  provider: 'google' | 'github';
  emailVerified: boolean;
  authTime: number;
}

export interface IdentityAssertion {
  code: string;
  state: string;
  nonce?: string;
  invite?: string;
  controlPlaneUrl?: string;
  identity: UserIdentity;
  idToken: string;
  expiresIn: number;
  issuedAt: number;
}

