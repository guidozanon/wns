var azure = require('azure-storage');
var config = require('../config/config');
var bitcore = require('bitcore-message/node_modules/bitcore-lib');
var Message = require('bitcore-message');

class addressService {
    constructor() {
        this.tableSvc = azure.createTableService(config.storage.connectionString);

        this.tableSvc.createTableIfNotExists(config.storage.table, function (error, result, response) {
            if (error) {
                console.log(error);
            }
        });
    }

    async get(asset, name) {
        return new Promise((resolve, reject) => {
            this.tableSvc.retrieveEntity(config.storage.table, asset, name, function (error, result, response) {
                if (!error) {
                    var entGen = azure.TableUtilities.entityGenerator;
                    
                    return resolve({
                        asset: result.PartitionKey._,
                        name: result.RowKey._,
                        address: result.address._,
                        owner: result.owner && result.owner._,
                        wallet: result.wallet && result.wallet._,
                        country: result.country && result.country._,
                        notes: result.notes && result.notes._,
                        createdOn: result.createdOn && result.createdOn._,
                        updatedOn: result.updatedOn && result.updatedOn._
                    });
                } else {
                    if (error.statusCode == 404) {
                        return resolve(null);
                    }
                    return reject(error);
                }
            });
        });
    }

    async add(asset, name, info) {
        return new Promise((resolve, reject) => {
            var entGen = azure.TableUtilities.entityGenerator;
            var address = {
                PartitionKey: entGen.String(asset),
                RowKey: entGen.String(name),
                address: entGen.String(info.address),
                owner: entGen.String(info.owner),
                country: entGen.String(info.country),
                wallet: entGen.String(info.wallet),
                notes: entGen.String(info.notes),
                createdOn: entGen.DateTime(new Date()),
                updatedOn: null
            };

            if (this._verify(asset, name, info.address, info.proof)) {
                this.tableSvc.insertEntity(config.storage.table, address, function (error, result, response) {
                    if (!error) {
                        return resolve();
                    } else {
                        return reject(error);
                    }
                });
            }else{
                return reject(new Error(`Seems that you are not the owner of that address!`));
            }
        });
    }

    async update(wns, info) {
        return new Promise((resolve, reject) => {
            var entGen = azure.TableUtilities.entityGenerator;
            var address = {
                PartitionKey: entGen.String(wns.asset),
                RowKey: entGen.String(wns.name),
                address: entGen.String(info.address),
                owner: entGen.String(info.owner || wns.owner),
                country: entGen.String(info.country || wns.country),
                wallet: entGen.String(info.wallet || wns.wallet),
                notes: entGen.String(info.notes || wns.noes),
                createdOn: entGen.DateTime(wns.createdOn),
                updatedOn: entGen.DateTime(new Date())
            };

            if (this._verify(wns.asset, wns.name, wns.address, info.updateProof) && this._verify(wns.asset, wns.name, info.address, info.proof) ) {
                this.tableSvc.replaceEntity(config.storage.table, address, function (error, result, response) {
                    if (!error) {
                        return resolve();
                    } else {
                        return reject(error);
                    }
                });
            }else{
                return reject(new Error(`Seems that you are not the owner of that address!`));
            }
        });
    }

    _verify(asset, name, address, proof) {
        if (asset === "btc") {
            try{
                return new Message(name).verify(address, proof);
            }catch(err)
            {
                return false;
            }
        }

        throw new Error(`Asset '${asset}' not supported.`);
    }
}

module.exports = new addressService();