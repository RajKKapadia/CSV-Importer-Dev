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
    let response = await client.query(`SELECT * FROM users WHERE email='${email}'`);
    client.release();

    if (response['rowCount'] != 0 && response['rows'][0]['status']) {
        return 1;
    } else {
        return 0;
    }
};

const insertUser = async (query) => {

    const client = await pool.connect();
    let response = await client.query(query);
    client.release();

    return response['rowCount'];
};

const insertCSVData = async (query) => {

    const client = await pool.connect();
    let response = await client.query(query);
    client.release();

    return response['rowCount'];
};

const insertUserVisit = async (query) => {
    
    const client = await pool.connect();
    let response = await client.query(query);
    client.release()
    
    return response['rowCount'];
};

const getAllUserEmail = async () => {

    const client = await pool.connect();
    let response = await client.query('SELECT DISTINCT email FROM userlog');
    client.release();

    if (response['rowCount'] != 0) {
        let rows = response['rows'];
        let emails = [];
        rows.forEach(row => {
            emails.push(row['email']);
        });
        return {
            'status': 1,
            'emails': emails
        };
    } else {
        return {
            'status': 0
        };
    }
};

module.exports = {
    checkMembership,
    insertUser,
    insertCSVData,
    insertUserVisit,
    getAllUserEmail
}