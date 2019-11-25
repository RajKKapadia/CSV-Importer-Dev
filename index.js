const path = require('path');
const fs = require('fs');

const express = require('express');
const ef = require('express-fileupload');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const csv = require('csvtojson');
const hbs = require('hbs');
const extract = require('extract-zip');
require('dotenv').config();

const hf = require('./helper-functions/export-function');

const publicDirectoryPath = path.join(__dirname, './public');
const viewsPath = path.join(__dirname, './templates/views');
const partialsPath = path.join(__dirname, './templates/partials');

const app = express();

app.use(cookieParser('secret-key'));
app.use(session({
    secret: "secret-key",
    resave: true,
    saveUninitialized: true
}));

app.use(express.static(publicDirectoryPath));
app.use(ef());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.set('view engine', 'hbs');
app.set('views', viewsPath);
hbs.registerPartials(partialsPath);

const config = require('./configuration/config');

// Login with Google Configuration
const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    config['settings']['REDIRECT_URL']
);

const scopes = [
    'https://www.googleapis.com/auth/plus.login',
    'https://www.googleapis.com/auth/userinfo.email'
];

app.get('', (req, res) => {
    res.render('index.hbs');
});

app.post('/login', (req, res) => {

    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes
    });

    return res.redirect(url);
});

app.get('/getLogin', async (req, res) => {

    let code = req.query.code;

    let { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    let oauth2 = google.oauth2({
        auth: oauth2Client,
        version: 'v2'
    });

    let userData = await oauth2.userinfo.get();

    req.session.email = userData['data']['email'];

    if (userData['data']['email'] === process.env.ADMIN_EMAIL) {
        res.render('admin-dashboard.hbs');
    } else {

        let datetime = new Date();

        await hf.dc.insertUserVisit(userData['data']['email'], datetime.toLocaleString('hi', 'Asia/Kolkata'));

        let status = await hf.dc.checkMembership(userData['data']['email']);

        if (status == 1) {
            res.render('select-action.hbs', { flag: 0 });
        } else {
            res.render('select-action.hbs', { message: 'Please contact raajforyou@gmail.com to become paid user.', flag: 1 });
        }
    }
});

app.post('/upload', async (req, res) => {

    let status = await hf.dc.checkMembership(req.session.email);

    console.log('Status of user --> ', status);
    console.log('Email address --> ', req.session.email);

    let datetime = new Date();

    if (req.files) {

        let file = req.files.upload;
        let fileName = file.name;

        // Check for CSV extention
        if (file.mimetype !== 'text/csv') {
            hf.dc.insertErrorLog(req.session.email, 'No File', { 'error': 'No data as bad extention.' }, datetime.toLocaleString('hi', 'Asia/Kolkata'));
            res.render('error.hbs', { message: 'Please upload CSV file only.', status, unpaidMessage: 'Please contact raajforyou@gmail.com to become paid user.' });
        }

        // set language
        let language;
        if (req.body.language) {
            language = req.body.language;
        } else {
            language = 'en';
        }

        console.log(language);

        // Write the file here
        let dir = './upload';

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        file.mv('./upload/' + fileName, async (error) => {

            if (error) {
                // go to error page.
                hf.dc.insertErrorLog(req.session.email, 'Unable to Upload File', { 'error': 'Something is wrong with upload.' }, datetime.toLocaleString('hi', 'Asia/Kolkata'));
                res.render('error.hbs', { message: 'Unable to upload the file, please try again.', status, unpaidMessage: 'Please contact raajforyou@gmail.com to become paid user.' });
            } else {

                // read the data
                let data = await csv().fromFile('./upload/' + fileName);

                // upload the data to DB
                await hf.dc.insertUploadCSVData(req.session.email, data, datetime.toLocaleString('hi', 'Asia/Kolkata'));

                // check the 4 8 10 column file hereand the call that function
                let count = hf.mif.countColumns(data);
                // Get all columns names
                let columnNames = hf.mif.getColumnNames(data);

                // Bad CSV flag
                let bcsvFlag = hf.mif.badCSVFormat(data);

                // Empty row flag
                let erFlag = hf.mif.findEmptyRow(data);

                if (erFlag == 1) {

                    console.log('empty row in csv file.');
                    let tempData = [];
                    for (let i = 0; i < data.length; i++) {
                        if (i == 10) {
                            break;
                        }
                        let row = data[i];
                        tempData.push(row)
                    }
                    hf.dc.insertErrorLog(req.session.email, 'Empty Row', { errorData: tempData }, datetime.toLocaleString('hi', 'Asia/Kolkata'));
                    res.render('error.hbs', { message: 'Uploaded CSV file has empty rows, please remove it and upload the file again.', status, unpaidMessage: 'Please contact raajforyou@gmail.com to become paid user.' });

                } else if (bcsvFlag == 1) {

                    console.log('Bad csv');
                    let tempData = [];
                    for (let i = 0; i < data.length; i++) {
                        if (i == 10) {
                            break;
                        }
                        let row = data[i];
                        tempData.push(row)
                    }
                    hf.dc.insertErrorLog(req.session.email, 'Bad CSV Format', { errorData: tempData }, datetime.toLocaleString('hi', 'Asia/Kolkata'));
                    res.render('error.hbs', { message: 'Please check the CSV file, follow the strict format as shown in the link.', url: 1, status, unpaidMessage: 'Please contact raajforyou@gmail.com to become paid user.' });

                } else if (count != 4 && count != 8 && count != 10) {

                    console.log('More Column');
                    let tempData = [];
                    for (let i = 0; i < data.length; i++) {
                        if (i == 10) {
                            break;
                        }
                        let row = data[i];
                        tempData.push(row)
                    }
                    hf.dc.insertErrorLog(req.session.email, `${count} Column File`, { errorData: tempData }, datetime.toLocaleString('hi', 'Asia/Kolkata'));
                    res.render('error.hbs', { message: `Please use either 4, 8 or 10 Column CSV file only, you have uploaded ${count} column file.`, url: 1, status, unpaidMessage: 'Please contact raajforyou@gmail.com to become paid user.' })

                } else if (count == 4) {

                    console.log('Count 4');

                    if (status == 0) {
                        // unpaid user
                        hf.ciup.createUserSays(data, language);
                        hf.ciup.createIntentFour(data, language);
                        let newData = hf.mif.generateDataUnpaidUsers(data);
                        res.render('download.hbs', { four: 1, eight: 0, ten: 0, columnNames, data: newData, message: process.env.MESSAGE });
                    } else {
                        // paid user
                        hf.cip.createUserSays(data, language);
                        hf.cip.createIntentFour(data, language);
                        res.render('download.hbs', { four: 1, eight: 0, ten: 0, columnNames, data });
                    }

                } else if (count == 8) {

                    console.log('Count 8');

                    if (status == 0) {
                        // unpaid user
                        hf.ciup.createUserSays(data, language);
                        hf.ciup.createIntentEight(data, language);
                        let newData = hf.mif.generateDataUnpaidUsers(data);
                        res.render('download.hbs', { four: 0, eight: 1, ten: 0, columnNames, data: newData, message: process.env.MESSAGE });
                    } else {
                        // paid user
                        hf.cip.createUserSays(data, language);
                        hf.cip.createIntentEight(data, language);
                        res.render('download.hbs', { four: 0, eight: 1, ten: 0, columnNames, data });
                    }

                } else if (count == 10) {

                    console.log('Count 10');

                    if (status == 0) {
                        // unpaid user
                        hf.ciup.createUserSays(data, language);
                        hf.ciup.createIntentTen(data, language);
                        let newData = hf.mif.generateDataUnpaidUsers(data);
                        res.render('download.hbs', { four: 0, eight: 0, ten: 1, columnNames, data: newData, message: process.env.MESSAGE });
                    } else {
                        // paid user
                        hf.cip.createUserSays(data, language);
                        hf.cip.createIntentTen(data, language);
                        res.render('download.hbs', { four: 0, eight: 0, ten: 1, columnNames, data });
                    }
                }
            }
        });
    } else {
        res.render('error.hbs', { message: 'Please choose a CSV file.', status, unpaidMessage: 'Please contact raajforyou@gmail.com to become paid user.' });
    }
});

app.get('/download', async (req, res) => {

    // Save JSON files to the DB
    fileNames = fs.readdirSync('./example/intents');

    let datetime = new Date();

    for (const i in fileNames) {
        let jsonData = fs.readFileSync(`./example/intents/${fileNames[i]}`);
        let data = JSON.parse(jsonData);
        await hf.dc.insertCSVData(req.session.email, data, datetime.toLocaleString('hi', 'Asia/Kolkata'));
    }

    // create zip
    hf.mif.zipDirectory('./example', './agent.zip')
        .then(() => {
            // download
            res.download(__dirname + '/agent.zip');
        })
        .catch((error) => {
            res.render('error.hbs', { message: 'Unable to create agent.zip file, please try again after sometime.', status, unpaidMessage: 'Please contact raajforyou@gmail.com to become paid user.' });
        });
});

app.get('/again', async (req, res) => {

    hf.mif.removeDir('./upload');
    hf.mif.removeDir('./example');
    hf.mif.removeDir('./ziptocsv');

    let status = hf.dc.checkMembership(req.session.email);

    if (status == 1) {
        res.render('select-action.hbs', { flag: 0 });
    } else {
        res.render('select-action.hbs', { message: 'Please contact raajforyou@gmail.com to become paid user.', flag: 1 });
    }
});

app.get('/admin', (req, res) => {
    res.render('admin-login.hbs');
});

app.get('/add-user-page', (req, res) => {
    res.render('add-user.hbs');
});

app.post('/add-user', async (req, res) => {

    let email, status;

    if (req.body.status) {
        email = req.body.email;
        status = req.body.status;
    } else {
        email = req.body.email;
        status = false;
    }

    let datetime = new Date();

    let flag = await hf.dc.insertUser(email, status, datetime.toLocaleString('hi', 'Asia/Kolkata'));

    if (flag == 1) {
        res.render('add-user.hbs', { successMessage: 'User added successfully.' });
    } else {
        res.render('add-user.hbs', { errorMessage: 'Something went wrong, please try again.' });
    }
});

app.get('/view-users', async (req, res) => {

    // get the login count
    let result = await hf.dc.getLoginCount();

    if (result['status'] == 1) {

        let data = result['data'];

        console.log(data);

        if (data.length == 0) {
            res.render('view-users.hbs', { message: 'No user has visited the app.' });
        } else {
            res.render('view-users.hbs', { data });
        }

    } else {
        res.render('view-users.hbs');
    }
});

app.get('/logout', (req, res) => {

    req.session.destroy();

    res.render('index.hbs');
});

app.get('/select-cz', async (req, res) => {

    let result = await hf.dc.getUsedRowCount(req.session.email);

    let flag = await hf.dc.checkMembership(req.session.email);

    if (result['status'] == 1 && flag == 0) {

        if (parseInt(result['count']) < 500) {
            res.render('upload.hbs', { flag: 0 });
        } else {
            res.render('upload.hbs', { flag: 1, message: 'Please contact raajforyou@gmail.com to enable your free service.' });
        }

    } else {
        res.render('upload.hbs', { flag: 0 });
    }
});

app.get('/select-zc', async (req, res) => {
    res.render('upload-zc.hbs');
});

app.post('/upload-zc', async (req, res) => {

    let status = await hf.dc.checkMembership(req.session.email);

    console.log('status is --> ', status);

    if (req.files) {

        let file = req.files.upload;
        let fileName = file.name;

        // Write the file here
        let dir = './ziptocsv';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        if (file.mimetype !== 'application/zip') {
            res.render('error.hbs', { message: 'Please upload .zip file only.', status, unpaidMessage: 'Please contact raajforyou@gmail.com to become paid user.' });
        } else {
            file.mv('./ziptocsv/' + fileName, async (error) => {

                let source = path.join(__dirname, `./ziptocsv/${fileName}`);
                let destination = path.join(__dirname, `./ziptocsv/${fileName.split('.zip')[0]}`);
                let csvPath = path.join(__dirname, './ziptocsv/10-column.csv');

                let status = await hf.mif.extractZipFile(source, destination);

                let fallbackFlag = 0;

                if (status['status'] == 1) {
                    let intentFileNames = fs.readdirSync(`${destination}/intents`);
                    for (let x = 0; x < intentFileNames.length; x++) {
                        ifn = intentFileNames[x];
                        if (ifn.toLowerCase().includes('fallback')) {
                            fallbackFlag = 1;
                            break;
                        }
                    }
                }

                if (error) {
                    // go to error page.
                    res.render('error.hbs', { message: 'Unable to upload the file, please try again.', status, unpaidMessage: 'Please contact raajforyou@gmail.com to become paid user.' });
                } else if (status['status'] == 0) {
                    res.render('error.hbs', { message: 'Zip file is corrupted, please upload a uncorrupted zip file.', status, unpaidMessage: 'Please contact raajforyou@gmail.com to become paid user.' });
                } else if (fallbackFlag == 1) {
                    res.render('error.hbs', { message: 'Agent zip file contains Fallback intent. Please remove Fallback intent json file and upload again.', status, unpaidMessage: 'Please contact raajforyou@gmail.com to become paid user.' });
                } else {

                    await hf.mif.createCSVFile(destination, csvPath);

                    let data = await csv().fromFile('./ziptocsv/10-column.csv');
                    let columnNames = hf.mif.getColumnNames(data);
                    res.render('download-zc.hbs', { columnNames, data });

                }
            });
        }
    } else {
        res.render('error.hbs', { message: 'Please choose a CSV file.', status, unpaidMessage: 'Please contact raajforyou@gmail.com to become paid user.' });
    }
});

app.get('/download-zc', (req, res) => {
    res.download(`${__dirname}/ziptocsv/10-column.csv`);
});

app.listen(process.env.PORT, () => {
    console.log(`Server is listening on port ${process.env.PORT}.`);
});