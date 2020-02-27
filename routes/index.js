var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/theContacts';
var contactList;

MongoClient.connect(url, function(err, db) {
  console.log("Connected correctly to server.");
  contactList = db.db().collection('contactList');
});


var count = 0;
var loggedIn = false;

var start = function(req, res, next) {
    console.log("Starting!");
    var value = Math.floor((Math.random()*10)+1);
    req.session.value = value;
    req.session.results = [];
    
    res.render('start', { });
}

router.get('/', start);
router.get('/start', start);

router.post('/start', function(req, res, next){
    loggedIn = false;
    res.render('start', { });
});


router.post('/mailer', function(req, res, next) {
    if ( !req.session.value || !loggedIn) {
        res.redirect('/start')
        return;
    }
    
    res.render('mailer', { });
});

router.get('/mailer', function(req, res, next) {
    if ( !req.session.value || !loggedIn) {
        res.redirect('/start')
        return;
    }
    
    res.render('mailer', { });
});

router.get('/contacts', function(req, res, next) {
    if (!req.session.value || !loggedIn) {
        res.redirect('/start')
        return;
    }

    console.log(loggedIn);
    if ( !req.session.value) {
        res.redirect('/start')
        return;
    }
    contactList.find({}).toArray(function (err, result) {
        //console.log(result);
        res.render('contacts', {contactList: result});
        
    });
    
    //res.render('contacts', { });
});

router.post('/contacts', function(req, res, next) {
    if ( !req.session.value) {
        res.redirect('/start')
        return;
    }
    if(!loggedIn){
        var username = req.body.username;
        var password = req.body.password;

        console.log(username);
        console.log(password);
        if(username == "contact" && password == "mapping"){
            loggedIn = true;
        }
        else{
            console.log("Wrong username or password");
            res.redirect('/start')
            return;
        }
    }

    console.log(loggedIn);
    if ( !req.session.value) {
        res.redirect('/start')
        return;
    }
    contactList.find({}).toArray(function (err, result) {
        res.render('contacts', {contactList: result});
    });
});

router.post('/thankyou', function(req, res, next) {
    if ( !req.session.value || !loggedIn) {
        res.redirect('/start')
        return;
    }
    var contact = { 
        name : req.body.firstName + " " + req.body.lastName,
        address : req.body.street + ", " + req.body.city + ", " + req.body.states + " " + req.body.zip,
        phone : req.body.phone, email : req.body.email
    };
    if(req.body.checkAny || req.body.checkMail){
        contact.mail = "Yes"
    }
    else{
        contact.mail = "No"
    }
    contact.title = req.body.title;
    //console.log(req.session.id);
    //console.log(req.session.the_id);
    //console.log(contactList);
    addAContact(contact);
    //contactList.push(contact);
    res.render('thankyou', {  });
});

router.get('/thankyou', function(req, res, next) {
    if ( !req.session.value || !loggedIn) {
        res.redirect('/start')
        return;
    }
    
    res.render('thankyou', { });
});

router.post('/update', function(req, res, next) {
    if ( !req.session.value || !loggedIn) {
        res.redirect('/start')
        return;
    }

    var id = req.body.contactId;
    console.log(id);

    var a = contactList.find({ _id : ObjectID(id) }).toArray(function(err, result) {
        if (err) throw err;
        
        var contactObj = result[0];
        contactObj.firstName = result[0].name.substr(0, result[0].name.indexOf(' '));
        contactObj.lastName = result[0].name.substr(result[0].name.indexOf(' ')+1);
        var addressArray = result[0].address.split(', ');
        //console.log(addressArray);
        contactObj.street = addressArray[0];
        contactObj.city = addressArray[1];
        contactObj.states = addressArray[2].substr(0, addressArray[2].indexOf(' '));
        contactObj.zip = addressArray[2].substr(addressArray[2].indexOf(' ')+1);

        contactObj.email = result[0].email;
        contactObj.mail = result[0].mail;
        contactObj.title = result[0].title;
        
        res.render('update', { contact : contactObj });
        //console.log(result["name"]);
    });
});
router.get('/update', function(req, res, next) {
    if ( !req.session.value || !loggedIn) {
        res.redirect('/start')
        return;
    }
    
    res.render('update', { });
});

router.post('/updated', function(req, res, next) {
    if ( !req.session.value || !loggedIn) {
        res.redirect('/start')
        return;
    }
    var contact = { 
        name : req.body.firstName + " " + req.body.lastName,
        address : req.body.street + ", " + req.body.city + ", " + req.body.states + " " + req.body.zip,
        phone : req.body.phone, email : req.body.email
    };
    if(req.body.checkAny || req.body.checkMail){
        contact.mail = "Yes"
    }
    else{
        contact.mail = "No"
    }
    contact.title = req.body.title;

    var id = req.body.contactId;
    var myquery = { _id: ObjectID(id) };

    var newvalues = { $set: {name: contact.name, address: contact.address, phone : contact.phone, email : contact.email, mail : contact.mail, title : contact.title } };
    contactList.updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
        console.log("1 document updated");
      });
    res.render('updated', {  });
});
router.get('/updated', function(req, res, next) {
    if ( !req.session.value || !loggedIn) {
        res.redirect('/start')
        return;
    }
    
    res.render('updated', { });
});

router.post('/delete', function(req, res, next) {
    if ( !req.session.value || !loggedIn) {
        res.redirect('/start')
        return;
    }

    var id = req.body.delContactId;
    console.log(id);
    
    var myquery = { _id: ObjectID(id) };
    contactList.deleteOne(myquery, function(err, obj) {
        if (err) throw err;
        console.log("1 element deleted");
    });
    
    //var a = contactList.find({ _id : id });
    //console.log(a);
    res.render('delete', { });
});
router.get('/delete', function(req, res, next) {
    if ( !req.session.value || !loggedIn) {
        res.redirect('/start')
        return;
    }
    
    res.render('delete', { });
});

module.exports = router;


function addContact(id, contact){
    contactList.updateOne( {_id:ObjectID(id)}, {'$push': {contacts : contact}});
}

function addAContact(contact){
    contactList.insertOne(contact);
    var user = contactList.findOne({name:contact.name});
    console.log(user);
}

function deleteContact(contact){
    var myquery = { name: 't t' };
    contactList.deleteOne(myquery, function(err, obj) {
        if (err) throw err;
        console.log("1 document deleted");
        //db.close();
    });
}

router.get('*', function(req, res){
    
    res.redirect('/start');
    return;
    
});