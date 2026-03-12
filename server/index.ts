// // import express from "express";
// import cors from "cors";
// import config from "./config/config-base"
// // import { ... } from "./config/config-base.ts";
// import apiRouter from "./api";
// import { errorHandler } from "./middlewares/errorHandler";

// const express = require("express");

// const app = express();

// app.use(cors());
// app.use(express.json());
// app.use(apiRouter);
// app.use(errorHandler);

// app.listen(config.PORT, () => {
//   console.log(`Server running at http://localhost:${config.PORT}`);
//   if (!config.GEMINI_API_KEY) console.log("GEMINI_API_KEY not set – using mock responses");
// });

const express = require("express");
const bodyParser = require('body-parser');
import config from './config/config-base';
const app = express();
var cors = require('cors');
import apiRouter from "./api";
import { errorHandler } from "./middlewares/errorHandler";
// commit

try {
  //for developer
  app.use(
    cors({
      origin: '*',
    }),
  );
  
  app.use(bodyParser.json()); // to support JSON-encoded bodies
  app.use(bodyParser.urlencoded({ extended: true }));
  
  app.use(cors());
  app.use(express.json());
  app.use(apiRouter);
  app.use(errorHandler);
  app.listen(config.PORT, () => {
    console.log(`Server running at http://localhost:${config.PORT}`);
    if (!config.GEMINI_API_KEY) console.log("GEMINI_API_KEY not set – using mock responses");
  }).on('error', (error: Error) => {
    console.error(error);
  });
} catch (error) {
  console.error(error);
  process.exit(1);
}

