// Load .env
const dotenv = require("dotenv")
dotenv.config()

// Express
const express = require("express");
const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());

// Socket
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// Gapi
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env["GOOGLE_SECRET"]);

// MongoDB
const { MongoClient, ServerApiVersion } = require('mongodb');
const client = new MongoClient(process.env["MONGO_URL"], { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
    if (err) {
        console.log(err);
    };
});

const usersCollection = client.db("board").collection("users");

const pixelArray = [
  [16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
  [16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
  [16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
  [16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
  [16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
  [16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
  [16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
  [16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
  [16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
  [16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
];
let oldCanvas = JSON.stringify(pixelArray);

const verifyToken = async (idToken) => {
  // if missing ID token
  if (!idToken) {
    throw "Missing Google ID token";
  }

  // verify legitimacy of ID token
  const ticket = await googleClient.verifyIdToken({
    idToken: idToken,
    audience: process.env["GOOGLE_SECRET"],
  });

  // get user payload
  const payload = ticket.getPayload();
  if (payload.hd !== "virtuallearning.ca") {
    throw "You must sign in with your VLC (@virtuallearning.ca) account.";
  } else if (payload.aud !== process.env["GOOGLE_SECRET"]) {
    throw "Invalid Client ID: " + payload.aud;
  };

  return payload.sub;
};

app.get("/", (req, res) => {
  res.render("board");
});

app.post("/", async (req, res) => {
    let userId;
    
    try {
        userId = await verifyToken(req.body.token);
    } catch (err) {
        return res.status(405).send(err);
    };

    const user = await usersCollection.findOne({id: userId});
    let cooldown;

    if (user) {
      cooldown = user.cooldown;
    } else {
      cooldown = Date.now();
      await usersCollection.insertOne({id: userId, cooldown: cooldown});
    }

    res.send({ cooldown: cooldown });
});

app.post("/placepixel", async (req, res) => {
  let userId;
  try {
    userId = await verifyToken(req.body.token);
  } catch (err) {
    return res.status(405).send(err);
  }

  const user = await usersCollection.findOne({id: userId});
  let cooldown;

  if (user) {
    cooldown = user.cooldown;
  } else {
    return res.status(405).send("Not a registered user!");
  };

  if (cooldown < Date.now()) {
    pixelArray[req.body.selectedY][req.body.selectedX] = parseInt(
      req.body.selectedColor
    );
  
    io.emit('pixelUpdate', { x: req.body.selectedX, y: req.body.selectedY, color: req.body.selectedColor, pixelArray: pixelArray });

//   const cooldown = Date.now() + (Math.ceil(900 + (Math.random() * 300)) * 1000);
    const cooldown = Date.now() + 100000;
    await usersCollection.updateOne({id: userId}, {$set: {id: userId, cooldown: cooldown}});
    res.send({ cooldown: cooldown });
  } else {
    return res.status(403).send({cooldown: cooldown});
  }
});

io.on("connection", socket => {
  socket.emit('canvasUpdate', { pixelArray: pixelArray });
});

server.listen(8080, () => {
  console.log("Listening on port 8080\nhttp://localhost:8080");
});
