import { io } from "socket.io-client";

const projectId = process.argv[2];

if (!projectId) {
  console.error("Usage: npx ts-node-dev --transpile-only src/scripts/liveTest.ts <projectId>");
  process.exit(1);
}

const socket = io("http://localhost:4000");

socket.on("connect", () => {
  console.log("Connected to live server");
  console.log("Socket ID:", socket.id);

  socket.emit("join_project", projectId);
});

socket.on("joined_project", (data) => {
  console.log("Joined project room:");
  console.log(data);
});

socket.on("new_event", (data) => {
  console.log("New live event received:");
  console.log(JSON.stringify(data, null, 2));
});

socket.on("disconnect", () => {
  console.log("Disconnected from live server");
});