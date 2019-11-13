const { Pool } = require('pg');

const config = require('./configuration/config');

const pool = new Pool({
    connectionString: config['settings']['DATABASE_URL'],
    ssl: config['settings']['ssl']
});

const createUserTable = async () => {

    const client = await pool.connect();

    let response = await client.query('CREATE TABLE "users" (id bigserial NOT NULL, email character varying(100) NOT NULL, status boolean NOT NULL, PRIMARY KEY (id))');
    client.release();
    
    return response;
};

const createCSVDataTable = async () => {

    const client = await pool.connect();

    let response = await client.query('CREATE TABLE "csvdata" (id bigserial NOT NULL, email character varying(100) NOT NULL, data jsonb NOT NULL, PRIMARY KEY (id))');
    client.release();
    
    return response;
};

const createUserLog = async () => {

    const client = await pool.connect();

    let response = await client.query('CREATE TABLE "userlog" (id bigserial NOT NULL, email character varying(100) NOT NULL, PRIMARY KEY (id))');
    client.release();
    
    return response;
};

const createTable = async () => {
    let a = await createUserTable();
    let b = await createCSVDataTable();
    let c = await createUserLog();

    return {
        'Users': a,
        'CSVData': b,
        'UserLog': c
    };
};

createTable()
    .then((response) => {
        console.log(response);
    })
    .catch((error) => {
        console.log('Error at createTable --> ', error);
    });