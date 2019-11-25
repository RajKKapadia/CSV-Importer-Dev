const { Pool } = require('pg');

const config = require('../configuration/config');

const pool = new Pool({
    connectionString: config['settings']['DATABASE_URL'],
    ssl: config['settings']['ssl']
});


// Check the membership of the user Paid/Unpaid
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

// Insert new user to DB
const insertUser = async (email, status, datetime) => {

    let query = {};

    query['text'] = 'INSERT INTO users(email, status, datetime) VALUES($1, $2, $3)';
    query['values'] = [email, status, datetime]

    const client = await pool.connect();
    let response = await client.query(query);
    client.release();

    return response['rowCount'];
};

// Insert CSV data to DB
const insertCSVData = async (email, data, datetime) => {

    let query = {};

    query['text'] = 'INSERT INTO csvdata(email, data, datetime) VALUES($1, $2, $3)';
    query['values'] = [email, { data }, datetime];

    const client = await pool.connect();
    let response = await client.query(query);
    client.release();

    return response['rowCount'];
};

// Insert an email everytime a user visits the App
const insertUserVisit = async (email, datetime) => {

    let query = {};
    query['text'] = 'INSERT INTO userlog(email, datetime) VALUES($1, $2)';
    query['values'] = [email, datetime];
    
    const client = await pool.connect();
    let response = await client.query(query);
    client.release()
    
    return response['rowCount'];
};

// Get the login count of each user
const getLoginCount = async () => {

    const client = await pool.connect();
    let response = await client.query('SELECT email, COUNT (email) FROM userlog GROUP BY email');
    client.release();

    if (response['rowCount'] != 0) {
        let rows = response['rows'];
        let data = [];
        rows.forEach(row => {
            let tempData = {};
            tempData['email'] = row['email'];
            tempData['count'] = row['count'];
            data.push(tempData);
        });
        return {
            'status': 1,
            'data': data
        };
    } else {
        return {
            'status': 0
        };
    }
};

// Get how many rows filled by the user
const getUsedRowCount = async (email) => {

    const client = await pool.connect();
    let response = await client.query(`SELECT COUNT (email) FROM csvdata WHERE email='${email}' GROUP BY email`);
    client.release();

    if (response['rowCount'] == 1) {
        let count = response['rows'][0]['count'];
        return {
            'status': 1,
            'count': count
        }
    } else {
        return {
            'status': 0
        }
    }
};

// Insert error log to DB
const insertErrorLog = async (email, error, data, datetime) => {

    let query = {};

    query['text'] = 'INSERT INTO errorlog(email, error, data, datetime) VALUES($1, $2, $3, $4)';
    query['values'] = [email, error, { data }, datetime.toLocaleString('hi', 'Asia/Kolkata')];

    const client = await pool.connect();
    let response = await client.query(query);
    client.release();

    return response['rowCount'];
};

// Insert CSV data to DB
const insertUploadCSVData = async (email, data, datetime) => {

    let query = {};

    query['text'] = 'INSERT INTO uploadcsvdata(email, data, datetime) VALUES($1, $2, $3)';
    query['values'] = [email, { data }, datetime];

    const client = await pool.connect();
    let response = await client.query(query);
    client.release();

    return response['rowCount'];
};

module.exports = {
    checkMembership,
    insertUser,
    insertCSVData,
    insertUserVisit,
    getLoginCount,
    getUsedRowCount,
    insertErrorLog,
    insertUploadCSVData
}