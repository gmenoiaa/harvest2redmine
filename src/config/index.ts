import { load } from 'dotenv';

load();

export default {
    harvest: {
        projectId: parseInt(process.env.HARVEST_PROJECT_ID || '0'),
        subdomain: process.env.HARVEST_SUBDOMAIN as string,
        accessToken: process.env.HARVEST_ACCESS_TOKEN as string,
        accountId: process.env.HARVEST_ACCOUNT_ID as string,
    },
    redmine: {
        host: process.env.REDMINE_HOST as string,
        apiKey: process.env.REDMINE_APIKEY as string,
        userId: parseInt(process.env.REDMINE_USER_ID || '0'),
    }
};
