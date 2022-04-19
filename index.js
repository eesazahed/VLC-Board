const express = require("express");

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));

const pixelArray = [
    [16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
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
    res.render("index", {pixelArray: JSON.stringify(pixelArray)});
});

app.listen(8080, () => {
    console.log("Listening on port 8080\nhttp://localhost:8080");
});
