var express = require('express');
var router = express.Router();
const eventsJson = require('../lib/getEventsJSON.js');
const catchErrors = require('../lib/async-error');

/* GET home page. */
router.get('/', catchErrors((req, res, next) => eventsJson(req, res, next, 'index')));


module.exports = router;
