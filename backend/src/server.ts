import app from "./app";
import { prisma } from "./config/database";
import { env } from "./config/env";

const server = app.listen(env.port, () => {
  console.log(`API server running on http://localhost:${env.port}`);
});

function shutdown() {
  server.close(() => {
    void prisma.$disconnect();
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
