import fastify, { FastifyInstance } from "fastify";

const server: FastifyInstance = fastify({});

server
  .all("/hello", async (_, reply) => {
    reply.send({ hello: "world" });
  });

server.listen(3000, function (err, address) {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  console.log(`Restarted at: ${address}`);
});
