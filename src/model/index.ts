export enum SyncStatus {
    ALREADY_SYNCD = 'exists',
    CREATED = 'was created',
    STILL_RUNNING = 'is running',
    WILL_CREATE = 'will be created',
}

export class SyncResult {
    readonly taskId: number;
    readonly hours: number;
    readonly status: SyncStatus;
    readonly date: Date;

    constructor(taskId: number, status: SyncStatus, hours: number, date: Date) {
        this.taskId = taskId;
        this.status = status;
        this.hours = hours;
        this.date = date;
    }
}
