import Harvest from "harvest";
import {TimeEntry} from "harvest/dist/models/timeEntries.models";
import {SyncResult, SyncStatus} from "../model";

export default class ListCommand implements Command {
    private _harvest: Harvest;
    private _redmine: object;
    private readonly _projectId: number;
    private readonly _redmineUserId: number;

    constructor(harvest: Harvest, projectId: number, redmine: object, redmineUserId: number) {
        this._harvest = harvest;
        this._projectId = projectId;
        this._redmine = redmine;
        this._redmineUserId = redmineUserId;
    }

    async execute(args: Array<string>): Promise<SyncResult[]> {
        const daysArg = args.find((arg) => arg.indexOf('--days') >= 0);

        const days = daysArg !== undefined ? parseInt(daysArg.replace('--days=', '')) : 1;
        const dryRun = args.find((arg) => arg.indexOf('--push') >= 0) === undefined;

        const harvestEntries = await this._getHarvestEntries(days);
        const results = harvestEntries.map(async (harvestEntry) => {
            // @ts-ignore
            const taskName = harvestEntry.task.name as string;
            const taskId = parseInt(taskName.replace('#', ''));
            const hours = harvestEntry.hours;
            const spentOn = new Date(harvestEntry.spent_date);

            if (harvestEntry.is_running) {
                return new SyncResult(taskId, SyncStatus.STILL_RUNNING, hours, spentOn);
            }

            const redmineEntries = await this._findRedmineEntries(taskId);
            const matchedEntry = redmineEntries.find((redmineEntry) => hours == redmineEntry.hours);

            if (matchedEntry !== undefined) {
                return new SyncResult(taskId, SyncStatus.ALREADY_SYNCD, hours, spentOn);
            }

            let resultStatus = SyncStatus.WILL_CREATE;

            if (!dryRun) {
                await this._createRedmineEntry(
                    taskId,
                    spentOn,
                    hours
                );
                resultStatus = SyncStatus.CREATED;
            }

            return new SyncResult(taskId, resultStatus, hours, spentOn);
        });

        return Promise.all(results);
    }

    private _getSince(days: number): Date {
        const d = new Date();
        d.setDate(d.getDate() - days);
        return d;
    }

    private async _getHarvestEntries(days: number): Promise<TimeEntry[]> {
        const since = this._getSince(days);
        const {time_entries} = await this._harvest.timeEntries.list({
            project_id: this._projectId,
            updated_since: since.toISOString(),
        });
        return time_entries;
    }

    private async _findRedmineEntries(taskId: number): Promise<any[]> {
        return new Promise((resolve) => {
            // @ts-ignore
            return this._redmine.time_entries(
                {
                    user_id: this._redmineUserId,
                    issue_id: taskId,
                },
                (err: any, data: any) => {
                    if (err) {
                        throw err;
                    }
                    resolve(data.time_entries);
                }
            );
        })
    }

    private async _createRedmineEntry(taskId: number, spentOn: Date, hours: number): Promise<void> {
        return new Promise((resolve) => {
            const date = spentOn.toISOString().slice(0, 10);
            const time_entry = {
                time_entry: {
                    issue_id: taskId,
                    user_id: this._redmineUserId,
                    hours: hours,
                    spent_on: date,
                    activity_id: 0,
                }
            };
            // @ts-ignore
            this._redmine.create_time_entry(time_entry, (err, data) => {
                if (err) {
                    throw err;
                }
                resolve(data);
            });
        });
    }
}