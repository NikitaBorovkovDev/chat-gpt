import axios from "axios";
import {createWriteStream} from "fs";
import {dirname, resolve} from "path";
import {fileURLToPath} from "url";
import Ffmpeg from "fluent-ffmpeg";
import installer from "@ffmpeg-installer/ffmpeg";
import {removeFile} from "./utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

class OggConverter {
    constructor() {
        Ffmpeg.setFfmpegPath(installer.path);
    }

    toMP3(input, output) {
        try {
            const outputPath = resolve(dirname(input), `${output}.mp3`);
            return new Promise((resolve, reject) => {
                Ffmpeg(input)
                    .inputOption("-t 30")
                    .output(outputPath)
                    .on("end", () => {
                        removeFile(input);
                        resolve(outputPath);
                    })
                    .on("error", (err) => reject(err.message))
                    .run();
            });
        } catch (error) {
            console.log("error while convert to mp3".error.message);
        }
    }

    async create(url, filename) {
        try {
            const oggPath = resolve(__dirname, "../voices", `${filename}.ogg`);
            const res = await axios({
                method: "get",
                url,
                responseType: "stream",
            });
            return new Promise((resolve, reject) => {
                const stream = createWriteStream(oggPath);
                res.data.pipe(stream);
                stream.on("finish", () => resolve(oggPath));
            });
        } catch (error) {
            console.log("error while creating ogg", error.message);
        }
    }
}

export const ogg = new OggConverter();
