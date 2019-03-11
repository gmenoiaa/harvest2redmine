import Harvest from "harvest";

export default class RemoveCommand implements Command {
    private readonly _harvest: Harvest;
    private readonly _projectId: number;

    constructor(harvest: Harvest, projectId: number) {
        this._harvest = harvest;
        this._projectId = projectId;
    }

    async execute(args: Array<string>): Promise<void> {
        const taskNumber = parseInt(args[0]);
        const taskNameToRemove = `#${taskNumber}`;

        const {task_assignments} = await this._harvest
            .taskAssignments
            // @ts-ignore: invalid optional parameters
            .list(this._projectId, {});

        const filteredTasksAssignments = task_assignments.filter((taskAssignment: any) => {
            return taskAssignment.task.name === taskNameToRemove
        });

        if (filteredTasksAssignments.length === 0) {
            throw new Error(`Task ${taskNameToRemove} not found`);
        }

        const taskAssignment = filteredTasksAssignments[0];
        const taskAssignmentId = taskAssignment.id;
        const taskId = taskAssignment.task.id;

        await this._harvest
            .taskAssignments
            .delete(this._projectId, taskAssignmentId);

        await this._harvest
            .tasks
            .delete(taskId);
    }
}
