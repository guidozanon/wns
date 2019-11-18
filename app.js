var express = require('express');
var cors = require('cors')
var logger = require('morgan');
const appInsights = require("applicationinsights");
var publicRoutes = require('./routes/api/public');
var config = require('./config/config');
var bodyParser= require('body-parser');

if (config.appInsightKey) {
    appInsights.setup(config.appInsightKey);
    appInsights.start();
}

var app = express();
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', publicRoutes);

app.listen(3000, () => {
    console.log("Server running on port 3000");
});