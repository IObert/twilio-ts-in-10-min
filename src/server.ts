import fastify, { FastifyInstance } from "fastify";

const server: FastifyInstance = fastify({});

server
  .all("/pull", async (_, reply) => {
    reply.send({ hello: "world", secret: process.env.SECRET });
  });

server.listen(3000, function (err, address) {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  console.log(`Restarted at: ${address}`);
});
