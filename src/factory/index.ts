// @ts-ignore
import Redmine from 'node-redmine';
import Harvest from 'harvest';

export function createHarvest() {
    return new Harvest({
        subdomain: process.env.HARVEST_SUBDOMAIN as string,
        userAgent: 'harvest2redmine',
        concurrency: 1,
        auth: {
            accessToken: process.env.HARVEST_ACCESS_TOKEN as string,
            accountId: process.env.HARVEST_ACCOUNT_ID as string,
        }
    });
}

export function createRedmine() {
    return new Redmine(
        process.env.REDMINE_HOST as string,
        { apiKey: process.env.REDMINE_APIKEY as string }
    );
}
