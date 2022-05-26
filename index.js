const express = require("express");
const app = express();
const {
  OAuth2Client
} = require("google-auth-library");
const googleClient = new OAuth2Client(process.env["GOOGLE_SECRET"]);


app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());

const pixelArray = [
    [13, 16, 16, 16, 16, 16, 16, 16, 16, 16],
    [16, 16, 16, 16, 2, 16, 16, 16, 16, 16],
    [16, 2, 16, 16, 16, 16, 16, 16, 16, 16],
    [16, 2, 2, 2, 16, 2, 16, 16, 16, 16],
    [16, 2, 16, 2, 16, 13, 16, 16, 16, 16],
    [16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
    [16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
    [16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
    [16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
    [16, 16, 16, 16, 16, 16, 16, 16, 16, 16]
]

app.get("/", (req, res) => {
    res.render("board", { pixelArray: JSON.stringify(pixelArray) });
});

app.post("/", (req, res) => {
  // if missing ID token
  if (!req.body.token) { 
    res.statusCode = 405;
    return res.send("Missing token");
  }
  
  const verify = async () => {
    // verify legitimacy of ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: req.body.token,
      audience: process.env["GOOGLE_SECRET"],
    });

    // get user payload
    const payload = ticket.getPayload();
    if (payload.hd !== "virtuallearning.ca") {
      res.statusCode = 405;
      return res.send("You must sign in with your VLC (@virtuallearning.ca) account.");
    };

    res.send(payload);
  }

  verify(); // call async function
});


app.listen(8080, () => {
    console.log("Listening on port 8080\nhttp://localhost:8080");
});
