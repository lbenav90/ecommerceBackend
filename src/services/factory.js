import program from '../process.js';
import MongoSingleton from '../config/mongodb-singleton.js';

// Para cambiar de persistencia
// node src/app.js --persist files --mode dev

let cManager, pManager, uManager, tManager;

switch (program.opts().system) {
    case 'database':
        const mongoInstance = async () => {
            console.log("Entrando a iniciar Service para MongoDb");
            try {
                await MongoSingleton.getInstance();
            } catch (error) {
                console.error(error);
                process.exit(0);
            }
        };
        await mongoInstance();
        
        const { default: CartServiceDB } = await import('./db/cart.services.js')
        const { default: ProductSeviceDB } = await import('./db/product.services.js')
        const { default: UserSeviceDB } = await import('./db/users.services.js')
        const { default: TicketSeviceDB } = await import('./db/ticket.services.js')

        cManager = CartServiceDB.getInstance();
        pManager = ProductSeviceDB.getInstance();
        uManager = UserSeviceDB.getInstance();
        tManager = TicketSeviceDB.getInstance();

        console.log("Cart and Product managers loaded");
        break;
    case 'files':
        const { default: CartServiceFile } = await import('./filesystem/cart.services.js')
        const { default: ProductSeviceFile } = await import('./filesystem/product.services.js')
        const { default: UserSeviceFile } = await import('./filesystem/users.services.js')
        const { default: TicketSeviceFile } = await import('./filesystem/ticket.services.js')
        
        cManager = CartServiceFile.getInstance();
        pManager = ProductSeviceFile.getInstance();
        uManager = UserSeviceFile.getInstance();
        tManager = TicketSeviceFile.getInstance();
        
        console.log("Cart and Product managers loaded");
        break;

    default:
        break;
}

export { cManager, pManager, uManager, tManager }