# Template and Cheat Sheet for the 5-Minute-Demo with TypeScript

## Preprarations

1. Make sure ngrok and the server aren't running
2. Reset this repository
   ```Bash
   git stash
   git fetch origin
   git checkout main
   git reset --hard origin/master
   ```
3. Prepare the `.env` (based on `test.env`) file with the account secrets 
4. Make sure the promo code is valid
5. Open the [Twilio Console](https://console.twilio.com/us1/develop/phone-numbers/manage/search?frameUrl=%2Fconsole%2Fphone-numbers%2Fsearch%3Fx-target-region%3Dus1&currentFrameUrl=%2Fconsole%2Fphone-numbers%2Fsearch%3FisoCountry%3DDE%26searchTerm%3D%26searchFilter%3Dleft%26searchType%3Dnumber%26x-target-region%3Dus1%26__override_layout__%3Dembed%26bifrost%3Dtrue) 


## Demo Flow

1. **Buy a new number** via the Twilio Console 
    > Alternative: Use the CLI
    > ```Bash
    > twilio phone-numbers:buy:mobile --country-code US
    > # twilio phone-numbers:buy:mobile --country-code DE --address-sid ADhash --bundle-sid BUhash 
    > ```

2. Start the server with `yarn dev` and talk about the `/hello` endpoint `.env`.
3. Encourage everyone to turn on their ringer.
4. Expose `process.env.SECRET` via request
5. **Add a second endpoint** in the `src/server.ts`

   ```TypeScript
   .all("/sms", async (_, reply) => {
        reply.type("text/xml");
        reply.send(`
        <Response><Message><Body>
        Hello,\nhave fun with this promo code "${process.env.PROMO}"\nGreetings from Munich 🦁
        </Body></Message></Response>
        `);
   })
   ```
   This won't work out-of-the-box. You also need to be able to add a body parser for `content-type: application/json`.

   ```Bash
   yarn add @fastify/formbody@6
   ```

   ```TypeScript
   import FastifyBodyParser from "@fastify/formbody";

   server
       .register(FastifyBodyParser)
   ```

   > If needed, you can test this request with:
   >
   > ```
   > ### Test post to sms endpoint
   > POST http://localhost:3000/sms HTTP/1.1
   > Content-Type: application/json
   >
   > {}
   > ```

6. Start `ngrok` and there the webhook in the console.

   ```Bash
   ngrok http 3000
   # or
   ngrok http -subdomain=<domain> 3000
   ```
7. Install Twilio client (and use factory to build TwiML)
   ```Bash
   yarn add twilio
   ```
8. **Create a new file `makeCalls.ts`**

   ```TypeScript
    import { Twilio, twiml } from "twilio";

    const MY_NUMBER = "4915735981024";

    (async () => {
    const client = new Twilio(
        process.env.TWILIO_ACCOUNT_SID || "",
        process.env.TWILIO_AUTH_TOKEN || ""
    );

    const messages = await client.messages.list({
        to: MY_NUMBER,
    });

    messages.forEach((message) => {
        console.log(message.body);
    });

    const callTwiMl = new twiml.VoiceResponse();

    callTwiMl.say(`Yay, It worked. Let's cut to the chase.
    Tabs, 2 spaces, or 4 spaces - What do you prefer?
    Hit 1 for tabs, 2 for 2 spaces and 4  for 4 spaces.
    Press # to confirm`);
    callTwiMl.gather({
        numDigits: 1,
        actionOnEmptyResult: false,
        action: "https://<subdomain>.ngrok.io/gatherAction",
    });

    console.log(callTwiMl.toString());

    new Set(messages.map((message) => message.from)).forEach((sender) => {
        client.calls
        .create({
            twiml: callTwiMl.toString(),
            to: sender,
            from: MY_NUMBER,
        })
        .then((call) => {
            console.log(`Started call ${call.sid}`);
        });
    });
    })();
   ```

   Add the corresponding implementation in `server.ts`.

   ```TypeScript
   .all("/gatherAction", async (request, reply) => {
       const options = [
           "",
           "Vote for 'Tabs'",
           "Vote for 'Two Spaces'",
           "",
           "Vote for 'Four Spaces'",
       ];
       // @ts-ignore
       const digit = +request.body.Digits;
       console.log(options[+digit]);

       const confirm = new twiml.VoiceResponse();
       confirm.say("Thank you and goodbye.");
       reply.type("text/xml");
       reply.send(confirm.toString());
   });
   ```

   Then, start the calls

   ```Bash
   npx ts-node -r dotenv/config src/makeCalls.ts
   ```

   > If needed, test this endpoint
   >
   > ```
   > ### Test the "gatherAction" endpoint
   > POST http://localhost:3000/gatherAction HTTP/1.1
   > Content-Type: application/json
   >
   > {
   >  "Digits": "2"
   > }
   > ```


## Congrats

[![Giphy](https://media4.giphy.com/media/26u4lOMA8JKSnL9Uk/giphy.gif?cid=790b7611b6297b687bede36853d4839738abd75e6e6b1c2e&rid=giphy.gif&ct=g)](https://giphy.com/gifs/reactionseditor-reaction-26u4lOMA8JKSnL9Uk)