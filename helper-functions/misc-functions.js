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

module.exports = {
    getintentIDCount,
    countColumns,
    getColumnNames,
    removeDir,
    zipDirectory
}