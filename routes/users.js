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

        req.body.email = resp.email;
        req.body.eventURL = resp.event.url;
        req.body.eventName = resp.event.name.text;
        req.body.firstName = resp.first_name;
        req.body.lastName = resp.last_name;

        next();
      })
      .catch(function (err) {
        console.error(err);
      });
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
        console.log(resp.profile.email);
        req.body.email = resp.profile.email;
        
        next();
      })
      .catch(function (err) {
        console.error(err);
      });
  }
  else {
    console.log(req.body);
    res.sendStatus(200);
  } 
}, function (req, res, next) {

  if (req.body.eventURL) {

    var options = {
      method: 'PUT',
      uri: process.env.INFUSIONSOFT_URL,
      qs: {
          access_token: process.env.INFUSIONSOFT_TOKEN // -> uri + '?access_token=xxxxx%20xxxxx'
      },
      headers: {
          'User-Agent': 'Request-Promise'
      },
      body: {
        "duplicate_option": "Email",
        "email_addresses": [
          {
            "email": req.body.email,
            "field": "EMAIL1"
          }
        ],
        "custom_fields" : [
          {
            "content" : req.body.eventURL,
            "id" : 23
          },
          {
            "content" : req.body.eventName,
            "id" : 31
          }
        ],
        "given_name" : req.body.firstName,
        "family_name" : req.body.lastName
      },
      json: true // Automatically parses the JSON string in the response
    };
  
    rp(options)
      .then(function (resp) {
        console.log(resp);
      })
      .catch(function (err) {
        console.log(err);
      });

    res.sendStatus(200);
    
  }
  else {

    let options = {
      uri : process.env.INFUSIONSOFT_URL,
      qs : {
        access_token : process.env.INFUSIONSOFT_TOKEN,
        email : req.body.email
      }
    }

    rp(options)
      .then(function (resp) {
        console.log(JSON.parse(resp).contacts[0].id);
        req.body.id = JSON.parse(resp).contacts[0].id;
        next();
      })
      .catch(function (err) {
        console.error(err);
      });
  }
}, function(req, res) {
  
  console.log(req.body);

  let options = {
    "method" : 'POST',
    "uri" : process.env.INFUSIONSOFT_URL + '/' + req.body.id + '/tags',
    "qs" : {
      access_token : process.env.INFUSIONSOFT_TOKEN,
    },
    body : {
      tagIds : [ 319 ]
    },
    json : true
  }

  rp(options)
    .then(function (resp) {
      console.log(resp)
    })
    .catch(function (err) {
      console.error(err);
    });

  res.sendStatus(200);
});

module.exports = router;
