
// module variables
const environment = process.env.NODE_ENV || 'development';

const config = require(`./config.${environment}.json`);

if (config == null){
    throw new Error(`The configuration file 'config.${environment}.json' for environment 'environment' was not found.`)
}

module.exports = config;

console.log(`Environment: ${environment}`);