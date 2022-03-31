import { FastifyPluginOptions, FastifyInstance } from "fastify";

export type RegisterHandlerFn = (server: FastifyInstance, options: FastifyPluginOptions, next: () => void) => void;