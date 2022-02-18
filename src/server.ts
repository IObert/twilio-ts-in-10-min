import fastify, { FastifyInstance } from "fastify";
import FastifyBodyParser from "fastify-formbody";
import { twiml } from "twilio";

const server: FastifyInstance = fastify({});

server
  .register(FastifyBodyParser)
  .all("/hello", async (_, reply) => {
    reply.send({ hello: "world", secret: process.env.SECRET });
  })
  .all("/sms", async (_, reply) => {
    reply.type("text/xml");
    reply.send(`
    <Response><Message><Body>
    Hello,\nhave fun with this promo code "${process.env.PROMO}"\nGreetings from Munich 🦁
    </Body></Message></Response>
    `);
  })
  .all("/gatherAction", async (request, reply) => {
    const options = [
      "",
      "Vote for 'Tabs'",
      "Vote for 'Two Spaces'",
      "",
      "Vote for 'Four Spaces'",
    ];
    // @ts-ignore
    const vote = +request.body.Digits;
    console.log(options[vote]);
    const confirmTwiMl = new twiml.VoiceResponse();
    confirmTwiMl.say("Thanks for voting. Goodbye.");
    reply.type("text/xml");
    reply.send(confirmTwiMl.toString());
  });

server.listen(3000, function (err, address) {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  console.log(`Restarted at: ${address}`);
});
