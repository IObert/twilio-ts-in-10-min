# Template and Cheat Sheet for the 5-Minute-Demo with TypeScript

## Preprarations

1. Make sure webserver and ngrok aren't running
2. Reset this repository
    ```Bash
    git fetch origin
    git reset --hard origin/master
    ```
3. Open the "Buy a Number" page on the [Twilio Console](https://console.twilio.com/us1/develop/phone-numbers/manage/search?frameUrl=%2Fconsole%2Fphone-numbers%2Fsearch%3Fx-target-region%3Dus1&currentFrameUrl=%2Fconsole%2Fphone-numbers%2Fsearch%3FisoCountry%3DDE%26searchTerm%3D%26searchFilter%3Dleft%26searchType%3Dnumber%26x-target-region%3Dus1%26__override_layout__%3Dembed%26bifrost%3Dtrue)

## Demo Flow

1. **Buy a new number**

2. **Create a new file `.env`**
    ```
    SECRET="Don't tell anyone"
    PROMO="<code22>"
    TWILIO_ACCOUNT_SID="<insert>"
    TWILIO_AUTH_TOKEN="<insert>"
    TWILIO_SENDER="<insert>"
    TWILIO_RECEIVER="<insert>"
    ```
2. **Add a second endpoint** in the `src/server.ts`
    ```TypeScript
    .all("/sms", async (_, reply) => {
        reply.type("text/xml");
        reply.send(`
        <Response>
            <Message><Body>Hello, \nhave fun with this ${process.env.PROMO} \nGreetings from Munich 🦁</Body></Message>
        </Response>
        `);
    })
    ```
    This won't work out-of-the-box. You also need to be able to add a body parser for `content-type: application/json`.
    ```Bash
    yarn add -D fastify-formbody
    ```
    ```TypeScript
    import FastifyBodyParser from "fastify-formbody";

    server
        .register(FastifyBodyParser)
    ```
3. Install Twilio client (and use factory to build TwiML)
    ```Bash
    yarn add twilio
    ```
4. **Create a new file `makeCalls.ts`** 
    ```TypeScript
    import { Twilio, twiml } from "twilio";

    const call = new twiml.VoiceResponse();

    call.say(`Yay! It worked. Let's cut to the chase. Tabs, 2 spaces, or 4 spaces
    - what do you prefer? Hit 1 for tabs, 2 for 2 spaces and 4 for four spaces. Press # to confirm.`);
    call.gather({
    numDigits: 1,
    actionOnEmptyResult: false,
    action: "https://mobert.ngrok.io/gatherAction",
    });
    call.say("Thank you and goodbye.");

    console.log(call.toString());

    new Twilio().calls
    .create({
        twiml: call.toString(),
        to: process.env.TWILIO_RECEIVER || "",
        from: process.env.TWILIO_SENDER || "",
    })
    .then((call) => console.log(`Triggered a call to ${call.sid}.`));
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

    Test this endpoint:
    ```
    ### Test the "gatherAction" endpoint
    POST http://localhost:3000/gatherAction
    Content-Type: application/json

    {
        "Digits": 2,
        "From": 186000000
    }
    ```

    Then, start the calls
    ```Bash
    npx ts-node src/makeCalls.ts
    ```
  > Optional: Store all incoming callers and pick a random one to call back.