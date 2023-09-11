var express = require('express');
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var app = express();

app.disable('x-powered-by');

app.engine('handlebars' , handlebars.engine);
app.set('view engine' , 'handlebars');

app.set('port' , process.env.PORT || 3000);
app.use(express.static(__dirname + '/public')); // use the public folder to serve content

app.get('/' , function(req , res){
    res.render('home');
} );

app.get('/about' , function(req , res) {
    res.render('about');
});

app.listen(app.get("port") ,function(){
    console.log("Express started, press Ctrl-C to terminate");
});