/*jshint node:true*/
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var favicon = require('serve-favicon');
var methodOverride = require('method-override');
var logger = require('morgan');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

app.set('port', process.env.VCAP_APP_PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//app.use(express.favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(methodOverride());
app.use('/', routes);
app.use(express.static(path.join(__dirname, 'public')));

// Handle Errors gracefully
app.use(function(err, req, res, next) {
	if(!err) return next();
	console.log(err.stack);
	res.json({error: true});
});

// Main App Page
//app.get('/', routes.index);
app.use('/', routes);

// MongoDB API Routes
//app.get('/polls/polls', routes.list);
//app.get('/polls/:id', routes.poll);
//app.post('/polls', routes.create);
//app.post('/vote', routes.vote);

io.sockets.on('connection', function(socket) {
  socket.on('send:vote', function(data) {
    var ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address.address;
    
    Poll.findById(data.poll_id, function(err, poll) {
      var choice = poll.choices.id(data.choice);
      choice.votes.push({ ip: ip });
      
      poll.save(function(err, doc) {
        var theDoc = { 
          question: doc.question, _id: doc._id, choices: doc.choices, 
          userVoted: false, totalVotes: 0 
        };

        // Loop through poll choices to determine if user has voted
        // on this poll, and if so, what they selected
        for(var i = 0, ln = doc.choices.length; i < ln; i++) {
          var choice = doc.choices[i]; 

          for(var j = 0, jLn = choice.votes.length; j < jLn; j++) {
            var vote = choice.votes[j];
            theDoc.totalVotes++;
            theDoc.ip = ip;

            if(vote.ip === ip) {
              theDoc.userVoted = true;
              theDoc.userChoice = { _id: choice._id, text: choice.text };
            }
          }
        }
        
        socket.emit('myvote', theDoc);
        socket.broadcast.emit('vote', theDoc);
      });     
    });
  });
});

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
