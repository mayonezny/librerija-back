import { FastifyRequest } from 'fastify';
export interface Payload {
  uuid: string;
  email: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export type cookie = Record<string, string>;
export interface RequestWithUser extends FastifyRequest {
  user: Payload;
  cookies: cookie;
}
