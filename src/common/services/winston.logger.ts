import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';
// import * as WinstonGraylog2 from 'winston-graylog2';

@Injectable()
export class WinstonLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    const esTransport = new ElasticsearchTransport({
      level: 'info',
      clientOpts: {
        node: 'http://elasticsearch:9200',
        // auth: {
        //   username: 'elastic',
        //   password: 'ealsticHuyastic',
        // },
      },
      indexPrefix: 'position-logs',
    });

    this.logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(
          ({ level, message, timestamp, context, ...meta }) => {
            const metaJson = JSON.stringify(meta);
            return `${timestamp} ${level}: [${context}] ${message} ${metaJson}`;
          },
        ),
        winston.format.prettyPrint(),
      ),

      transports: [new winston.transports.Console(), esTransport],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }

  verbose(message: string) {
    this.logger.verbose(message);
  }
}
