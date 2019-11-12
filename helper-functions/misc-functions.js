const fs = require('fs');

const archiver = require('archiver');
const path = require('path');

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
        fs.readdirSync(dir_path).forEach(function(entry) {
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
            .pipe(stream)
            ;

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

module.exports = {
    getintentIDCount,
    countColumns,
    getColumnNames,
    removeDir,
    zipDirectory,
    generateDataUnpaidUsers
}