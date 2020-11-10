if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const { WebClient } = require("@slack/web-api");
const { createEventAdapter } = require("@slack/events-api");
const express = require("express");
// Initialize Express server

const app = express();
const port = process.env.PORT || 3000;

// Web
// An access token (from your Slack app or custom integration - xoxp, xoxb)
const token = process.env.SLACK_TOKEN;
const web = new WebClient(token);

// Event listener
const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);
// Attach the event adapter to the express app as a middleware
app.use("/slack/events", slackEvents.expressMiddleware());

// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
slackEvents.on("message", async (event) => {
  try {
    // Don't respond to yourself
    console.log(
      `Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`
    );
    if (event.user !== "U01EK3UC2H2") {
      const res = await web.chat.postMessage({
        channel: event.channel,
        text: "hi how are u",
      });
      console.log("Message sent: ", res.ts);
    }
  } catch (e) {
    console.error(e);
  }
});

slackEvents.on("app_mention", async (event) => {
  try {
    console.log("I got a mention in this channel", event.channel);
    const res = await web.chat.postMessage({
      channel: event.channel,
      text: "hey",
    });
    console.log("Message sent: ", res.ts);
  } catch (e) {
    console.error(e);
  }
});

// Handle errors (see `errorCodes` export)
slackEvents.on("error", console.error);

/* Slash commands */
// POST method route
app.post("/slack/shoutout", function (req, res) {
  console.log(req);
  res.send("POST request to the homepage");
});
// Start server
app.listen(port, () =>
  console.log(`shoutouts-bot express server listening on port ${port}!`)
);
