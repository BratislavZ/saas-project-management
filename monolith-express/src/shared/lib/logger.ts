import { Application, Request, Response } from "express";
import pino from "pino";
import { pinoHttp } from "pino-http";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
      ignore: "pid,hostname",
    },
  },
});

export const setupPinoHttp = (app: Application) => {
  const customLogLevel = (_: Request, res: Response) => {
    if (res.statusCode >= 500) {
      return "error";
    }

    return "info";
  };

  const serializers = {
    req: (req: Request) => ({
      id: req.id,
      method: req.method,
      url: req.url,
    }),
    res: (res: Response) => ({
      statusCode: res.statusCode,
    }),
  };

  app.use(
    pinoHttp({
      logger,
      customLogLevel,
      serializers,
    })
  );
};
