import cors from "cors";
import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser"
import expressSession from "express-session"
import { router } from "./app/routes/index.route";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { envVars } from "./app/config/env";
import { notFound } from "./app/middleware/notFount";
import "./app/config/passport";
import passport from "passport";
import compression from "compression";


const app: Application = express();


app.use(expressSession({
  secret: envVars.EXPRESS_SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.set("trust proxy", 1)
app.use(cookieParser());
app.use(express.json());
app.use(compression())
app.use(cors({
  origin: [envVars.FRONTEND_URL, envVars.LOCAL_FRONTEND_URL],
  credentials: true
}));

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json("Welcome to Ride Booking System Backend");
});

app.use(globalErrorHandler);


app.use(notFound)

export default app;