var express = require('express');
var router = express.Router();
var rp = require('request-promise-native');

/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log(req.query, req.body);
  res.send(req.body);
});

router.post('/', function(req, res, next) {

  if (req.body.config.action === 'order.placed') {
    var options = {
      uri: req.body.api_url,
      qs: {
          token: process.env.EVENTBRITE_TOKEN, // -> uri + '?access_token=xxxxx%20xxxxx'
          expand: 'event'
      },
      headers: {
          'User-Agent': 'Request-Promise'
      },
      json: true // Automatically parses the JSON string in the response
    };
  
  console.log(options);
   
  rp(options)
      .then(function (resp) {
        console.log(resp.email);
        console.log(resp.event.url);
        // console.log(resp);
      })
      .catch(function (err) {
          // API call failed...
      });
  
    res.sendStatus(200);
  }
  else if (req.body.config.action === 'barcode.checked_in') {

    var options = {
      uri: req.body.api_url,
      qs: {
          token: process.env.EVENTBRITE_TOKEN // -> uri + '?access_token=xxxxx%20xxxxx'
      },
      headers: {
          'User-Agent': 'Request-Promise'
      },
      json: true // Automatically parses the JSON string in the response
    };

    rp(options)
      .then(function (resp) {
        // console.log(resp.email);
        // console.log(resp.event.url);
        console.log(resp.profile.email);
      })
      .catch(function (err) {
          // API call failed...
      });

    // console.log(req.body);
    res.sendStatus(200);
  } 
});

module.exports = router;
