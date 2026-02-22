import express, {Application, Request, Response, NextFunction} from "express";

import { IndexRoutes } from "./app/routes";
import { success } from "better-auth";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import path from "node:path";

const app: Application = express();

app.set("/view engine", "ejs");
app.set("view", path.resolve(process.cwd(), `src/app/templates`));
 
app.use("api/auth", toNodeHandler(auth))

app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());


app.use("/api/v1", IndexRoutes)

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript + Express!');
});



app.use(globalErrorHandler)
app.use(notFound)

export default app;