import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import "dotenv/config";

import {
  Client,
  Events,
  GatewayIntentBits,
  TextChannel,
  userMention,
} from "discord.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// Evento que se ejecuta cuando el cliente está listo
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);
});

// Conecta el bot a Discord
client.login(process.env.DISCORD_TOKEN);

const app = new Hono().basePath("/api");
app.use("/*", cors());

app.get("/", (c) => {
  return c.json({ message: "Hello Hackafor!" });
});

app.post("/message", async (c) => {
  const channel = client.channels.cache.get(process.env.CHANNEL_ID!);
  if (!channel) return c.text("Channel not found", 500);
  if (!(channel instanceof TextChannel))
    return c.text("Channel not found", 500);

  const { sender, receiver } = await c.req.json();

  const senderMention = userMention(sender.user_metadata.provider_id);
  const receiverMention = userMention(receiver.user_metadata.provider_id);

  await channel.send(
    `${senderMention} quiere contactar contigo, ${receiverMention}`
  );

  return c.json({});
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
