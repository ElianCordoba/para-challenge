import { FastifyReply } from "fastify";

export const Ok = { ok: true };

export interface ServerError {
  message: string;
  code: number;

  [additionInformation: string]: any;
}

export function Generic(
  message?: string,
  code?: number,
  additionInformation?: any
): ServerError {
  return {
    message: message || "Internal error",
    code: code ?? 500,
    additionInformation,
  };
}

export function NotFound(
  message?: string,
  code?: number,
  additionInformation?: any
): ServerError {
  return {
    message: message || "Not found",
    code: code ?? 404,
    additionInformation,
  };
}

export function respondWithError(res: FastifyReply, error: any) {
  const code = Number(error.code) || 500;
  const message = error.message || "Internal error";

  const additionInformation = error?.additionInformation || {};

  res.code(code).send({ ok: false, message, ...additionInformation });
}
