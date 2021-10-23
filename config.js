let environment = {
    staging: {
        httpsPort : '3000',
        httpPort: '3001',
        envName : 'Staging'
    },
    production:{
        httpsPort: '5000',
        httpPort: '5001.',
        envName : 'Production'
    }
}

let currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : 'staging';

let environmentToExport = typeof(environment[currentEnvironment]) === 'object' ? environment[currentEnvironment] : environment['staging']


module.exports = environmentToExport;