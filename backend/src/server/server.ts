import app from "app";
import env from "@utils/env";
import mongoose from "mongoose";

// Tambahkan import berikut:
import { createServer } from "http";
import { Server } from "socket.io";
import authenticateSocket from "@middleware/socketAuthenticate";

// Deklarasikan io di luar agar bisa diekspor
let io: Server | undefined;

// Koneksi ke MongoDB
mongoose
  .connect(env.MONGO_CONN_STRING)
  .then(() => {
    console.log("mongoose connected");

    // Buat HTTP server dari express app
    const httpServer = createServer(app);

    // Inisialisasi Socket.IO
    io = new Server(httpServer, {
      cors: {
        origin: "http://localhost:5000", // ganti sesuai frontend Anda
        credentials: true,
      },
    });

    // Gunakan middleware autentikasi socket
    io.use(authenticateSocket);

    // Event koneksi socket
    io.on("connection", (socket) => {
      console.log("Socket connected:", socket.userId);

      // Contoh: emit notifikasi ke user tertentu
      // io.to(socket.userId).emit("notification", { message: "Hello!" });
      // Handle disconnection
      socket.on("disconnect", () => {
        console.log("User disconnected");
      });
    });

    // Jalankan server di port yang sama dengan express
    httpServer.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
    });
  })
  .catch(console.error);

export { io };
