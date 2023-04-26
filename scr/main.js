import {Telegraf, session} from "telegraf";
import config from "config";
import {message} from "telegraf/filters";
import {ogg} from "./ogg.js";
import {openAi} from "./openAi.js";
import {code} from "telegraf/format";

const INITIAL_SESSION = {
    messages: [],
};

const bot = new Telegraf(config.get("TELEGRAM_TOKEN"));

bot.use(session());

bot.command("new", async (context) => {
    context.session = INITIAL_SESSION;
    await context.reply("создан новый контекст");
});

bot.command("start", async (context) => {
    context.session = INITIAL_SESSION;
    await context.reply("создан новый контекст");
});

bot.on(message("voice"), async (context) => {
    context.session ??= INITIAL_SESSION;
    try {
        await context.reply(code("..."));
        const link = await context.telegram.getFileLink(
            context.message.voice.file_id
        );
        const userId = String(context.message.from.id);

        const oggPath = await ogg.create(link.href, userId);
        const mp3Path = await ogg.toMP3(oggPath, userId);

        const text = await openAi.transcription(mp3Path);

        await context.reply(code(`запрос: ${text}`));

        context.session.messages.push({role: "user", content: text});

        const response = await openAi.chat(context.session.messages);

        context.session.messages.push({
            role: "assistant",
            content: response.content,
        });

        await context.reply(response.content);
    } catch (error) {
        console.log("error while voice message", error);
    }
    // await context.reply(JSON.stringify(context.message.voice));
});

bot.on(message("text"), async (context) => {
    context.session ??= INITIAL_SESSION;
    try {
        await context.reply(code("..."));
        const text = context.message.text;

        context.session.messages.push({role: "user", content: text});

        const response = await openAi.chat(context.session.messages);

        context.session.messages.push({
            role: "assistant",
            content: response.content,
        });

        await context.reply(JSON.stringify(context.session));
        await context.reply(response.content);
    } catch (error) {
        console.log("error while text message", error);
    }
    // await context.reply(JSON.stringify(context.message.voice));
});

bot.command("start", async (context) => {
    await context.reply(JSON.stringify(context.message));
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
