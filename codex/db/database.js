// Setting up database connection - login & register form

const { Pool } = require('pg');

const pool = new Pool({
    user: 'admin',
    host: 'db', 
    database: 'users',
    password: 'example',  
    port: 5432,
});

module.exports = pool;
