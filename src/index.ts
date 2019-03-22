import chalk from 'chalk';
import config from './config';
import CreateCommand from "./command/CreateCommand";
import RemoveCommand from "./command/RemoveCommand";
import ListCommand from "./command/ListCommand";
import {createHarvest, createRedmine} from "./factory";

const args = process.argv;

const usage = () => {
    const usageText = `
  h2r helps you manage and sync tasks between redmine and harvest.

  usage:
    h2r <command> <options>

    commands can be:

    new <task-id>       create a new task in harvest
    rm <task-id>        remove a task from harvest
    sync [--dry-run]    sync tasks between harvest and redmine
    report              returns current report link
    help                print the usage guide
  `;

    console.log(usageText)
};

// used to log errors to the console in red color
const errorLog = (error: string) => {
    const eLog = chalk.red(error);
    console.log(eLog);
};

// handle new command
const create = () => {
    // check that length
    if (args.length != 4) {
        errorLog("invalid number of arguments passed for new command");
        return;
    }

    let n = Number(args[3]);
    // check if the value is a number
    if (isNaN(n)) {
        errorLog("please provide a valid number for new command");
        return;
    }

    // execute the command
    new CreateCommand(createHarvest(config.harvest), config.harvest.projectId)
        .execute([n])
        .catch((e) => errorLog(e.message));
};

// handle rm command
const remove = () => {
    // check that length
    if (args.length != 4) {
        errorLog("invalid number of arguments passed for rm command");
        return;
    }

    let n = Number(args[3]);
    // check if the value is a number
    if (isNaN(n)) {
        errorLog("please provide a valid number for rm command");
        return;
    }

    // execute command
    new RemoveCommand(createHarvest(config.harvest), config.harvest.projectId)
        .execute([n])
        .catch((e) => errorLog(e.message));
};

// handle sync command
const sync = () => {
    // check that length
    if (args.length < 3 || args.length > 5) {
        errorLog("invalid number of arguments passed for sync command");
        return;
    }

    // create the command
    const command = new ListCommand(
        createHarvest(config.harvest),
        config.harvest.projectId,
        createRedmine(config.redmine),
        config.redmine.userId
    );

    // extract options from args
    const options = args.length > 3 ? args.slice(3) : [];

    // execute command
    command.execute(options)
        .then((r) => console.table(r, ['date','taskId','hours','status']))
        .catch((e) => errorLog(e.message));
};

const report = () => {
    const from = new Date().toISOString().slice(0, 10);
    const url = `https://${config.harvest.subdomain}.harvestapp.com/reports/projects/${config.harvest.projectId}?from=${from}&kind=semimonth`;
    console.log(url);
};

// we make sure the length of the arguments is exactly three
if (args.length < 3) {
    errorLog(`only one argument can be accepted`);
    usage();
    process.exit();
}

// switch statements
switch(args[2]) {
    case 'help':
        usage();
        break;
    case 'new':
        create();
        break;
    case 'rm':
        remove();
        break;
    case 'sync':
        sync();
        break;
    case 'report':
        report();
        break;
    default:
        errorLog('invalid command passed');
        usage();
}
