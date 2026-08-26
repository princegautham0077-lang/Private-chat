const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();

const server = http.createServer(app);

const wss = new WebSocket.Server({
  server
});


/* Test route */

app.get("/", (req, res) => {

  res.send("Private Chat Server is running!");

});


/* Connected users */

const users = new Map();


/* WebSocket connection */

wss.on("connection", (socket) => {

  console.log("A device connected");


  socket.on("message", (data) => {

    try {

      const message =
        JSON.parse(data.toString());


      /*
       * For now this server only
       * forwards messages.
       *
       * Encryption will be added
       * in the next stage.
       */


      if (message.type === "login") {

        users.set(
          message.username,
          socket
        );

        socket.username =
          message.username;

        socket.send(
          JSON.stringify({
            type: "login_success",
            username: message.username
          })
        );

        return;
      }


      if (message.type === "chat") {

        const recipient =
          users.get(message.to);


        if (
          recipient &&
          recipient.readyState ===
          WebSocket.OPEN
        ) {

          recipient.send(
            JSON.stringify(message)
          );

        }

      }

    } catch (error) {

      console.log(
        "Invalid message received"
      );

    }

  });


  socket.on("close", () => {

    if (socket.username) {

      users.delete(
        socket.username
      );

    }

    console.log(
      "A device disconnected"
    );

  });

});


/* Start server */

const PORT =
  process.env.PORT || 3000;


server.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );

});
