import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { StoredEvent } from "../store/eventStore";
import { TimeWindowAggregate } from "../store/aggregateStore";

let io: Server | null = null;

export function initSocketServer(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join_project", (projectId: string) => {
      socket.join(projectId);

      socket.emit("joined_project", {
        projectId,
        message: `Joined live stream for project ${projectId}`,
      });

      console.log(`Socket ${socket.id} joined project ${projectId}`);
    });

    socket.on("leave_project", (projectId: string) => {
      socket.leave(projectId);
      console.log(`Socket ${socket.id} left project ${projectId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function emitProjectEvent(
  projectId: string,
  event: StoredEvent,
  aggregate: TimeWindowAggregate
) {
  if (!io) {
    console.warn("Socket server not initialized");
    return;
  }

  io.to(projectId).emit("new_event", {
    projectId,
    event,
    aggregate,
  });
}