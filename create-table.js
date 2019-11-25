const { Pool } = require('pg');

const config = require('./configuration/config');

const pool = new Pool({
    connectionString: config['settings']['DATABASE_URL'],
    ssl: config['settings']['ssl']
});

// const createUserTable = async () => {

//     const client = await pool.connect();

//     let response = await client.query('CREATE TABLE "users" (id bigserial NOT NULL, email character varying(100) NOT NULL, status boolean NOT NULL, PRIMARY KEY (id))');
//     client.release();
    
//     return response;
// };

// const createCSVDataTable = async () => {

//     const client = await pool.connect();

//     let response = await client.query('CREATE TABLE "csvdata" (id bigserial NOT NULL, email character varying(100) NOT NULL, data jsonb NOT NULL, PRIMARY KEY (id))');
//     client.release();
    
//     return response;
// };

// const createUserLog = async () => {

//     const client = await pool.connect();

//     let response = await client.query('CREATE TABLE "userlog" (id bigserial NOT NULL, email character varying(100) NOT NULL, PRIMARY KEY (id))');
//     client.release();
    
//     return response;
// };

// const createErrorLogTable = async () => {

//     const client = await pool.connect();

//     let response = await client.query('CREATE TABLE "errorlog" (id bigserial NOT NULL, email character varying(100) NOT NULL, error character varying(500) NOT NULL, data jsonb NOT NULL, PRIMARY KEY (id))');
//     client.release();
    
//     return response;
// };

const alterUserLog = async () => {

    const client = await pool.connect();

    let response = await client.query('ALTER TABLE "userlog" ADD COLUMN datetime character varying(100)');
    client.release();
    
    return response;
};

const alterCSVData = async () => {

    const client = await pool.connect();

    let response = await client.query('ALTER TABLE "csvdata" ADD COLUMN datetime character varying(100)');
    client.release();
    
    return response;
};

const alterErrorLog = async () => {

    const client = await pool.connect();

    let response = await client.query('ALTER TABLE "errorlog" ADD COLUMN datetime character varying(100)');
    client.release();
    
    return response;
};

const alterUsers = async () => {

    const client = await pool.connect();

    let response = await client.query('ALTER TABLE "users" ADD COLUMN datetime character varying(100)');
    client.release();
    
    return response;
};

const createUploadButtonData = async () => {

    const client = await pool.connect();

    let response = await client.query('CREATE TABLE "uploadcsvdata" (id bigserial NOT NULL, email character varying(100) NOT NULL, data jsonb NOT NULL, datetime character varying(100) NOT NULL, PRIMARY KEY (id))');
    client.release();
    
    return response;
};

const createTable = async () => {

    let a = await alterUserLog();
    let b = await alterCSVData();
    let c = await alterErrorLog();
    let d = await alterUsers();
    let e = await createUploadButtonData();

    return {
        'alterUserLog': a,
        'alterCSVData': b,
        'alterErrorLog': c,
        'alterUsers': d,
        'createUploadButtonData': e
    };
};

createTable()
    .then((response) => {
        console.log(response);
    })
    .catch((error) => {
        console.log('Error at createTable --> ', error);
    });