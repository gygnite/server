// Update with your config settings.

module.exports = {

    development: {
        client: 'pg',
        connection: 'postgresql://localhost/gygnite'
    },

    test: {
        client: 'pg',
        connection: 'postgresql://localhost/gygnite-test'
    },

    production: {
        client: 'pg',
        connection: {
            host: process.env.RDS_HOSTNAME,
            port: process.env.RDS_PORT,
            database: process.env.RDS_DB_NAME,
            user: process.env.RDS_USERNAME,
            password: process.env.RDS_PASSWORD
        },
        migrations: 'migrations'
    }

};
