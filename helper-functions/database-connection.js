const { Pool } = require('pg');

// For Heroku
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
});

// // For Local Machine
// const pool = new Pool({
//     host: 'localhost',
//     user: 'postgres',
//     database: 'CSV-Importer',
//     password: 'abc123',
//     port: '5433'
// });

const checkMembership = async (email) => {

    const client = await pool.connect();
    var response = await client.query(`SELECT * FROM users WHERE email='${email}'`);
    client.release();

    if (response['rowCount'] != 0 && response['rows'][0]['status']) {
        return 1;
    } else {
        return 0;
    }
};

const insertUser = async (query) => {

    const client = await pool.connect();
    var response = await client.query(query);
    client.release();

    return response['rowCount'];
};

const insertCSVData = async (query) => {

    const client = await pool.connect();
    var response = await client.query(query);
    client.release();

    return response['rowCount'];
}; 

module.exports = {
    checkMembership,
    insertUser,
    insertCSVData
}