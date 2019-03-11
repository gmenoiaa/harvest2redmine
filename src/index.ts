import dotenv from 'dotenv';
import readline from 'readline';
import colors from 'colors/safe';
import RemoveCommand from './command/RemoveCommand';
import CreateCommand from './command/CreateCommand';
import {extractErrorMsg} from "./util/index";
import ListCommand from './command/ListCommand';
import {createHarvest, createRedmine} from './factory';
import {SyncResult, SyncStatus} from "./model";

const packageJson = require('../package.json');

dotenv.config();

const projectId = parseInt(process.env.HARVEST_PROJECT_ID || '0');
const redmineUserId = parseInt(process.env.REDMINE_USER_ID || '0');
const harvest = createHarvest();
const redmine = createRedmine();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: colors.gray('H2R> '),
});

const askPrompt = () => {
    console.log();
    rl.prompt();
};

const handleError = (reason: any) => {
    console.log(colors.red(extractErrorMsg(reason)));
    askPrompt();
};

const handleDone = () => {
    console.log(colors.green('Done'));
    askPrompt();
};

const init = () => {
    console.log(colors.blue(`${packageJson.name} ${packageJson.version}`));
    rl.prompt();
};

rl.on('line',(line) => {
    const args = line.split(' ');
    const command = args.shift();
    switch (command) {
        case 'remove':
            new RemoveCommand(harvest, projectId)
                .execute(args)
                .then(handleDone)
                .catch(handleError);
            break;
        case 'create':
            new CreateCommand(harvest, projectId)
                .execute(args)
                .then(handleDone)
                .catch(handleError);
            break;
        case 'sync':
            new ListCommand(harvest, projectId, redmine, redmineUserId)
                .execute(args)
                .then((results) => {
                    console.table(results, ['date','taskId','hours','status']);
                    askPrompt();
                })
                .catch(handleError);
            break;
        case '':
            rl.prompt();
            break;
        case 'exit':
            rl.close();
            break;
        default:
            console.log(colors.yellow(`Available commands are:
   create <taskId>
   remove <taskId>
   sync --days=<days> [--push]`));
            askPrompt();
    }
}).on('close', () => {
    process.exit();
});

init();