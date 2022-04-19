const express = require("express");

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index");
});

app.listen(8080, () => {
    console.log("Listening on port 8080\nhttp://localhost:8080");
});
