/* eslint-disable no-console */
import http from "http";
import mongoose from "mongoose";
import { envVars } from "./app/config/env";
import app from "./app";
import { seedAdmin } from "./app/utils/seedAdmin";
import { connectRedis } from "./app/config/redis.config";
import { Server as SocketIoServer } from "socket.io";

let server: http.Server;
export let io: SocketIoServer;
const port = envVars.PORT;

const startServer = async () => {
  try {
    await mongoose.connect(`${envVars.DB_URL}`);

    server = http.createServer(app);

    io = new SocketIoServer(server, {
      cors: {
        origin: envVars.FRONTEND_URL,
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
        credentials: true,
      },
    });

    io.on("connection", (socket) => {

      socket.on("join_ride_room", (rideId) => {
        socket.join(rideId);
      });

      socket.on("disconnect", () => {
        console.log(`🔌 User disconnected: ${socket.id}`);
      });
    });

    server.listen(port, () => {
      console.log(`Ride Booking Server running on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

(async () => {
  await connectRedis();
  await startServer();
  await seedAdmin();
})();

process.on("SIGTERM", () => {
  console.log("SIGTERM Signal recievd... Server shutting down..");

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});
process.on("SIGINT", () => {
  console.log("Sigterm Signal recievd... Server shutting down..");

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection detected... Server shutting down..", err);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

process.on("uncaughtException", () => {
  console.log("Uncaught Exreption detected... Server shutting down..");

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});
