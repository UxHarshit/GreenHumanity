const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const db = require('./db');
const {routes} = require('./routes');
const session = require('express-session');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));
app.use('/assets',express.static('assets'));
app.use('/admin',express.static(__dirname + '/node_modules'))
app.use('/admin',express.static(__dirname + '/public'))


app.use('/',session({
    name : 'basic',
    secret: 'AXLDPHT11J751PTBCFR2',
    resave: true,
    saveUninitialized: true
}));

db.connectToDatabase().then(() => {
    console.log('Connected to database');
    const server = http.createServer(app);
    routes(app);
    server.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`);
    });
    routes(app);
   
}
).catch((err) => {
    console.log(err);
});