/**************************************************************************
 *  (C) Copyright ModusBox Inc. 2019 - All rights reserved.               *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       James Bush - james.bush@modusbox.com                             *
 **************************************************************************/

'use strict';

const util = require('util');
const express = require('express');
const fetch = require('node-fetch');
const Crypto = require('crypto');
const base64url = require('base64url');

const app = express();
const port = process.env['LISTEN_PORT'] || 3000;

const { participants, parties } = require('./data.json');
let homeTransactionId = 1000000;

app.use(express.json({ type: '*/*'}));

//log all requests
app.use((req, res, next) => {
    console.log(`${Date.now()} ${req.method} ${req.originalUrl}`);
    console.log(`${util.inspect(req.headers)}`);    

    if(req.body) {
        console.log(`${util.inspect(req.body, { depth: 10 })}`);
    }
    return next();
});


//health check endpoint
app.get('/', (req, res) => {
    //return 200
    res.status(200).end();
});


app.get('/parties/:idType/:idValue', async (req, res) => {
    const party = parties[req.params.idType][req.params.idValue];
    if(party) {
        return res.send(party);
    }

    res.status(404).end();
});


app.post('/quoterequests', async (req, res) => {
    // always return zero fees
    res.send({
        quoteId: req.body.quoteId,
        transactionId: req.body.transactionId,
        transferAmount: req.body.amount,
        transferAmountCurrency: req.body.currency,
        payeeReceiveAmount: req.body.amount,
        payeeReceiveAmountCurrency: req.body.currency,
        expiration: new Date().toISOString(),
    });
});


app.post('/transfers', async (req, res) => {
    // just increment homeTransactionId
    res.send({
        homeTransactionId: `${homeTransactionId++}`
    });
});


app.post('/send', async (req, res) => {

});


// default 404 for unhandled routes
app.use((req, res) => {
    res.status(404).end();
});


//start the server
const server = app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});


const buildHeaders = (resourceType, source, dest) => {
    let headers = {
        'Content-Type': `application/json`,
        'Accept': `application/json`,
        'Date': new Date().toUTCString(),
        'User-Agent': 'Mojaloop SDK'  //node-fetch INSISTS on sending a user-agent header!? infuriating!
    };

    return headers;
}


//shutdown gracefully on SIGTERM
process.on('SIGTERM', () => {
    server.close();
});

