// Load .env
const dotenv = require("dotenv");
dotenv.config();

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
const { MongoClient, ServerApiVersion } = require("mongodb");
const client = new MongoClient(process.env["MONGO_URI"], {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
let pixelArray, boardCollection;
const usersCollection = client.db("board").collection("users");

client.connect(async (err) => {
  if (err) {
    console.log(err);
  }

  boardCollection = client.db("board").collection("pixels");

  const board = await boardCollection.findOne({ _id: "latestBoard" });
  try {
    pixelArray = board.pixelArray;
  } catch (err) {
    pixelArray = Array(500).fill(Array(500).fill(16));
    await boardCollection.updateOne(
      { _id: "latestBoard" },
      { $set: { _id: "latestBoard", pixelArray } },
      { upsert: true }
    );
  }
});

const verifyToken = async (idToken) => {
  // if missing ID token
  if (!idToken) {
    throw "Missing Google ID token";
  }

  // verify legitimacy of ID token
  const ticket = await googleClient.verifyIdToken({
    idToken: idToken,
    audience: process.env["GOOGLE_CLIENT_ID"],
  });

  // get user payload
  const payload = ticket.getPayload();

  if (payload.hd !== "virtuallearning.ca" && payload.hd !== "tldsb.on.ca") {
    throw "You must sign in with your VLC (@virtuallearning.ca or @tldsb.on.ca) account.";
  } else if (payload.aud !== process.env["GOOGLE_CLIENT_ID"]) {
    throw "Invalid Client ID: " + payload.aud;
  }

  return payload;
};

app.get("/", (req, res) => {
  res.render("board", { googleClientId: process.env["GOOGLE_CLIENT_ID"] });
});

app.post("/", async (req, res) => {
  let userPayload;

  try {
    userPayload = await verifyToken(req.body.token);
  } catch (err) {
    return res.status(405).send(err);
  }

  const user = await usersCollection.findOne({ _id: userPayload.sub });
  let cooldown;

  if (user) {
    cooldown = user.cooldown;
  } else {
    cooldown = Date.now();
    usersCollection.insertOne({
      _id: userPayload.sub,
      name: userPayload.name,
      cooldown: cooldown,
    });
  }

  res.send({ cooldown: cooldown });
});

app.post("/placepixel", async (req, res) => {
  let userPayload;

  try {
    userPayload = await verifyToken(req.body.token);
  } catch (err) {
    return res.status(405).send(err);
  }

  const user = await usersCollection.findOne({ _id: userPayload.sub });
  let cooldown;

  if (user) {
    cooldown = user.cooldown;
  } else {
    return res.status(405).send("Not a registered user!");
  }

  if (cooldown < Date.now()) {
    try {
      pixelArray[req.body.selectedY][req.body.selectedX] = parseInt(
        req.body.selectedColor
      );
    } catch (err) {
      return res.sendStatus(403);
    }

    io.emit("pixelUpdate", {
      x: req.body.selectedX,
      y: req.body.selectedY,
      color: req.body.selectedColor,
      pixelArray: pixelArray,
    });
    const cooldown = Date.now() + 15000;
    await usersCollection.updateOne(
      { _id: userPayload.sub },
      { $set: { cooldown: cooldown } }
    );
    res.send({ cooldown: cooldown });
  } else {
    return res.status(403).send({ cooldown: cooldown });
  }
});

app.get("/about", (req, res) => {
  res.redirect("https://en.wikipedia.org/wiki/R/place");
});

const sendPixelArray = (socket) => {
  if (typeof pixelArray !== "undefined") {
    if (socket) {
      socket.emit("canvasUpdate", { pixelArray: pixelArray });
    }
  } else {
    setTimeout(sendPixelArray, 250);
  }
};

io.on("connection", sendPixelArray);

setInterval(() => {
  if (pixelArray) {
    boardCollection.updateOne({ _id: "latestBoard" }, { $set: { pixelArray } });
  }
}, 5000);

server.listen(8080, () => {
  console.log("Listening on port 8080\nhttp://localhost:8080");
});
