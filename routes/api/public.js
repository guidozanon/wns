var express = require('express');
var router = express.Router();
var addressService = require('../../services/addressService');

//GET wallet address
router.get('/:asset/:name', async (req, res, next) => {
    try {
        let asset = req.params.asset;
        let name = req.params.name;

        var address = await addressService.get(asset, name);

        if (address) {
            res.json(address);
        }

        res.status(404).json({ message: `Address not found for Name '${name}' in asset type '${asset}'.` });
    } catch (e) {
        console.log(e)
        res.status(400).json(e.message);
    }
});

//cretes or update wallet name address record
router.post('/:asset/:name', async (req, res) => {
    try {
        let asset = req.params.asset;
        let name = req.params.name;

        var info = req.body;

        if (!info.address)
            res.status(400).json({ message: 'Address is required to set the Asset info.' });

        if (!info.proof)
            res.status(400).json({ message: 'Proof is required to set the Asset info.' });

        var existing = await addressService.get(asset, name);

        if (existing) {
            if (!info.updateProof) {
                res.status(400).json({ message: 'Name is already in use. If you are the owner, send proof of the previous address on attribute updateProof.' });
            } else {
                await addressService.update(existing, info);

                return res.json({ wns: name });    
            }
        } else {
            await addressService.add(asset, name, info);

            return res.json({ wns: name });
        }

    } catch (e) {
        console.log(e)
        res.status(400).json(e.message);
    }
});


module.exports = router;