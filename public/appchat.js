var socket = io("https://quickchats.herokuapp.com/");
function refresh() {
    socket.emit("user-leave-room");
    $("#loginForm").show();
    $("#chatRoom").hide();
    $("#roomName").val("");
    $("#roomPassword").val("");
    $("#username").val("");
    $("#messages").empty();
}

function autoFill(social) {
    let rnd = ~~(Math.random() * (200 - 1)) + 1;
    if(social === "fb")
        $("#username").val(rnd+".facebook");
    else if(social === "gg")
        $("#username").val(rnd+".google");
    else $("#username").val(rnd+".twitter");
}
function sendMsg() {
    if($("#userMsg").val() == "")
        return;
    socket.emit("user-send-message", $("#userMsg").val());
    $("#userMsg").val("");
    $("#messages").stop().animate({ scrollTop: $("#messages")[0].scrollHeight}, 1000);
    $("#userMsg").trigger("blur");
}


socket.on("invalid-username", () => alert("username không hợp lệ"));
socket.on("valid-username", () => {
    $("#loginForm").hide();
    $("#roomList").show();
});

socket.on("user-join-room", roomName => {
    $("#roomList").hide();
    $("#roomChatName").text(`Room name:  ${roomName}`);
})
socket.on("message-to-all", (msg, userName) => {
    $("#messages").append(
        `<div class="w3-round-xlarge w3-card-2 w3-hover-sepia" style="margin:20px; word-wrap: break-word">
            <span class="w3-section w3-small w3-text-red">${userName}</span>
            <p>${msg}</p>
            <span class="w3-section w3-small w3-right w3-text-black">${new Date().toLocaleTimeString()}</span>
        </div>`)
})
socket.on("message-to-me", (msg, userName) => {
    $("#messages").append(
        `<div class="w3-round-xlarge w3-black w3-card-2 w3-hover-sepia" style=" margin:20px 20px 20px auto ;word-wrap: break-word">
            <span class="w3-section w3-small w3-text-red">${userName}: </span>
            <p>${msg}</p>
            <span class="w3-section w3-small w3-right w3-text-black">${new Date().toLocaleTimeString()}</span>
        </div>`)
})
socket.on("server-send-users", users => {
    $("#userList").html("");
    users.map(user => $("#userList").append(`<div class="w3-border-bottom w3-padding">${user}</div>`))
})
window.onbeforeunload = function (evt) {
    refresh();
}
// typing or not
socket.on("user-typing", userName => {
    $("#typing").show();
    $("#typing").text(`${userName} is typing...`)
});
socket.on("user-stop-typing", () => {
    console.log("Hello")
    $("#typing").hide();
});
socket.on("msgClient", msg => alert(msg))
$(document).ready(() => {
    $("#typing").hide();
    $("#loginForm").show();
    $("#roomList").hide();
    $("#chatRoom").hide();
    $("#fbAccount").click(() => autoFill("fb"));
    $("#googleAccount").click(() => autoFill("gg"));
    $("#twitterAccount").click(() => autoFill("t"));
    $("#GetRooms").click(() => socket.emit("user-get-rooms-request"));
    
    $("#toggleList").click(() => {
        $("#userList").toggle();
        socket.emit("get-list-of-user");
    });

    $("#loginBtn").click(() => socket.emit("user-login-request", $("#username").val() ));

    $("#createRoom").click(() => {
        if($("#roomName").val() === "" || $("#roomPassword").val() === "")
            alert("Tên phòng và password không được để trống");
        else{
            socket.emit("user-create-room", $("#roomName").val(), $("#roomPassword").val() );
            socket.emit("get-list-of-user");
            $("#roomList").hide();
            $("#chatRoom").show();
        }
    });
    // user is typing ? 
    $("#userMsg").focusin(() => socket.emit("user-is-typing"));
    $("#userMsg").focusout(() => socket.emit("user-is-stop-typing"));
    // Send message
    $("#sendMsg").on("click", () => sendMsg());
    $("#userMsg").on("keypress", e => {
        if(e.keyCode == 13)
            sendMsg();
    })

    $("#get-users").click(() => {
        socket.emit("user-get-list-request");
    })
    $("#leaveRoom").click(() => {
        refresh();
    })
})


 