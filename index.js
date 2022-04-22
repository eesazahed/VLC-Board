const express = require("express");
const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(require('cookie-parser')());

const pixelArray = [
    [13, 16, 16, 16, 16, 16, 16, 16, 16, 16],
    [16, 16, 16, 16, 2, 16, 16, 16, 16, 16],
    [16, 2, 16, 16, 16, 16, 16, 16, 16, 16],
    [16, 2, 2, 2, 16, 2, 16, 16, 16, 16],
    [16, 2, 16, 2, 16, 2, 16, 16, 16, 16],
    [16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
    [16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
    [16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
    [16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
    [16, 16, 16, 16, 16, 16, 16, 16, 16, 16]
]

app.get("/", (req, res) => {
    if (req.cookies.token) {
        res.render("dashboard");
    } else {
        res.render("login");
    }
});

app.get("/board", (req, res) => {
    res.render("board", { pixelArray: JSON.stringify(pixelArray) });
});

app.listen(8080, () => {
    console.log("Listening on port 8080\nhttp://localhost:8080");
});
