'use strict';
var watchr = require('watchr'),
	express = require('express.io'),
	fs = require('fs'),
	debugMode = 'debug',
	port = 1337,
	markdown = require('markdown').markdown

var app = express().http().io();
var client;
var fileList = ['test']

console.log('watching "files" folder for .md docs');
watchr.watch({
	paths: ['files'],
	listeners: {
		log: function(logLevel) {
			if (logLevel === debugMode) {
				// console.log('log:', arguments);
			}
		},
		watching: function(err, watcherInstance, isWatching) {
	       if (err) {
	            console.log("watching the path " + watcherInstance.path + " failed with error", err);
	        } else {
	            console.log("watching the path " + watcherInstance.path + " completed");
	        }
		},
		change: function(changeType, filePath, fileCurrentStat, filePreviousStat){
			console.log("change")
			switch (changeType) {
				case 'update':
					var file = fs.readFileSync(filePath, 'UTF8');
					client.io.emit('md_srv', markdown.toHTML(file));
					break;
				case 'create':
					console.log('create');
					break;
				case 'delete':
					console.log('delete');
					break;
				default:
					console.log('unexpected changeType');
					break;
			}
	    }
	}
})

app.use(app.router);

app.get('/', function(req, res) {
	res.send('you need to enter a file name after the base url');
});

app.get('/:fid', function(req, res) {
	res.sendfile(__dirname + '/internal/client.html');
	var id = req.params.fid;

	// look for file and send response with delay hax
	if (fileList.indexOf(id) === -1) {
		setTimeout(function(){ req.io.broadcast('md_srv', 'the file you\'re looking for doesn\'t exist') }, 3000);
	} else {
		setTimeout(function(){ req.io.broadcast('md_srv', "test") }, 3000);
	}
});

app.io.route('ready', function(req){
	client = req;
})

app.listen(port, '127.0.0.1');