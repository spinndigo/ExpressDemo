var express = require('express');
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var app = express();

app.disable('x-powered-by');

app.engine('handlebars' , handlebars.engine);
app.set('view engine' , 'handlebars');

app.set('port' , process.env.PORT || 3000);
app.use(express.static(__dirname + '/public')); // use the public folder to serve content
app.use(require('body-parser').urlencoded({extended: true}));

var formidable = require('formidable');
var credentials = require('./credentials');

app.use(require('cookie-parser')(credentials.cookieSecret));

var session = require('express-session');
var parseurl = require('parseurl');
var fs = require('fs');

app.use(session({
    resave: false,     // only save to session store if a change is made
    saveUninitialized: true, // store if new, even if it has not been modified
    secret: credentials.cookieSecret
}));

// keep track of how many times the user has visited each url for this session
app.use(function(req, res, next){
    var views = req.session.views;
    if(!views){
        views = req.session.views = {};
    };
    var pathname = parseurl(req).pathname;
    views[pathname] = (views[pathname] || 0) + 1;
    next();
})

app.get('/' , function(req , res){
    res.render('home');
} );

app.get('/about' , function(_req , res) {
    res.render('about');
});

app.get('/readfile', function(req, res, next){
    fs.readFile('./public/randomtxt.txt', function(err, data){
        if(err) return console.error(err);
        res.send("the file: " + data.toString());
    });
})

app.get('/writefile' , function(req , res, next) {
    fs.writeFile('./public/randomfile2' , 'Additional random Text', function(err){
        if(err) console.error(err);
    });
});

app.get('/file-upload' , function(_req , res) {
    var now = new Date();

    res.render('file-upload', {year: now.getFullYear() , month: now.getMonth()});
});

app.post('/file-upload/:year/:month' , function(req , res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, file){
        if(err) res.redirect(303, '/error');
        console.log('Received File');
        console.log(file);
        res.redirect(303, '/thankyou');
    })
});

app.get('/contact' , function(_req , res) {
    res.render('contact', {csrf: ' csrf token here'});
});

app.post('/process' , function(req, res){
    console.log('Form ' + req.query.form );
    console.log('csrf token: ' , req.body._csrf);
    console.log('Email: ' , req.body.email);
    console.log('Question: ' + req.body.ques);
    res.redirect(303 , '/thankyou');
})

app.get('/thankyou' , function(_req , res) {
    res.render('thankyou');
});

app.get('/cookie' , function(req , res){
    res.cookie('username' , 'joe spin' , {expires: new Date() + 9999}).send('username has value : joe spin');
});

app.get('/listcookies' , function(req, res){
    console.log('cookies: ' , req.cookies);
    res.send('Check console');
});

app.get('/deletecookie' , function(req, res){
    res.clearCookie('username');
    res.send('Username cookie deleted');
});

app.get('/viewcount' , function(req, res, next){
    res.send('You viewed this page ' + req.session.views['/viewcount'] + ' times');
});


app.use(function(req, _res, next){
    console.log("Looking for url: " + req.url);
    next();
});

app.use(function(err, _req, _res, _next){
    console.log("Error: " + err.message);
})

app.use(function(_req, res){
    res.type('text/html');
    res.status(404);
    res.render('404');
})

app.use(function(err, req, res, next){
    res.status(500);
    res.render('500');
})

app.listen(app.get("port") ,function(){
    console.log("Express started, press Ctrl-C to terminate");
});