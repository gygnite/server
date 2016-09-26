// Update with your config settings.

module.exports = {

    development: {
        client: 'pg',
        connection: 'postgresql://localhost/gygnite'
    },

    'test': {
        client: 'pg',
        connection: 'postgresql://localhost/gygnite-test'
    },

    production: {
        client: 'pg',
        connection: process.env.RDS_HOSTNAME
    }

};
