const os = require("os");
const winston = require("winston");
require('winston-daily-rotate-file');
const LocalStorage = require("./LocalStorage");


const { splat, combine, timestamp, printf } = winston.format; 

class Logger {
  constructor(name, options = {}) {
    this.name = name;
    this.maxFiles = this.maxFiles
    this.winston_drf_params = {
      filename: `${this.name}-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      json: true,
      zippedArchive: false,
      maxSize: '10m',
      maxFiles: this.maxFiles,
      dirname: options.path,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.colorize()
      )
    }

    this.hostname = os.hostname();

    this.logger = winston.createLogger({
      level: options.logLevel,
      defaultMeta: { service: name },
      transports: [
        new winston.transports.DailyRotateFile(this.winston_drf_params)
      ]
    });

    if (options.sensitiveFields) {
      this.sensitiveFields = options.sensitiveFields;
      this.checkSensitiveFields = true;
    }
  }

  winstonConsoleFormat() {
    return printf(({ timestamp, level, message, metadata }) => {
      const metadataString = metadata != null ? JSON.stringify(metadata) : "";
      return `[${timestamp}][${level}][${this.name}@${
        this.hostname
      }] ${message}. ${"METADATA: " + metadataString}`;
    });
  }

  debug(log, metadata) {
    this.log("debug", log, metadata);
  }

  info(log, metadata) {
    this.log("info", log, metadata);
  }

  warn(log, metadata) {
    this.log("warn", log, metadata);
  }

  error(log, metadata) {
    this.log("error", log, metadata);
  }

  verbose(log, metadata) {
    this.log("verbose", log, metadata);
  }

  log(level, log, metadata, stackTrace) {
    const store = LocalStorage.getStore();
    const metadataObject = {};

    if (store) {
      metadataObject.uniqueId = store.id;
    }

    if (metadata) metadataObject.metadata = metadata;
    if (stackTrace) metadataObject.stackTrace = stackTrace;

    if (this.checkSensitiveFields) {
      const sensitiveFieldFound = Object.keys(
        metadataObject.metadata || {}
      ).find(key => this.sensitiveFields.includes(key));
      if (sensitiveFieldFound)
        return this.logTrace(
          "warn",
          `You tried to log the following sensitive key: "${sensitiveFieldFound}". Please check attached stack trace.`
        );
    }

    if (log instanceof Error) {
      return this.logger[level](log.message, {
        metadata: { stack: log.stack }
      });
    }

    this.logger[level](JSON.stringify(log), JSON.stringify(metadataObject));
  }

  logTrace(level, log, metadata) {
    const stackTrace = new Error().stack;
    this.log(level, log, metadata, stackTrace);
  }
}

module.exports = {
  Logger
}

// logger = new Logger('abc', {
//   logLevel: 'verbose'
// });

// logger.verbose('h')