let environment = {
    staging: {
        httpsPort : '3000',
        httpPort: '3001',
        envName : 'Staging',
        secret: 'This is not production',
        maxChecks: 5
    },
    production:{
        httpsPort: '5000',
        httpPort: '5001.',
        envName : 'Production',
        secret: 'This is not development',
        maxChecks: 5
    }
}

let currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : 'staging';

let environmentToExport = typeof(environment[currentEnvironment]) === 'object' ? environment[currentEnvironment] : environment['staging']


module.exports = environmentToExport;