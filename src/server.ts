const express = require("express");
const bodyParser = require("body-parser");
import logger = require("morgan");

import { Request, Response } from "express";

/**
 * Server Definition
 */
// _____________________________________________________
// Initialization

const config = {
  PORT: process.env.PORT || 3000,
  STARTED: new Date().toString()
};
const app = express(); // Create global app object

// _____________________________________________________
// Express Configurations

app.use(logger("dev"));
app.use(express.static("public")); // Static files configuration
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // Support JSON bodies

// _____________________________________________________
// Routes

app.use(require("./routes")); // API Routes
app.get("/status", (req: Request, res: Response) => res.send("Live! 🔥"));
app.get("/config", (req: Request, res: Response) => res.send(config));
app.get("/", (req: Request, res: Response) => res.sendFile("index.html"));

// _____________________________________________________
// Start the server

const server = app.listen(config.PORT, () =>
  console.log(
    `🚀 Server is listening on http://localhost:${server.address().port}`
  )
);
