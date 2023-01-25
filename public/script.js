const socket = io("http://localhost:8000");
const data = JSON.parse(localStorage.getItem("daaguData"));
const form = document.getElementById("message-form");
const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("message-input");
const roomState = document.getElementById("room-state");
const usersListDiv = document.getElementById("users");
const sidebarUsersList = document.getElementById("users-sidebar");
const humberger = document.getElementById("humberger");
const backdrop = document.getElementById("backdrop");
const sideDrawer = document.getElementById("side-drawer");
let sessionId;
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = {
    text: e.target["message-input"].value,
    sender: sessionId,
    username: data.username,
  };
  socket.emit("chat-message", message);
  e.target["message-input"].value = "";
});

socket.emit("join-room", data);
socket.on("join-done", (data) => {
  document.getElementById("room-name").innerHTML = data.room;
  sessionId = data.id;
  insertMessage({
    username: "Admin-Bot",
    text: `Welcome to ${data.room} group`,
  });
});

socket.on("user-join", (user) => {
  insertMessage({
    username: "Admin-Bot",
    text: `${user} has  joined the Group`,
  });
});

socket.on("user-left", (user) => {
  insertMessage({
    username: "Admin-Bot",
    text: `${user} has  left the Group`,
  });
});

socket.on("room-mates", (mates) => {
  usersListDiv.innerHTML = "";
  mates.map((mate) => {
    const div = document.createElement("div");
    div.className = "rooms";
    div.innerHTML = `<p> ${mate.username} </p>`;
    usersListDiv.appendChild(div);
  });
});

socket.on("room-mates", (mates) => {
  sidebarUsersList.innerHTML = "";
  mates.map((mate) => {
    const div = document.createElement("div");
    div.innerHTML = `<p> ${mate.username} </p>`;
    sidebarUsersList.appendChild(div);
  });
});

socket.on("receive-message", (message) => {
  insertMessage(message);
});

socket.on("user-typing", (users) => {
  if (!users || users.length === 0) {
    return (roomState.innerHTML = "");
  }
  if (users.length === 1) {
    return (roomState.innerHTML = `${users[0]} is typing .....`);
  }
  const usersString = users.toLocaleString();
  roomState.innerHTML = `${usersString} are typing .....`;
});

messageInput.addEventListener("input", () => {
  socket.emit("typing");
});

messageInput.addEventListener("focusout", () => {
  socket.emit("stopped-typing");
});
humberger.addEventListener("click", () => {
  backdrop.style.display = "block";
  sideDrawer.style.transform = "translateX(0%)";
});
backdrop.addEventListener("click", () => {
  backdrop.style.display = "none";
  sideDrawer.style.transform = "translateX(100%)";
});
const insertMessage = (message) => {
  const messagesContainer = document.getElementById("messages");
  const state = message.sender === sessionId ? "sent" : "received";
  const messageDiv = `
  <div class="message">
  <small class="user">${message.username}</small>
  <hr />
                  <p class="message-text">
                   ${message.text}
                   </p>
                   </div>
                   `;
  const messageArea = document.createElement("div");
  messageArea.className = ` message-area ${state} `;
  messageArea.innerHTML = messageDiv;
  messagesContainer.appendChild(messageArea);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
};
