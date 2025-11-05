import pino from "pino";
import fs from "fs";
import path from "path";

const logDir = path.join(process.cwd(), "logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = pino({
  level: "info",
  timestamp: pino.stdTimeFunctions.isoTime,
  base: null,
  transport: {
    targets: [
      {
        target: "pino-pretty",
        level: "info",
        options: {
          colorize: false,
          translateTime: "yyyy-mm-dd HH:MM:ss",
          singleLine: true,
          destination: `${logDir}/app.log`,
        },
      },
      {
        target: "pino-pretty",
        level: "error",
        options: {
          colorize: false,
          translateTime: "yyyy-mm-dd HH:MM:ss",
          singleLine: true,
          destination: `${logDir}/error.log`,
        },
      },
    ],
  },
});

export default logger;
