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
    action: "https://mobert.ngrok.io/gatherAction",
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
