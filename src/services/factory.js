import program from '../process.js';
import MongoSingleton from '../config/mongodb-singleton.js';
import logger from '../config/logger.js';

// Para cambiar de persistencia
// node src/app.js --persist files --mode dev

let cManager, pManager, uManager, tManager;

switch (program.opts().system) {
    case 'database':
        const mongoInstance = async () => {
            logger.info("Entrando a iniciar Service para MongoDb");
            try {
                await MongoSingleton.getInstance();
            } catch (error) {
                console.error(error);
                process.exit(0);
            }
        };
        await mongoInstance();
        
        const { default: ProductSeviceDB } = await import('./db/product.services.js')
        pManager = ProductSeviceDB.getInstance();

        const { default: CartServiceDB } = await import('./db/cart.services.js')
        cManager = CartServiceDB.getInstance();

        const { default: UserSeviceDB } = await import('./db/users.services.js')
        uManager = UserSeviceDB.getInstance();

        const { default: TicketSeviceDB } = await import('./db/ticket.services.js')
        tManager = TicketSeviceDB.getInstance();


        logger.info("Managers loaded");
        break;
    case 'files':
        const { default: ProductSeviceFile } = await import('./filesystem/product.services.js')
        pManager = ProductSeviceFile.getInstance();

        const { default: CartServiceFile } = await import('./filesystem/cart.services.js')
        cManager = CartServiceFile.getInstance();

        const { default: UserSeviceFile } = await import('./filesystem/users.services.js')
        uManager = UserSeviceFile.getInstance();

        const { default: TicketSeviceFile } = await import('./filesystem/ticket.services.js')
        tManager = TicketSeviceFile.getInstance();
        
        
        logger.info("Managers loaded");
        break;

    default:
        break;
}

export { cManager, pManager, uManager, tManager }