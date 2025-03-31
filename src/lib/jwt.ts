import { SignJWT, jwtVerify } from 'jose'
import { nanoid } from 'nanoid'

export interface JWTPayload {
  jti: string
  iat: number
  exp: number
  sub: string
  role?: string
}

/**
 * Creates a signed JWT token
 * @param payload - Data to be included in the token
 * @returns Promise resolving to the signed token string
 */
export async function signJWT(
  payload: Omit<JWTPayload, 'jti' | 'iat' | 'exp'>,
): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET)
  if (!secret) {
    throw new Error('JWT_SECRET is not defined')
  }

  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(nanoid())
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret)

  return token
}

/**
 * Verifies and decodes a JWT token
 * @param token - JWT token to verify
 * @returns Promise resolving to the decoded payload
 */
export async function verifyJWT(token: string): Promise<JWTPayload> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET)
  if (!secret) {
    throw new Error('JWT_SECRET is not defined')
  }

  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as JWTPayload
  } catch {
    throw new Error('Invalid token')
  }
}
