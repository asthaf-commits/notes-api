const http = require("http");
const fs = require("fs");

const server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.end("Welcome to my Notes server");
  } else if (req.url === "/notes") {
    const data = fs.readFileSync("notes.json", "utf-8");
    res.setHeader("Content-Type", "application/json");
    res.end(data);
  } else {
    res.statusCode = 404;
    res.end("Page not found");
  }
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});