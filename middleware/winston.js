const winston = require("winston");

    const env = process.env.NODE_ENV;
    const logger = winston.createLogger({
        level:"debug",
        format:winston.format.json(),
        defaultMeta: { environment: `${env==="development"?"prod-debug":"dev-debug"}` },
        transports: [
            new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
            new winston.transports.File({ filename: 'logs/combined.log',level: 'debug'}),
        ],
    });

    if(process.env.NODE_ENV === 'development'){
        logger.add(
            new winston.transports.Console({
                format: winston.format.simple()
            }));

    };

module.exports= logger;