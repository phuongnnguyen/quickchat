const express = require("express");

const app = express();
let server = require("http").Server(app);

const log = console.log.bind(this);

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("public"));

app.get("/", (req, res) => res.render("index"))

let io = require("socket.io")(server);

let users = [];
let rooms = [];
let chatroom = "";

io.on("connection", socket => {
    log("Co nguoi ke noi. ID: " + socket.id);

    // Add user
    socket.on("user-login-request", username => {
        if(users.indexOf(username) >= 0 || username == "")
            socket.emit("invalid-username");
        else {
            users.push(username);   
            socket.userName = username;
            socket.emit("valid-username");
        }
    });
    // Create rooms
    socket.on("user-create-room", (roomName, password) => {
        if(rooms.indexOf(roomName) == -1) {
            rooms.push(roomName);
        }
        chatroom = roomName+"-"+password;
        socket.chatRoom = chatroom;
        socket.roomName = roomName;
        socket.join(chatroom);
        socket.emit("user-join-room", chatroom);
    })
    // Chat zone
    socket.on("user-send-message", msg => {
        socket.broadcast.in(socket.chatRoom).emit("message-to-all", msg, socket.userName);
        socket.emit("message-to-me", msg, socket.userName);
    })
    // get list of users
    socket.on("get-list-of-user", () => {
        io.sockets.emit("server-send-users", users, socket.userName);
    })
    // leave room
    socket.on("user-leave-room", () => {
        socket.leave(socket.chatroom);
        if(users.indexOf(socket.userName) != -1)
            users.splice(users.indexOf(socket.userName), 1);
        else return;
        io.sockets.emit("server-send-users", users);
    });
    // typing or not
    socket.on("user-is-typing", () => socket.broadcast.in(socket.chatRoom).emit("user-typing", socket.userName));
    socket.on("user-is-stop-typing", () => socket.broadcast.in(socket.chatRoom).emit("user-stop-typing"));

})
server.listen(process.env.PORT || 3000);
