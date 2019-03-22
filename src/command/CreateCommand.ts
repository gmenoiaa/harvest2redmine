import Harvest from "harvest";

export default class CreateCommand implements Command {
    private readonly _harvest: Harvest;
    private readonly _projectId: number;

    constructor(harvest: Harvest, projectId: number) {
        this._harvest = harvest;
        this._projectId = projectId;
    }

    async execute(args: Array<any>): Promise<void> {
        const taskNumber = parseInt(args[0]);
        const taskName = `#${taskNumber}`;

        const task = await this._harvest
            .tasks
            // @ts-ignore: invalid optional parameters
            .create({ name: taskName });

        try {
            await this._harvest
                .taskAssignments
                // @ts-ignore: task_id parameter not defined
                .create(this._projectId, {task_id: task.id});
        } catch (error) {
            await this._harvest
                .tasks
                .delete(task.id);
            throw error;
        }
    }
}
