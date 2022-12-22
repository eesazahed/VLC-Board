// MongoDB
const { MongoClient, ServerApiVersion } = require("mongodb");
const client = new MongoClient(process.env["MONGO_URI"], {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const client2 = new MongoClient(process.env["MONGO_URI2"], {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

client.connect(async (err) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  const usersCollection = client.db("board").collection("users");
  boardCollection = client.db("board").collection("pixels");

  await usersCollection.deleteMany({});
  await boardCollection.updateOne(
    { _id: "latestBoard" },
    {
      $set: {
        _id: "latestBoard",
        pixelArray: Array(50).fill(Array(50).fill(32)),
      },
    },
    { upsert: true }
  );

  client.close();
});

client2.connect(async (err) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  const placedCollection = client2.db("board").collection("placed");
  await placedCollection.deleteMany({});

  client2.close();
});
