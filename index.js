const path = require('path');
const fs = require('fs');

const express = require('express');
const ef = require('express-fileupload');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const session = require('express-session');
var cookieParser = require('cookie-parser');
const csv = require('csvtojson');
require('dotenv').config();

const hf = require('./helper-functions/export-function');

const app = express();

const publicDirectoryPath = path.join(__dirname, './public');

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

// Login with Google Configuration
const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    'http://localhost:5000/getLogin'
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

    if (userData['data']['email'] === 'aravind.mohanoor@gmail.com') {
        res.render('admin-dashboard.hbs');
    } else {

        let query = {};
        query['text'] = 'INSERT INTO userlog(email) VALUES($1)';
        query['values'] = [userData['data']['email']];

        let flag = await hf.dc.insertUserVisit(query);

        if (flag == 1) {
            res.render('upload.hbs');   
        } else {
            console.log('Error at inserUserVisit.');
            res.render('upload.hbs');
        }
    }
});

app.post('/upload', async (req, res) => {

    let status = await hf.dc.checkMembership(req.session.email);

    console.log('Status of user --> ', status);
    console.log('Email address --> ', req.session.email);

    if (req.files) {

        let file = req.files.upload;
        let fileName = file.name;

        // Check for CSV extention
        if (file.mimetype !== 'text/csv') {
            res.render('error.hbs', { message: 'Please upload CSV file only.' });
        }

        // set language
        let language;
        if (req.body.language) {
            language = req.body.language;
        } else {
            language = 'en';
        }

        // Write the file here
        let dir = './upload';

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        file.mv('./upload/' + fileName, async (error) => {

            if (error) {
                // go to error page.
                res.render('error.hbs', { message: 'Unable to upload the file, please try again.' });
            } else {

                // read the data
                let data = await csv().fromFile('./upload/' + fileName);

                // check the 4 8 10 column file hereand the call that function
                let count = hf.mif.countColumns(data);
                // Get all columns names
                let columnNames = hf.mif.getColumnNames(data);

                // Generate error page here, if the CSV file is not formatted as we want
                let ourColumns = [
                    'IntentID', 'IntentName', 'Query', 'Response',
                    'Response2', 'Action', 'InputContext', 'OutputContext',
                    'Lifespan', 'CallsWebhook'];

                columnNames.forEach(col => {
                    if (!ourColumns.includes(col)) {
                        res.render('error.hbs', { message: 'Please check the CSV file Column names, use only coma separated values, do not use semi-colon as a separater.' });
                    }
                });

                if (count == 4) {

                    if (status == 0) {
                        // unpaid user
                        hf.ciup.createUserSays(data, language);
                        hf.ciup.createIntentFour(data, language);
                        res.render('download.hbs', { four: 1, eight: 0, ten: 0, columnNames, data, message:'Only 5 training phrases per Intent and max 100 rows will be there in the agent.zip file.' });
                    } else {
                        // paid user
                        hf.cip.createUserSays(data, language);
                        hf.cip.createIntentFour(data, language);
                        res.render('download.hbs', { four: 1, eight: 0, ten: 0, columnNames, data });
                    }
                    
                } else if (count == 8) {
                    
                    if (status == 0) {
                        // unpaid user
                        hf.ciup.createUserSays(data, language);
                        hf.ciup.createIntentEight(data, language);
                        res.render('download.hbs', { four: 0, eight: 1, ten: 0, columnNames, data, message:'Only 5 training phrases per Intent and max 100 rows will be there in the agent.zip file.' });
                    } else {
                        // paid user
                        hf.cip.createUserSays(data, language);
                        hf.cip.createIntentEight(data, language);
                        res.render('download.hbs', { four: 0, eight: 1, ten: 0, columnNames, data });
                    }

                } else {
                    
                    if (status == 0) {
                        // unpaid user
                        hf.ciup.createUserSays(data, language);
                        hf.ciup.createIntentTen(data, language);
                        res.render('download.hbs', { four: 0, eight: 0, ten: 1, columnNames, data, message:'Only 5 training phrases per Intent and max 100 rows will be there in the agent.zip file.' });
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
        res.render('error.hbs', { message: 'Please choose a CSV file.' });
    }
});

app.get('/download', async (req, res) => {

    // Save JSON files to the DB
    fileNames = fs.readdirSync('./example/intents');
    
    for (const i in fileNames) {
        let jsonData = fs.readFileSync(`./example/intents/${fileNames[i]}`);
        let data = JSON.parse(jsonData);
        let query = {};
        query['text'] = 'INSERT INTO csvdata(email, data) VALUES($1, $2)';
        query['values'] = [req.session.email, {data}];
        await hf.dc.insertCSVData(query);
    }

    // create zip
    hf.mif.zipDirectory('./example', './agent.zip')
        .then(() => {
            // download
            res.download(__dirname + '/agent.zip');
            hf.mif.removeDir('./upload');
            hf.mif.removeDir('./example');
        })
        .catch((error) => {
            res.render('error.hbs', { message: 'Unable to create agent.zip file, please try again after sometime.' });
        });
});

app.get('/again', (req, res) => {

    hf.mif.removeDir('./upload');
    hf.mif.removeDir('./example');
    res.render('upload.hbs');
});

app.get('/admin', (req, res) => {
    res.render('admin-login.hbs');
});

app.get('/add-user-page', (req, res) => {
    res.render('add-user.hbs');
});

app.post('/add-user', async (req, res) => {

    var query = {};

    if (req.body.status) {
        query['text'] = 'INSERT INTO users(email, status) VALUES($1, $2)';
        query['values'] = [req.body.email, req.body.status];
    } else {
        query['text'] = 'INSERT INTO users(email, status) VALUES($1, $2)';
        query['values'] = [req.body.email, false];
    }

    let flag = await hf.dc.insertUser(query);

    if (flag == 1) {
        res.render('add-user.hbs', { successMessage: 'User added successfully.' });
    } else {
        res.render('add-user.hbs', { errorMessage: 'Something went wrong, please try again.' });
    }
});

app.get('/view-users', async (req, res) => {

    // get all the users
    let data = await hf.dc.getAllUserEmail();

    if (data['status'] == 1) {

        let emails = data['emails'];

        if (emails.length == 0) {
            res.render('view-users.hbs', { message: 'No user has visited the app.' });
        } else {
            res.render('view-users.hbs', { emails });   
        }
        
    } else {
        res.render('view-users.hbs');
    }
});

app.listen(5000, () => {
    console.log('Server is listening on port 5000.');
});