import { Command } from 'commander'

let program;

const assignCommand = () => {
    program = new Command();
    
    program
        .option('-p <port>', 'Puerto del server', 8080)
        .option('--mode <mode>', 'Modo de trabajo', 'developer')
        .option('--system <system>', 'Sistema de persistencia', 'database')
    
    program.parse() //Parsea los comandos y valida si son correctos.
    
    console.log("Options: ", program.opts());
    console.log("Mode Option: ", program.opts().mode);
    console.log("Remaining arguments: ", program.args);
}

!program && assignCommand()

export default program;