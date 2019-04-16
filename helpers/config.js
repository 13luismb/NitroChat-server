const config = {
    dbUrl: 'postgres://postgres:masterkey@localhost:5432/NitroChat',
    port: 3001,
    secret: 'Vu1Kn0',
    uploads: `${__dirname}/../public/uploads`
}

module.exports = config;
