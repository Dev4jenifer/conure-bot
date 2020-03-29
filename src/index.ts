import Discord, { Message } from "discord.js";
import dotenv from "dotenv";
import commands from "./commands";
import logger from "./utils/logger";
import { serverQueues } from './utils/queue'

dotenv.config();

const bot = new Discord.Client();

const closeBot = () => {
  bot.destroy();
  serverQueues.forEach(queue => {
    if (queue.connection)
      queue.connection.disconnect()
  })
  console.log("Bot logged out successfully. Exiting process..");
}

process.on("beforeExit", closeBot)

process.on("SIGINT", closeBot)

process.on("SIGTERM", closeBot)

bot.on("ready", () => {
  console.log(`Connected as as ${bot.user.tag}! Mode: ${process.env.NODE_ENV}\n`);
  serverQueues.clear()
  bot.guilds.cache.map((g) => {
    if (process.env.NODE_ENV === "production") {
      try {
        g.systemChannel.send(`Here I am! Following the whistle of change..
Do you want to know what I can do? Try to type **!help** or **!commands**`)
      } catch (e) {
        logger(bot, "startup", null, "Missing message permission for System Channel")
      }
    }
  })
  process.stdin.resume();
});

bot.on("error", (err) => {
  logger(bot, "error", null, err);
})

bot.on("message", async (msg: Message) => {
  if (!msg.content.startsWith(`${process.env.PREFIX}`)) return;
  else if (msg.author.bot) return
  commands(bot, msg)
});

bot.on("guildMemberAdd", (member) => {
  member.guild.systemChannel.send(`Welcome aboard, <@${member.id}>!`)
})

bot.login(process.env.AUTH_TOKEN)
