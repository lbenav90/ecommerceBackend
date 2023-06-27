import program from '../process.js';
import winston from 'winston';

const customLevels = {
    levels: {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5
    },
    colors: {
        debug: 'white',
        http: 'green',
        info: 'blue',
        warning: 'yellow',
        error: 'red',
        fatal: 'magenta'
    }
}

let transports;

if (program.opts().mode === 'production') {
    transports = [
        new winston.transports.Console({ 
            level: 'info', 
            format: winston.format.combine(
                winston.format.colorize({ colors: customLevels.colors }),
                winston.format.simple()
            ) 
        }),
        new winston.transports.File({ filename: './errors.log', level: 'error', format: winston.format.simple() })
    ]
} else {
    transports = [
        new winston.transports.Console({ 
            level: 'debug', 
            format: winston.format.combine(
                winston.format.colorize({ colors: customLevels.colors }),
                winston.format.simple()
            ) 
        })
    ]
}


const logger = winston.createLogger({
    levels: customLevels.levels,
    transports: transports
})

logger.info("Options: ", program.opts());
logger.info(`Mode Option: ${program.opts().mode}`);
logger.info(`Remaining arguments: ${program.args}`);

export const addLogger = (req, res, next) => {
    req.logger = logger;
    req.logger.info(`${req.method} request on ${req.url} - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`)
    next();
}

export default logger;