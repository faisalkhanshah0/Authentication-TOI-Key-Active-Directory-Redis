var express = require('express');
var router = express.Router();
var { client, redisClient } = require('../server/redis-connect.js');
var { ad } = require('.././server/activedirectory-auth');
const jwt = require('jsonwebtoken');

var response = {
  status: undefined,
  result: {}
}
router.get('/', function(req, res, next) {
  res.json({status: 1});
});

/* POST Login API. */
router.post('/login', function(req, res, next) {

  var username = req.get('email');
  var password = req.get('password'); 
   
  ad.authenticate(username, password, function(err, auth) {
    response.status = 0;
    if (err) {
      console.log('ERROR: '+JSON.stringify(err));
      res.json(response);
      return;
    }
    
    if (auth) {
      client.then((msg) => {
        redisClient.get(username, function(err, result) {
          let responsefinal = Object.create(response);
          responsefinal.status = 1;
          // reply is null when the key is missing 
          if(result === null)
          {
            var sAMAccountName = username;
            var opts = {
              bindDN: username,
              bindCredentials: password
            };
            // Find user by a sAMAccountName 
            ad.findUser(opts, sAMAccountName, function(err, user) {
              if (err) {
                console.log('ERROR: ' +JSON.stringify(err));
                return;
              }
            
              if (! user) console.log('User: ' + sAMAccountName + ' not found.');
              else {
                let data = {
                  company: user.company,
                  department: user.department,
                  displayName: user.displayName,
                  division: user.division ? user.division : '',
                  fullname: user.sAMAccountName,
                  mobile: user.mobile,
                  title: user.title,
                  user: user.sAMAccountName,
                  userlocation: user.physicalDeliveryOfficeName,
                  userprincipalname: user.userPrincipalName
                }
                var tokenid = jwt.sign(data,process.env.secret).toString(); 
                data.tokenid = tokenid;
                redisClient.set(username, tokenid, 'EX', process.env.expiresin);
                
                data.expire_time = process.env.expiresin;
                responsefinal.result = data;
                res.json(responsefinal)
              }
            });
            
            return;
          }

          let token = result;
          let decodedata = jwt.verify(token,process.env.secret);
          decodedata.tokenid = token;
          redisClient.ttl(username, function(err, expiresin){
          decodedata.expire_time = expiresin;
          delete decodedata['iat'];
          var resp = Object.create(response);
          resp.status = 1;
          resp.result = decodedata;
          res.json(resp);
          });
          
      });
        
      }).catch((err) => {
        res.json(response);
      });
    }
    else {
      res.json(response);
    }
  });
});

/* POST Validate Token API. */
router.post('/validatetoken', function(req, res, next) {
  var params = req.body;
  jwt.verify(params.token,process.env.secret, function(err, decoded){
    var validatestatus;
    if(err)
    {
      validatestatus = 400;
      res.status(400).send({status: validatestatus});
      return;
    }
    let key = decoded.userprincipalname;
    redisClient.get(key, function(err, result) {
    if(result === null)
    {
      validatestatus = 400;
      res.status(400).send({status: validatestatus});
    }
    else{
      if(result!==params.token)
      {
        validatestatus = 400;
        res.status(400).send({status: validatestatus});
      }
      else{
        validatestatus = 200;
        res.json({status: validatestatus});
      }
      
    }
    
  });
  });
  
  
  
  });

  router.post('*', function(req, res, next) {
    let validatestatus = 'Not Allowed!';
    res.status(400).send({status: validatestatus});
  })
  router.get('*', function(req, res, next) {
    let validatestatus = 'Not Allowed!';
    res.status(400).send({status: validatestatus});
  })
  router.put('*', function(req, res, next) {
    let validatestatus = 'Not Allowed!';
    res.status(400).send({status: validatestatus});
  })
  router.patch('*', function(req, res, next) {
    let validatestatus = 'Not Allowed!';
    res.status(400).send({status: validatestatus});
  })
  router.delete('*', function(req, res, next) {
    let validatestatus = 'Not Allowed!';
    res.status(400).send({status: validatestatus});
  })

module.exports = router;
