const Joi = require('joi');
const backup = require('mongodb-backup');
const fs = require("fs");
const util = require("util");
const CronJob = require('cron').CronJob;
if (process.env.NODE_ENV !== "production") {
    require("dotenv").load();
}

const simpleGit = require('simple-git/promise')(`./temp/${process.env.GIT_REPO_NAME}`);
const path = require('path');


const readFile = util.promisify(fs.readFile);

function createBackup(config) {
    return new Promise((resolve, reject) => {
        const { host, port, name, user, password, collections } = config.db;
        const uri = `mongodb://${user}:${password}@${host}:${port}/${name}`
        backup({
            uri,
            root: path.join(__dirname, process.env.GIT_REPO_NAME), // write files into this dir
            collections, // save this collection only
            callback: function (err) {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve();
                }
            }
        });
    });
};

async function initiateBackup() {

    try {
        let pullResult = await simpleGit.pull("origin", "master");

        await createBackup({
            db: {
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                name: process.env.DB_NAME,
                user: process.env.DB_USER,
                password: process.env.DB_PASS,
                collections: []
            }
        });

        let addResult = await simpleGit.add(".");

        var datetime = new Date();
        datetime = datetime.toISOString().slice(0, 10);
        let commitResult = await simpleGit.commit(datetime);

        let pushResult = await simpleGit.push("origin", "master");
    } catch (error) {
        console.log(error);
    }
};



new CronJob('0 0 0 * * *', function () {
    initiateBackup();
}, null, true, 'Asia/Kolkata');

