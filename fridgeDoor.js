
var express = require('express');
var app = express();
app.use(express.static('public'));
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })

//handlebars variables
var fs = require('fs');
var handlebars = require('handlebars');
var source = fs.readFileSync("notes.handlebars", 'utf8');
var template = handlebars.compile(source);
var context = {author: "", title: "", datetime: "", content: ""};

app.post('/note_form', urlencodedParser, function(req, res) {
    res.send(createHtmlMessage(req.body));
});

function createHtmlMessage(info) {
    context.author = info.user_author;
	context.title = info.user_title;
	context.content = info.user_content;
	context.datetime = 	new Date();
	return template(context);
}

const host = '127.0.0.1';
const port = '5555';
app.listen(port, host, function () {
    console.log("fridgeDoor.js app listening on IPv4: " + host +
	":" + port);
});
