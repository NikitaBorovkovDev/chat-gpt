import {Configuration, OpenAIApi} from "openai";
import config from "config";
import {createReadStream} from "fs";

class OpenAi {
    constructor(apiKey) {
        const configuration = new Configuration({
            apiKey: apiKey,
        });
        this.openAiApi = new OpenAIApi(configuration);
    }

    async chat(messages) {
        try {
            const res = await this.openAiApi.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages,
            });
            return res.data.choices[0].message;
        } catch (error) {
            console.log("error while chat", error);
        }
    }

    async transcription(filePath) {
        try {
            const res = await this.openAiApi.createTranscription(
                createReadStream(filePath),
                "whisper-1"
            );
            return res.data.text;
        } catch (error) {
            console.log("error while transcription", error);
        }
    }
}

export const openAi = new OpenAi(config.get("OPENAI_KEY"));
