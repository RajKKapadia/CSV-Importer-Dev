const fs = require('fs');
const path = require('path');

const archiver = require('archiver');
const extract = require('extract-zip');
const ObjectsToCsv = require('objects-to-csv');

// Generate the IntentID and Count
const getintentIDCount = (array) => {

    // a = intent count
    // b = each intent count
    let a = [], b = [], prev;

    for (let i = 0; i < array.length; i++) {
        if (array[i] !== prev) {
            a.push(array[i]);
            b.push(1);
        } else {
            b[b.length - 1]++;
        }
        prev = array[i];
    }

    return [a, b];
};

// Count the columns in the csv file
const countColumns = (data) => {

    let count = 0;
    for (const col in data[0]) {
        if (data[0].hasOwnProperty(col)) {
            count++;
        }
    }
    return count;
};

// Get column names from the csv file
const getColumnNames = (data) => {
    let columnNames = [];
    for (const col in data[0]) {
        if (data[0].hasOwnProperty(col)) {
            columnNames.push(col);
        }
    }
    return columnNames;
};

// Remove directory from the system
const removeDir = (dir_path) => {
    if (fs.existsSync(dir_path)) {
        fs.readdirSync(dir_path).forEach(function (entry) {
            var entry_path = path.join(dir_path, entry);
            if (fs.lstatSync(entry_path).isDirectory()) {
                removeDir(entry_path);
            } else {
                fs.unlinkSync(entry_path);
            }
        });
        fs.rmdirSync(dir_path);
    }
};

// Create a zip file
const zipDirectory = (source, out) => {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = fs.createWriteStream(out);

    return new Promise((resolve, reject) => {
        archive
            .directory(source, false)
            .on('error', err => reject(err))
            .pipe(stream);

        stream.on('close', () => resolve());
        archive.finalize();
    });
};

// Generate the data for the Table Unpaid Users
const generateDataUnpaidUsers = (data) => {

    let intentID = [];

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        intentID.push(parseInt(row['IntentID']));
    }

    let result = getintentIDCount(intentID);

    let columnsCount = countColumns(data);

    if (columnsCount == 4) {

        let index = 0, maxRows = 0, maxIntent;

        let newData = [];

        for (let i = 0; i < result[1].length; i++) {

            if (result[1][i] > 5) {
                maxIntent = 5;
            } else {
                maxIntent = result[1][i];
            }

            for (let j = 0; j < maxIntent; j++) {

                let tempData = {};

                tempData['IntentID'] = data[index]['IntentID'];
                tempData['IntentName'] = data[index]['IntentName'];
                tempData['Query'] = data[index]['Query'];
                tempData['Response'] = data[index]['Response'];

                index++;

                newData.push(tempData);

                // For unpaid user restriction
                maxRows++;
                if (maxRows == 99) {
                    maxRows++;
                    break;
                }

            }

            let diff = result[1][i] - maxIntent;
            for (let k = 0; k < diff; k++) {
                index++;
            }

            // For unpaid users
            if (maxRows == 100) {
                break;
            }
        }

        return newData;

    } else if (columnsCount == 8) {

        let index = 0, maxRows = 0, maxIntent;

        let newData = [], tempData = {};

        for (let i = 0; i < result[1].length; i++) {

            if (result[1][i] > 5) {
                maxIntent = 5;
            } else {
                maxIntent = result[1][i];
            }

            for (let j = 0; j < maxIntent; j++) {

                tempData = {};

                tempData['IntentID'] = data[index]['IntentID'];
                tempData['IntentName'] = data[index]['IntentName'];
                tempData['Query'] = data[index]['Query'];
                tempData['Response'] = data[index]['Response'];
                tempData['Action'] = data[index]['Action'];
                tempData['InputContext'] = data[index]['InputContext'];
                tempData['OutputContext'] = data[index]['OutputContext'];
                tempData['Lifespan'] = data[index]['Lifespan'];

                index++;

                newData.push(tempData);

                // For unpaid user restriction
                maxRows++;
                if (maxRows == 99) {
                    maxRows++;
                    break;
                }

            }

            let diff = result[1][i] - maxIntent;
            for (let k = 0; k < diff; k++) {
                index++;
            }

            // For unpaid users
            if (maxRows == 100) {
                break;
            }
        }

        return newData;
    } else {

        let index = 0, maxRows = 0, maxIntent;

        let newData = [], tempData = {};

        for (let i = 0; i < result[1].length; i++) {

            if (result[1][i] > 5) {
                maxIntent = 5;
            } else {
                maxIntent = result[1][i];
            }

            for (let j = 0; j < maxIntent; j++) {

                tempData = {};

                tempData['IntentID'] = data[index]['IntentID'];
                tempData['IntentName'] = data[index]['IntentName'];
                tempData['Query'] = data[index]['Query'];
                tempData['Response'] = data[index]['Response'];
                tempData['Response2'] = data[index]['Response2'];
                tempData['Action'] = data[index]['Action'];
                tempData['InputContext'] = data[index]['InputContext'];
                tempData['OutputContext'] = data[index]['OutputContext'];
                tempData['Lifespan'] = data[index]['Lifespan'];
                tempData['CallsWebhook'] = data[index]['CallsWebhook'];

                index++;

                newData.push(tempData);

                // For unpaid user restriction
                maxRows++;
                if (maxRows == 99) {
                    maxRows++;
                    break;
                }

            }

            let diff = result[1][i] - maxIntent;
            for (let k = 0; k < diff; k++) {
                index++;
            }

            // For unpaid users
            if (maxRows == 100) {
                break;
            }
        }

        return newData;
    }
};

const findEmptyRow = (data) => {

    let count = countColumns(data);
    let flag;

    for (let i = 0; i < data.length; i++) {
        let row = data[i];
        let x = 0;
        for (const col in row) {
            if (row[col] === '') {
                x++;
            }
        }
        if (x == count) {
            flag = 1;
            break;
        } else {
            flag = 0;
        }
    }
    return flag;
};

const badCSVFormat = (data) => {

    let ourColumns = [
        'IntentID', 'IntentName', 'Query', 'Response',
        'Response2', 'Action', 'InputContext', 'OutputContext',
        'Lifespan', 'CallsWebhook'
    ];

    let columnNames = getColumnNames(data);

    let flag;

    for (let i = 0; i < columnNames.length; i++) {
        const col = columnNames[i];
        if (!ourColumns.includes(col)) {
            flag = 1;
            break;
        } else {
            flag = 0
        }
    }

    return flag;
};

const extractZipFile = async (source, destination) => {

    // this unzip function requires absolute path to the directory
    return new Promise((resolve, reject) => {
        extract(source, { dir: destination }, (error) => {
            if (error) {
                console.log('Error at unzip --> ', error);
                reject({
                    'status': 0
                });
            } else {
                resolve({
                    'status': 1
                });
            }
        })
    });
};

const createCSVFile = async (agentPath, csvPath) => {

    let mainData = [];

    let fileNames = fs.readdirSync(`${agentPath}/intents`);

    let language;

    fileNames.forEach(fn => {
        if (fn.includes('_usersays_')) {
            let tempLang = fn.split('_usersays_')[1];
            language = tempLang.split('.json')[0];
        }
    });

    let index = 0, intentID = 1;

    for (let i = 0; i < fileNames.length; i += 2) {

        let one, two, intentName, queries = [],
            response = [], response2 = [], action, inputContext = [],
            outputContext = [], lifeSpan = [], callsWebhook;

        if (fileNames[index].includes('_usersays_')) {
            one = `${fileNames[index].split('_usersays_')[0]}.json`;
            two = fileNames[index];
        } else {
            one = fileNames[index];
            two = `${fileNames[index].split('.json')[0]}_usersays_${language}.json`;
        }

        if (two === 'NF') {
            // Fallback intent
            intentID++;
            index++;
        } else {

        }

        // Both intent is available
        let oneData = fs.readFileSync(`${agentPath}/intents/${one}`);
        let twoData = fs.readFileSync(`${agentPath}/intents/${two}`);

        let oneJson = JSON.parse(oneData);
        let twoJson = JSON.parse(twoData);

        // IntentID and IntentName
        intentName = oneJson['name'];
        action = oneJson['responses'][0]['action'];

        twoJson.forEach(data => {
            queries.push(data['data'][0]['text']);
        });

        let messages = oneJson['responses'][0]['messages'];

        let messageData = [];

        messages.forEach(message => {
            let platform = message['platform'];
            if (platform !== undefined) {
            } else {
                messageData.push(message);
            }
        });

        if (messageData.length == 2) {
            let speechOne = messageData[0]['speech'];
            let speechTwo = messageData[1]['speech'];

            if (typeof (speechOne) === 'string') {
                response.push(speechOne);
            } else {
                speechOne.forEach(so => {
                    response.push(so);
                });
            }

            if (typeof (speechTwo) === 'string') {
                response2.push(speechTwo);
            } else {
                speechTwo.forEach(st => {
                    response2.push(st);
                });
            }
        } else {
            messageData.forEach(md => {
                let speech = md['speech'];
                if (typeof(speech) === 'string') {
                    response.push(speech);
                } else {
                    speech.forEach(s => {
                        response.push(s);
                    })
                }
            })
        }

        let contexts = oneJson['contexts'];

        if (contexts.length == 0) {
        } else {
            contexts.forEach(context => {
                inputContext.push(context);
            });
        }

        let affectedContexts = oneJson['responses'][0]['affectedContexts'];

        if (affectedContexts.length == 0) {
        } else {
            affectedContexts.forEach(ac => {
                outputContext.push(ac['name']);
                lifeSpan.push(ac['lifespan'])
            });
        }

        let webhook = oneJson['webhookUsed'];

        if (webhook) {
            callsWebhook = 'Yes';
        } else {
            callsWebhook = 'No';
        }

        let tempLength;

        if (queries.length >= response.length && queries.length >= response2.length) {
            tempLength = queries.length;
        } else if (response.length >= response2.length) {
            tempLength = response.length;
        } else {
            tempLength = response2.length;
        }

        for (let k = 0; k < tempLength; k++) {
            let tempData = {};
            if (k == 0) {

                tempData['IntentID'] = intentID;
                tempData['IntentName'] = intentName;

                if (queries[k]) {
                    tempData['Query'] = queries[k];
                } else {
                    tempData['Query'] = '';
                }

                if (response[k]) {
                    tempData['Response'] = response[k];
                } else {
                    tempData['Response'] = '';
                }

                if (response2[k]) {
                    tempData['Response2'] = response2[k];
                } else {
                    tempData['Response2'] = '';
                }

                tempData['Action'] = action;

                if (inputContext[k]) {
                    tempData['InputContext'] = inputContext[k];
                } else {
                    tempData['InputContext'] = '';
                }

                if (outputContext[k]) {
                    tempData['OutputContext'] = outputContext[k];
                } else {
                    tempData['OutputContext'] = '';
                }

                if (lifeSpan[k]) {
                    tempData['Lifespan'] = lifeSpan[k];
                } else {
                    tempData['Lifespan'] = '';
                }

                tempData['CallsWebhook'] = callsWebhook;

            } else {
                tempData['IntentID'] = intentID;
                tempData['IntentName'] = '';

                if (queries[k]) {
                    tempData['Query'] = queries[k];
                } else {
                    tempData['Query'] = '';
                }

                if (response[k]) {
                    tempData['Response'] = response[k];
                } else {
                    tempData['Response'] = '';
                }

                if (response2[k]) {
                    tempData['Response2'] = response2[k];
                } else {
                    tempData['Response2'] = '';
                }

                tempData['Action'] = '';

                if (inputContext[k]) {
                    tempData['InputContext'] = inputContext[k];
                } else {
                    tempData['InputContext'] = '';
                }

                if (outputContext[k]) {
                    tempData['OutputContext'] = outputContext[k];
                } else {
                    tempData['OutputContext'] = '';
                }

                if (lifeSpan[k]) {
                    tempData['Lifespan'] = lifeSpan[k];
                } else {
                    tempData['Lifespan'] = '';
                }

                tempData['CallsWebhook'] = '';

            }

            mainData.push(tempData);
        }
        index++;
        intentID++;
    }

    const csv = new ObjectsToCsv(mainData);
    await csv.toDisk(csvPath);
};

module.exports = {
    getintentIDCount,
    countColumns,
    getColumnNames,
    removeDir,
    zipDirectory,
    generateDataUnpaidUsers,
    findEmptyRow,
    badCSVFormat,
    extractZipFile,
    createCSVFile
}