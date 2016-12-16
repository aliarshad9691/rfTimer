var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var app = express();

var rpi433    = require('rpi-433'),
rfEmitter = rpi433.emitter({
  pin: 0,                     //Send through GPIO 0 (or Physical PIN 11)
  pulseLength: 350            //Send the code with a 350 pulse length
});

var sendCode = function (code){
	console.log("emmiting code");
	rfEmitter.sendCode(code, function(error, stdout) {   //Send 1234
	  if(!error) console.log(stdout); //Should display 1234
	  if(error) console.log(error);
	});
}

app.use('/', express.static('client'));
app.use('/js/', express.static('bower_components'));

app.listen(80, function(){
	console.log('listening on port 80!!');
});

var startTime, endTime, timeLeft, interval, timeout, duration;

duration = 300000;

io.on('connection', function(socket){
	console.log('a user connected');
	socket.on("start", function(){
		startTime = Date.now();
		endTime = startTime + duration;
		sendCode(12345);
		console.log("start device.");
		interval = setInterval(function(){
			timeLeft = endTime - Date.now();
			io.emit('update', timeLeft);
		}, 1000);

		timeout = setTimeout(function(){
			stopDevice();
		}, duration);
	});

	socket.on("stop", function(){
		stopDevice();
	});

	var stopDevice = function(){
		if(interval){
			clearInterval(interval);
			clearTimeout(timeout);
			sendCode(12345);
			console.log("stop device.");
			interval=null;
			io.emit('update', "0");
			io.emit('stop');	
		}
	}
});

http.listen(3000, function(){
  console.log('http listening on *:3000');
});