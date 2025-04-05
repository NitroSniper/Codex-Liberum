const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require("pg");

const pool = new Pool({
    user: 'prod',
    host: 'db',
    database: 'prod',
    password: 'example',
    port: 5432,
})

const getClient = async () => {
    return pool.connect()
}

const refresh_db = () => {
    const initDB = path.join(__dirname, 'init_db.sql');
    fs.readFile(initDB, 'utf-8', async (err, data) => {
        if (err) {
            console.error("Error in accessing the initialized db file. ", err);
            return;
        }
        const client = await getClient();
        try {
            await client.query("BEGIN");
            await client.query(data);
            await client.query("COMMIT");
        } catch (err) {
            await client.query("ROLLBACK")
            console.error("Error in accessing the initialized db file. ", err);
        } finally {
            client.release();
        }
    });
}



module.exports = {refresh_db, pool};