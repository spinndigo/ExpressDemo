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

app.get('/' , function(req , res){
    res.render('home');
} );

app.get('/about' , function(_req , res) {
    res.render('about');
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

app.use(function(req, _res, next){
    console.log("Looking for url: " + req.url);
    next();
});

app.use(function(err, _req, _res, _next){
    console.log("Error: " + err.message);
})

app.use(function(req, res){
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