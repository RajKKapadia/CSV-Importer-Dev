require('dotenv').config();

const env = process.env.NODE_ENV;

const development = {

    "settings": {
        "REDIRECT_URL": process.env.REDIRECT_URL,
        "DATABASE_URL": process.env.DATABASE_URL,
        "ssl": false
    }
};

const production = {

    "settings": {
        "REDIRECT_URL": process.env.REDIRECT_URL,
        "DATABASE_URL": process.env.DATABASE_URL,
        "ssl": true
    }
};

const config = {
    development,
    production
};

module.exports = config[env];