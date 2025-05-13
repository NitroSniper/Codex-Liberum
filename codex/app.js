const express = require('express');
const path = require('path');
const app = express()
const port = 3000
const dots = require('./views/dots');
const QRCode = require('qrcode');
const speakeasy = require('speakeasy');
const pinoHttp  = require('pino-http');
const logger = require('./models/logger');

// pino for log
app.use(pinoHttp({ logger }));


/* Import Routes */
const { router: middlewareRouter }  = require('./routes/middleware');
app.use(middlewareRouter);
// disable express fingerprinting on server
app.disable("x-powered-by");
const indexRouter = require('./routes/index');
app.use('/', indexRouter);
const getPostRouter = require('./routes/post');
app.use('/post', getPostRouter)
const moderatorRoutes = require('./routes/moderator');
app.use('/moderator', moderatorRoutes);
const authentication = require('./routes/authentication');
app.use('/auth', authentication);
const pub = require('./routes/public');
app.use('/public', pub);


// For undefined routes
app.use((req, res) => {
    res.status(404).send(dots.message({message: "404: Page Not Found"}));
});

const server = app.listen(port, () => {
    logger.info(`Server running on http://localhost:${port}`);
});

// Reason - https://cheatsheetseries.owasp.org/cheatsheets/NodeJS_Docker_Cheat_Sheet.html#6-graceful-tear-down-for-your-nodejs-web-applications
async function closeGraceful(signal) {
    logger.info(`Received signal to terminate: ${signal}`)

    await server.close(() => {
        logger.info("Server terminated.");
        process.exit(0);
    });
}

process.on('SIGINT', closeGraceful);
process.on('SIGTERM', closeGraceful);