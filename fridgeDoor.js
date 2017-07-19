var express = require('express');
var exphbs  = require('express-handlebars');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var app = express();

const DataStore = require('nedb');
const db = new DataStore({filename: __dirname + '/noteDB', autoload: true});
var commonmark = require('commonmark');
var reader = new commonmark.Parser();
var writer = new commonmark.HtmlRenderer();
var sticky = {author: "", title: "", datetime: "", datetimeInt: "", content: ""};

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(express.static(__dirname + '/public'));

 
app.post('/note', urlencodedParser, function (req, res) {
    res.render('note', createHtmlMessage(req.body));
});

app.get('/', function(req, res){
	sortNotes(res);
});

app.get('/form', function(req, res){
	res.render('noteForm');	
});


app.get('/delete', function(req, res){	
	deleteNotes(res);	
});

app.post('/delete_notes', urlencodedParser, function(req, res){
let trash = Object.keys(req.body);
for(var i in trash)
	 {db.remove({"_id": trash[i]}, { multi: true }, 
    function (err, gone) {
        console.log("removed " + gone);
});}

res.redirect("/");
});


app.get('/note/:noteID', function(req, res){
	let id = req.params.noteID;
	db.find({"_id": id}, function(err, docs){
		if (err) {
        console.log("something is wrong");
    } else {
        res.render('note', docs[0]);}
	})
	
});
function createHtmlMessage(info) {
    sticky.author = info.user_author;
	sticky.title = info.user_title;
	
	let parsed = reader.parse(info.user_content);
	let message = writer.render(parsed);
	
	sticky.content = `${message}`;
	sticky.datetime = new Date();
	sticky.datetimeInt = sticky.datetime.valueOf();	
	storeNote(sticky);
	return sticky;
}

function sortNotes(app){
	db.find({}).sort({"datetimeInt": -1}).exec(function(err,docs){
			if (err) {
			console.log("something is wrong");
		} else {
			
			app.render('allNotes', {notes: docs});}	});
		
}



function storeNote(note){
	db.insert(note, function(err, Note) {
	if(err) {
		console.log("Something went wrong when writing");
		console.log(err);
	} else {
		console.log("Added " + Note.title + " docs");}});
}



function deleteNotes(app){
	db.find({}).sort({"datetimeInt": -1}).exec(function(err,docs){
			if (err) {
			console.log("something is wrong");
		} else {
			
			app.render('deleteForm', {notes: docs});}		});
		
}

app.listen(5555);