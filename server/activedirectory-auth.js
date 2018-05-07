var ActiveDirectory = require('activedirectory');
// var config = { url: 'ldap://dc.domain.com',
//                baseDN: 'dc=domain,dc=com',
//                username: 'username@domain.com',
//                password: 'password' }
var config = { 
               url: 'ldap://10.150.226.23:389',
               baseDN: 'OU=TIL,OU=TimesGroup,dc=timesgroup,dc=com',
            //    username: 'c-shah.faisal@timesinternet.in',
            //    password: 'XXXXXXX',
            //    logging: {
            //     name: 'ActiveDirectory',
            //     streams: [
            //       { level: 'debug',
            //         stream: process.stdout }
            //     ]
            //   },
            attributes: {
                user: [ 'userPrincipalName', 'physicalDeliveryOfficeName', 'cn', 'company', 'sn', 'title', 'givenName', 'displayName', 'department', 'name', 'sAMAccountName', 'mail', 'mobile', 'division' ],
                // group: [ 'anotherCustomAttribute', 'objectCategory' ]
              }
            }
var ad = new ActiveDirectory(config);






module.exports = {
    ad
}