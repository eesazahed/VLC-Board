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
  [16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
];
let oldCanvas = pixelArray;

const verifyToken = async (idToken) => {
  // if missing ID token
  if (!idToken) {
    throw "Missing token";
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
  }

  return payload;
};

app.get("/", (req, res) => {
  res.render("board");
});

app.post("/", (req, res) => {
  verifyToken(req.body.token)
    .then((payload) => {
      res.send(payload);
    })
    .catch((err) => {
      res.status(405).send(err);
    });
});

app.post("/placepixel", async (req, res) => {
  let payload;
  try {
    payload = await verifyToken(req.body.token);
  } catch (err) {
    res.status(405).send(err);
  }

  pixelArray[req.body.selectedY][req.body.selectedX] = parseInt(
    req.body.selectedColor
  );
  io.emit('canvasUpdate', { pixelArray: pixelArray });
  
//   const cooldown = Date.now() + (Math.ceil(900 + (Math.random() * 300)) * 1000);
  const cooldown = Date.now() + 100000;

  res.send({ cooldown: cooldown });
});

io.on("connection", (socket) => {
  socket.emit('canvasUpdate', { pixelArray: pixelArray });
});

setInterval(() => {
    if (oldCanvas != pixelArray) {
        oldCanvas = pixelArray;
        io.emit('canvasUpdate', { pixelArray: oldCanvas });
    }
}, 1000);

server.listen(8080, () => {
  console.log("Listening on port 8080\nhttp://localhost:8080");
});
