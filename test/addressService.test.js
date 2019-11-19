var azure = require('azure-storage');
jest.mock('azure-storage');

test('get known name of valid asset', async () => {
    let azureService = {
        createTableIfNotExists: jest.fn(),
        retrieveEntity: jest.fn(function(table, asset, name, callback){
            callback(null, {PartitionKey:{_:"btc"}, RowKey:{_:"guido.zanon"}, address:{_:"123"}}, null);
        })
    };

    azure.createTableService.mockImplementation(() => azureService);

    const service = require('../services/addressService');

    const result = await service.get('btc','guido.zanon');
    return expect(result).not.toBeNull() &&
            expect(result.asset).toEquals('btc') &&
            expect(result.name).toEquals('guido.zanon') &&
            expect(result.address).toEquals('123');
});