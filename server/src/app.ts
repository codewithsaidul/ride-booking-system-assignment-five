
import cors from "cors";
import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser"
import expressSession from "express-session"
import { router } from "./app/routes/index.route";




const app: Application = express();




app.use(expressSession({
  secret: "Your Secret",
  resave: false,
  saveUninitialized: false
}))
app.use(cookieParser())
app.use(express.json());
app.use(cors());

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json("Welcome to Tour Management Backend");
});

// app.use(globalErrorHandler);


// app.use(notFound)

export default app;