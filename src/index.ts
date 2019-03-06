import Harvest from 'harvest';
import dotenv from 'dotenv';
import readline from 'readline';
import colors from 'colors/safe';

const packageJson = require('../package.json');

dotenv.config();

const projectId = parseInt(process.env.PROJECT_ID || '0');

const harvest = new Harvest({
    subdomain: 'geisermenoia',
    userAgent: 'Harvest2Redmine (gmenoiaa+harvest2redmine@gmail.com)',
    concurrency: 1,
    auth: {
        accessToken: process.env.ACCESS_TOKEN as string,
        accountId: process.env.ACCOUNT_ID as string,
    }
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: colors.gray('H2R> '),
});

const askPrompt = () => {
    console.log();
    rl.prompt();
};

const extractErrorMsg = (reason: any) => {
    let msg = reason;
    if (reason.error !== undefined) {
        msg = reason.error;
        const error = JSON.parse(reason.error);
        if (error !== undefined) {
            msg = error.message;
        }
    }
    return msg;
};

const handleError = (reason: any) => {
    console.log(colors.red(extractErrorMsg(reason)));
    askPrompt();
};

console.log(colors.blue(`${packageJson.name} ${packageJson.version}`));
rl.prompt();

rl.on('line', (line) => {
    const words = line.split(' ');
    const command = words[0].trim();
    switch (command) {
        case 'remove':
            const taskNumberToRemove = parseInt(words[1]);
            const taskNameToRemove = `#${taskNumberToRemove}`;
            harvest.taskAssignments
                // @ts-ignore: invalid optional parameters
                .list(projectId, {})
                .then((response: any) => {
                    const taskAssignements = response.task_assignments;
                    const filteredTasksAssignments = taskAssignements.filter((taskAssignment: any) => {
                        return taskAssignment.task.name === taskNameToRemove
                    });
                    if (filteredTasksAssignments.length === 0) {
                        console.log(colors.red(`Task ${taskNameToRemove} not found`));
                        askPrompt();
                        return;
                    }
                    const taskAssignment = filteredTasksAssignments[0];
                    const taskAssignmentId = taskAssignment.id;
                    const taskId = taskAssignment.task.id;
                    console.log(colors.green(`Removing task assignment id ${taskAssignmentId}`));
                    harvest.taskAssignments
                        .delete(projectId, taskAssignmentId)
                        .then(() => {
                            console.log(colors.green(`Removing task id ${taskId}`));
                            harvest.tasks
                                .delete(taskId)
                                .then(() => {
                                    console.log(colors.green('Done'));
                                    askPrompt();
                                })
                                .catch(handleError)
                        })
                        .catch(handleError);
                })
                .catch(handleError);
            break;
        case 'create':
            const taskNumberToCreate = parseInt(words[1]);
            const taskName = `#${taskNumberToCreate}`;
            harvest.tasks
                // @ts-ignore: invalid optional parameters
                .create({ name: taskName })
                .then((task: any) => {
                    const taskId = task.id;
                    console.log(colors.green(`Created task id ${taskId}`));
                    harvest.taskAssignments
                        // @ts-ignore: task_id parameter not defined
                        .create(projectId, { task_id: taskId })
                        .then((taskAssignment: any) => {
                            const taskAssignmentId = taskAssignment.id;
                            console.log(colors.green(`Created task assignment id ${taskAssignmentId}`));
                            console.log(colors.green('Done'));
                            askPrompt();
                        }).catch((reason: any) => {
                            console.log(colors.red(extractErrorMsg(reason)));
                            harvest.tasks
                                .delete(taskId)
                                .then(() => {
                                    console.log(colors.red(`Removed task id ${taskId} because assignment failed`));
                                    askPrompt();
                                })
                                .catch(handleError)
                        });
                })
                .catch(handleError);
            break;
        case 'sync':
            console.log(colors.yellow('Not implemented yet :\'('));
            askPrompt();
            break;
        case '':
            rl.prompt();
            break;
        case 'exit':
            rl.close();
            break;
        default:
            console.log(colors.yellow(`Available commands are:
   create
   remove
   sync
            `));
            askPrompt();
            break;
    }
}).on('close', () => {
    process.exit();
});
