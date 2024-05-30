import express, { json, urlencoded } from "express";
import cors, {CorsOptions} from "cors";

import usersRouter from "./routes/users.router";

const app = express();
const PORT = 3000;

app.use(json(), urlencoded({ extended: true }));

const corsOptions: CorsOptions = {
  origin: ["http://localhost:3000", "http://localhost:5173"],
  optionsSuccessStatus: 200,
}

app.get("/", cors(corsOptions),  (_, res) => {
  res.send("Hello World! 2");
});

app.use("/users", cors(corsOptions), usersRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
