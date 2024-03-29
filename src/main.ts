import fastify from "fastify";
import cors from "fastify-cors";
import { registerEndpoints } from "./routes";

const server = fastify({
  logger: true,
  ajv: {
    customOptions: {
      // Without this nulls will be converted to zeros, for example
      coerceTypes: false,
      // TODO: Debug why this doesn't work
      removeAdditional: true,
    },
  },
});

server.register(cors);

// Root level endpoint registration under the global prefix
server.register(registerEndpoints, { prefix: "/api/v1" });

const start = async () => {
  try {
    await server.listen(3000);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
console.log("Listening to port: 3000");
