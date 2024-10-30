const express = require("express");
const app = express();
const mysql = require("mysql2");
const AWS = require("aws-sdk");
const http = require("http").Server(app);
const cors = require("cors");
const os = require('os'); 

const hostname = os.hostname();console.log(`Hostname: ${hostname}`); 

const PORT = process.env.PORT || 4000;


app.use(cors());
app.use(express.json());
require("dotenv").config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST_NAME,
  user: process.env.DB_USER_NAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// AWS.config.update({
//   accessKeyId: process.env.ACCESS_KEY_ID,
//   secretAccessKey: process.env.SECRET_ACCESS_KEY,
//   sessionToken: process.env.SESSION_TOKEN,
//   region: process.env.REGION,
// });

AWS.config.update({
    region: process.env.REGION,
  });

const cognito = new AWS.CognitoIdentityServiceProvider({
  region: process.env.REGION,
});

const sns = new AWS.SNS();
const roomSocketsMap = new Map();

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to database: ", err);
    return;
  }
  console.log("Connected to RDS database in private subnet");

  const createTableQuery =
    "CREATE TABLE IF NOT EXISTS room_codes (roomId VARCHAR(10) NOT NULL, codeValue TEXT NOT NULL)";
  connection.query(createTableQuery, (err, results) => {
    if (err) {
      console.error("Error creating table: ", err);
      return;
    }
    console.log("Table room_codes created successfully");
  });

  const createCommentTableQuery =
    "CREATE TABLE IF NOT EXISTS room_comments (roomId VARCHAR(10) NOT NULL, useremail VARCHAR(255) NOT NULL, username VARCHAR(255) NOT NULL, codeValue VARCHAR(255) NOT NULL, comment VARCHAR(255) NOT NULL)";
  connection.query(createCommentTableQuery, (err, results) => {
    if (err) {
      console.error("Error creating table: ", err);
      return;
    }
    console.log("Table room_comments created successfully");
  });
});

const createUserMappingTableQuery =
  "CREATE TABLE IF NOT EXISTS room_users (roomId VARCHAR(10) NOT NULL, useremail VARCHAR(255) NOT NULL)";
connection.query(createUserMappingTableQuery, (err, results) => {
  if (err) {
    console.error("Error creating table: ", err);
    return;
  }
  console.log("Table room_users created successfully");
});

const io = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});

app.get("/", (req, res) => {
  res.status(200).send("Server is up and running.! and hostname: " + hostname);
});

app.post("/signup", async (req, res) => {
  // console.log("User request:", req);

  const { email, password } = req.body;

  const params = {
    ClientId: process.env.CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: [
      {
        Name: "email",
        Value: email,
      },
    ],
  };

  try {
    const data = await cognito.signUp(params).promise();
    res
      .status(200)
      .json({
        result: "success",
        message: "User signed up successfully",
        data,
      });
  } catch (err) {
    res.status(500).json({ result: "failure", error: err.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const params = {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: process.env.CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  };

  try {
    const data = await cognito.initiateAuth(params).promise();
    res.status(200).json({
      result: "success",
      message: "User logged in successfully",
      token: data.AuthenticationResult.AccessToken,
    });
  } catch (err) {
    res.status(500).json({ result: "failure", error: err.message });
  }
});

app.post("/addUser", async (req, res) => {
  const { email, roomId } = req.body;

  const insertQuery =
    "INSERT INTO room_users (roomId, useremail) VALUES (?, ?)";
  connection.query(insertQuery, [roomId, email], (err, results) => {
    if (err) {
      console.error("Error inserting code into AWS RDS:", err);
      res.status(500).json({
        result: "failure",
        message: "Unable to add user",
      });
    }
    res.status(200).json({
      result: "success",
      message: "User added successfully",
    });
    console.log("User inserted into room_users in AWS RDS");
  });
});

app.post("/validateUser", async (req, res) => {
  const { email, roomId } = req.body;
  // console.log("validateUser request:", email, roomId);
  const query = "SELECT count(*) as count FROM room_users WHERE roomId = ? AND useremail = ?";
  connection.query(query, [roomId, email], (err, results) => {
    if (err) {
      console.error("No user found for this room", err);
      res.status(500).json({
        result: "failure",
        message: "Something went wrong",
      });
    }
    console.log("results for validateUser", results);
    const connectionExists = results[0].count > 0;
    if(connectionExists){
      res.status(200).json({
          result: "success",
          message: "User is a member of this room",
        });
        console.log("User inserted into room_users in AWS RDS");
    }else{
      res.status(200).json({
        result: "failure",
        message: "Your are not a member of this room",
      });
    }
  });
});

function getUniqueUsers(usersList) {
  const uniqueUsers = new Set();

  // Use filter to remove duplicates
  return usersList.filter(user => {
    const identifier = `${user.username}-${user.useremail}`;
    if (uniqueUsers.has(identifier)) {
      return false; 
    }
    uniqueUsers.add(identifier); 
    return true; 
  });
}

io.on("connection", (socket) => {
  console.log("New WebSocket connection:", socket.id);

  socket.on("joinRoom", (data) => {
    console.log(`Socket ${socket.id} joined room ${data.roomId}`);
    const roomId = data.roomId;

    const userSocketObj = {
      socketData: socket,
      ...data,
    };

    if (!roomSocketsMap.has(roomId)) {
      const query = "SELECT codeValue FROM room_codes WHERE roomId = ?";
      connection.query(query, [data.roomId], (err, results) => {
        if (err) {
          console.error("Error retrieving code from AWS RDS:", err);
          return;
        }
        if (results.length > 0) {
          // Emit code to the user
          const codeContent = results[0].codeValue;
          // console.log("Code retrieved from AWS RDS:", codeContent);
          socket.emit("codeUpdate", {
            useremail: "",
            codeContent: codeContent,
          });
        }
      });
      roomSocketsMap.set(roomId, new Set());
    }
    roomSocketsMap.get(roomId).add(userSocketObj);
    const socketsInRoom = roomSocketsMap.get(roomId);

    const users = Array.from(socketsInRoom).map((user) => ({
      username: user.username,
      useremail: user.useremail,
    }));

    const uniqueUsers = getUniqueUsers(users);
    if (socketsInRoom) {
      for (const roomSocket of socketsInRoom) {
        if (roomSocket.id !== socket.id) {
          roomSocket.socketData.emit("userJoin", { userslist: uniqueUsers });
        }
      }
    }
  });

  socket.on("sendCode", (data) => {
    // Broadcast the code message to all sockets in the same room
    const roomId = data.roomId;
    const socketsInRoom = roomSocketsMap.get(roomId);

    if (socketsInRoom) {
      for (const roomSocket of socketsInRoom) {
        if (roomSocket.socketData.id !== socket.id) {
          roomSocket.socketData.emit("codeUpdate", {
            useremail: data.useremail,
            codeContent: data.codeContent,
          });
        }
      }
    }
  });

  // Handle disconnection
  socket.on("leaveRoom", (data) => {
    const currRoomId = data.roomId;
    const codeContent = data.codeContent;
    console.log("Socket disconnected", socket.id, currRoomId, codeContent);
    // Check if the room ID exists in the database
    const checkQuery =
      "SELECT COUNT(*) AS count FROM room_codes WHERE roomId = ?";
    connection.query(checkQuery, [currRoomId], (err, results) => {
      if (err) {
        console.error("Error checking room ID:", err);
        return;
      }
      const roomExists = results[0].count > 0;

      // Perform insert or update based on whether the room exists
      if (roomExists) {
        // Update existing entry for the room ID
        const updateQuery =
          "UPDATE room_codes SET codeValue = ? WHERE roomId = ?";
        connection.query(
          updateQuery,
          [codeContent, currRoomId],
          (err, results) => {
            if (err) {
              console.error("Error updating code in AWS RDS:", err);
              return;
            }
            console.log("Code updated in AWS RDS");
          }
        );
      } else {
        // Insert new entry for the room ID
        const insertQuery =
          "INSERT INTO room_codes (roomId, codeValue) VALUES (?, ?)";
        connection.query(
          insertQuery,
          [currRoomId, codeContent],
          (err, results) => {
            if (err) {
              console.error("Error inserting code into AWS RDS:", err);
              return;
            }
            console.log("Code inserted into AWS RDS");
          }
        );
      }
    });

    const socketsInRoom = roomSocketsMap.get(currRoomId);
    // Remove the disconnected socket from the roomSocketsMap
    if (socketsInRoom) {
      for (const userSocketObj of socketsInRoom) {
        if (userSocketObj.socketData.id === socket.id) {
          socketsInRoom.delete(userSocketObj);
          if (socketsInRoom.size === 0) {
            roomSocketsMap.delete(currRoomId);
          } else {
            // Emit userJoin event to other sockets in the room
            const users = Array.from(socketsInRoom).map((user) => ({
              username: user.username,
              useremail: user.useremail,
            }));

            const uniqueUsers = getUniqueUsers(users);
            

            for (const roomSocket of socketsInRoom) {
              if (roomSocket.id !== socket.id) {
                roomSocket.socketData.emit("userJoin", { userslist: uniqueUsers });
              }
            }
          }
          break; // Exit loop after finding and removing the disconnected socket
        }
      }
    }
  });

  socket.on("subscribeToComments", (data) => {
    subscribeToTopicWithFiltering(data.useremail, data.roomId);
  });

  socket.on("addComment", (data) => {
    const insertQuery =
      "INSERT INTO room_comments (roomId,useremail,username,codeValue,comment) VALUES (?, ?, ?, ?, ?)";

    connection.query(
      insertQuery,
      [
        data.roomId,
        data.useremail,
        data.username,
        data.codeContent,
        data.comment,
      ],
      (err, results) => {
        if (err) {
          console.error("Error inserting code into AWS RDS:", err);

          return;
        }
        console.log("Comment inserted into AWS RDS");
        publishMessageToTopic(
          data.roomId,
          data.useremail,
          data.username,
          data.codeContent,
          data.comment
        );
      }
    );

    const selectQuery = "SELECT * FROM room_comments WHERE roomId = ?";
    connection.query(selectQuery, [data.roomId], (err, results) => {
      if (err) {
        console.error("Error retrieving code from AWS RDS:", err);
        return;
      }
      console.log("Comments retrieved from AWS RDS", results);
      commentsForRoom = [];
      for (const comment of results) {
        commentsForRoom.push({
          useremail: comment.useremail,
          username: comment.username,
          codeValue: comment.codeValue,
          comment: comment.comment,
        });
      }
      console.log("commentsForRoom", commentsForRoom);
      const socketsInRoom = roomSocketsMap.get(data.roomId);

      if (socketsInRoom) {
        for (const roomSocket of socketsInRoom) {
          console.log(
            "sendding comments",
            roomSocket.socketData.id,
            data.roomId
          );
          roomSocket.socketData.emit("commentsUpdate", {
            commentslist: commentsForRoom,
          });
        }
      }
    });
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

//   const PORT = process.env.PORT || 4000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Function to subscribe a user to the SNS topic with filtering criteria
async function subscribeToTopicWithFiltering(useremail, roomId) {
  try {
    // Specify the filtering criteria based on room ID
    const filteringPolicy = {
      room_id: [roomId],
    };

    // Subscribe the user to the SNS topic with the filtering policy
    const subscriptionParams = {
      Protocol: "email",
      TopicArn: process.env.TOPIC_ARN,
      Endpoint: useremail,
      Attributes: {
        FilterPolicy: JSON.stringify(filteringPolicy),
      },
    };

    // Subscribe the user to the topic
    const subscriptionResult = await sns
      .subscribe(subscriptionParams)
      .promise();
    console.log("Subscription ARN:", subscriptionResult.SubscriptionArn);
  } catch (error) {
    console.error("Error subscribing user to topic:", error);
  }
}

// Function to publish a message to the common SNS topic with a room ID attribute
async function publishMessageToTopic(
  roomId,
  useremail,
  username,
  codeValue,
  comment
) {
  const message =
    "Hi There! Message for roomId: " +
    roomId +
    "\n username: " +
    username +
    " added a comment on code: " +
    codeValue +
    "\n comment: " +
    comment;
  try {
    // Publish message to the common SNS topic
    const publishParams = {
      Message: message, // Message content
      TopicArn: process.env.TOPIC_ARN, // ARN of the common SNS topic
      MessageAttributes: {
        room_id: {
          DataType: "String",
          StringValue: roomId,
        },
      },
    };

    // Publish the message to the topic
    const publishResult = await sns.publish(publishParams).promise();
    console.log("Message published:", publishResult.MessageId);
  } catch (error) {
    console.error("Error publishing message to topic:", error);
  }
}
