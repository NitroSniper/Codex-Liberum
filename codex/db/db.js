const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require("pg");
const logger = require('../models/logger');

const pool = new Pool({
    user: 'prod',
    host: 'db',
    database: 'prod',
    password: 'example',
    port: 5432,
})

const getClient = async () => {
    return pool.connect();
}

const query = async (text, params) => {
    const start = Date.now();
    const res = pool.query(text, params);
    const duration = Date.now() - start;
    logger.info("executed query", {text, params, rows: res.rows});
    return res;
}

const refresh_db = () => {
    const initDB = path.join(__dirname, 'init_db.sql');
    fs.readFile(initDB, 'utf-8', async (err, data) => {
        if (err) {
            logger.error("Error in accessing the initialized db file. ", err);
            return;
        }
        const client = await getClient();
        try {
            await client.query("BEGIN");
            await client.query(data);
            await client.query("COMMIT");
        } catch (err) {
            await client.query("ROLLBACK")
            logger.error("Error in accessing the initialized db file. ", err);
        } finally {
            client.release();
        }
    });
}



module.exports = {refresh_db, pool, query};