import { buildServer } from "./http/server.js";

const port = Number(process.env.PORT ?? 8080);
const host = process.env.HOST ?? "0.0.0.0";
const app = buildServer();

app.listen({ port, host }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});

