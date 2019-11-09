const fs = require('fs');

const mf = require('./misc-functions');

// Generate User Says JSON files & package.json
const createUserSays = async (data, language) => {

    let intentID = [];

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        intentID.push(parseInt(row['IntentID']));
    }

    let result = mf.getintentIDCount(intentID);

    let index = 0, ic = 0, maxRows = 0, maxIntent;

    for (let i = 0; i < result[1].length; i++) {

        var d = [];

        if (result[1][i] > 5) {
            maxIntent = 5;
        } else {
            maxIntent = result[1][i];
        }

        for (let j = 0; j < maxIntent; j++) {

            if (data[index]['Query']) {

                var fields = {
                    'data': [{ 'text': data[index]['Query'], 'userDefined': false }],
                    'isTemplate': false,
                    'count': 0,
                    'updated': 0
                }
            }

            index++;

            d.push(fields);

            // For unpaid user restriction
            maxRows++;
            if (maxRows == 99) {
                maxRows++;
                break;
            }

        }

        // Write the file here
        let dir = './example/intents'

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(`./example/intents/${data[ic]['IntentName']}_usersays_${language}.json`, JSON.stringify(d));

        ic += result[1][i];

        // For unpaid users
        if (maxRows == 100) {
            break;
        }
    }

    fs.writeFileSync(`./example/package.json`, JSON.stringify({"version":"1.0.0"}));
};

// Generate Intent JSON for 4 Column CSV
const createIntentFour = async (data, language) => {

    let intentID = [];

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        intentID.push(parseInt(row['IntentID']));
    }

    let result = mf.getintentIDCount(intentID);

    let maxIntent = fs.readdirSync('./example/intents/').length;

    let ic = 0, index = 0;

    for (let i = 0; i < maxIntent; i++) {

        var speech = [];

        for (let j = 0; j < result[1][i]; j++) {

            if (data[index]['Response']) {
                speech.push(data[index]['Response']);
            }

            index++;
        }

        var finalJson = {
            'name': data[ic]['IntentName'],
            'auto': true,
        };

        var responses = [{
            'resetContexts': false,
        }];

        var messages = [{
            'type': 0,
            'lang': language,
            'speech': speech
        }];

        responses[0]['messages'] = messages;

        finalJson['responses'] = responses;

        // Write the file here
        let dir = './example/intents';

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(`./example/intents/${data[ic]['IntentName']}.json`, JSON.stringify(finalJson));

        ic += result[1][i];
    }
};

// Generate Intent JSON for 8 Column CSV
const createIntentEight = async (data, language) => {

    let intentID = [];

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        intentID.push(parseInt(row['IntentID']));
    }

    let result = mf.getintentIDCount(intentID);

    let maxIntent = fs.readdirSync('./example/intents/').length;

    let ic = 0, index = 0;

    for (let i = 0; i < maxIntent; i++) {

        var contexts = [];

        var speech = [];

        var affectedContext = [];

        for (let j = 0; j < result[1][i]; j++) {

            if (data[index]['Response']) {
                speech.push(data[index]['Response']);
            }

            if (data[index]['InputContext']) {
                contexts.push(data[index]['InputContext']);
            }

            if (data[index]['OutputContext'] && data[index]['Lifespan']) {

                var oc = {
                    'name': data[index]['OutputContext'],
                    'lifespan': data[index]['Lifespan'],
                    'parameters': {}
                };

                affectedContext.push(oc);
            }

            index++;
        }

        var finalJson = {
            'name': data[ic]['IntentName'],
            'auto': true,
            'contexts': contexts,
        };

        var responses = [{
            'resetContexts': false,
        }];

        if (data[ic]['Action']) {
            responses[0]['action'] = data[ic]['Action'];
        } else {
            responses[0]['action'] = '';
        }

        var messages = [{
            'type': 0,
            'lang': language,
            'speech': speech
        }];

        responses[0]['messages'] = messages;

        responses[0]['affectedContexts'] = affectedContext;

        finalJson['responses'] = responses;

        // Write the file here
        let dir = './example/intents';

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(`./example/intents/${data[ic]['IntentName']}.json`, JSON.stringify(finalJson));

        ic += result[1][i];
    }
};

// Generate Intent JSON for 10 Column CSV
const createIntentTen = async (data, language) => {

    let intentID = [];

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        intentID.push(parseInt(row['IntentID']));
    }

    let result = mf.getintentIDCount(intentID);

    let maxIntent = fs.readdirSync('./example/intents/').length;

    let ic = 0, index = 0;

    for (let i = 0; i < maxIntent; i++) {

        var contexts = [];

        var speech = [];

        var speechTwo = [];

        var affectedContext = [];

        for (let j = 0; j < result[1][i]; j++) {

            if (data[index]['Response']) {
                speech.push(data[index]['Response']);
            }

            if (data[index]['Response2']) {
                speechTwo.push(data[index]['Response2']);
            }

            if (data[index]['InputContext']) {
                contexts.push(data[index]['InputContext']);
            }

            if (data[index]['OutputContext'] && data[index]['Lifespan']) {

                var oc = {
                    'name': data[index]['OutputContext'],
                    'lifespan': data[index]['Lifespan'],
                    'parameters': {}
                };

                affectedContext.push(oc);
            }

            index++;
        }

        var finalJson = {
            'name': data[ic]['IntentName'],
            'auto': true,
            'contexts': contexts,
        };

        if (data[ic]['CallsWebhook']) {
            if (data[ic]['CallsWebhook'] === 'Yes') {
                finalJson['webhookUsed'] = true;
            } else {
                finalJson['webhookUsed'] = false;
            }
        }

        var responses = [{
            'resetContexts': false,
        }];

        if (data[ic]['Action']) {
            responses[0]['action'] = data[ic]['Action'];
        } else {
            responses[0]['action'] = '';
        }

        var messages = [{
            'type': 0,
            'lang': language,
            'speech': speech
        }, {
            'type': 0,
            'lang': language,
            'speech': speechTwo
        }];

        responses[0]['messages'] = messages;

        responses[0]['affectedContexts'] = affectedContext;

        finalJson['responses'] = responses;

        // Write the file here
        let dir = './example/intents';

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(`./example/intents/${data[ic]['IntentName']}.json`, JSON.stringify(finalJson));

        ic += result[1][i];
    }
};

module.exports = {
    createUserSays,
    createIntentFour,
    createIntentEight,
    createIntentTen
};