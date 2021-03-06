const express = require("express");
const path = require("path");

const app = express();

// Init Middleware
app.use(express.json({ extended: false }));

// Define Routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/projects", require("./routes/api/projects"));

// Server static asses in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("client/build"));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"))
  );
}

// Node connection
const hostname = "0.0.0.0";
const PORT = process.env.PORT || 5000;

app.listen(PORT, hostname, () => {
  console.log(`Listening on ${hostname} 
Waiting for connections on ${PORT} 
Server started.`);
});
