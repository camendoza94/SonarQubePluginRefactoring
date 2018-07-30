var http = require('http'),
    httpProxy = require('http-proxy'),
    fs = require('fs');
var proxy = httpProxy.createProxyServer({});
var server = http.createServer(function(req, res) {
  //console.log(req.url);
  if (req.url === '/static/refactoring/architecture.js') {
    console.log("catching");
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    fs.readFile('C:/Users/Asistente/IdeaProjects/refactoring/target/classes/static/architecture.js', 'utf8', function (err,data) {
        if (err) {
          return console.log(err);
        }
        res.write(data);
        res.end();
    });
  } else {
    proxy.web(req, res, { target: 'http://localhost:9000' });
  }
});
console.log("listening on port 5050")
server.listen(5050);