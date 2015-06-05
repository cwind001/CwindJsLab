var http = require("http");
var url = require("url");

function start(route, handle){

	var onRequest = function(request, response){
		var pathname = url.parse(request.url).pathname
		console.log("Request" + pathname+ " received.");
		route(handle, pathname, response, request);
	}

	http.createServer(onRequest).listen(8888);

	console.log("Server has started.");
}

exports.start = start;