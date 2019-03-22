// @ts-ignore
import Redmine from 'node-redmine';
import Harvest from 'harvest';

export function createHarvest(config: any) {
    return new Harvest({
        subdomain: config.subdomain,
        userAgent: 'harvest2redmine',
        concurrency: 1,
        auth: {
            accessToken: config.accessToken,
            accountId: config.accountId,
        },
    });
}

export function createRedmine(config: any) {
    return new Redmine(
        config.host,
        { apiKey: config.apiKey }
    );
}
