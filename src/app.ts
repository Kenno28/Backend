import express from 'express';
import "express-async-errors"; // needs to be imported before routers and other stuff!

import { loginRouter } from './routes/login';
import { eintragRouter } from './routes/eintrag';
import { pflegerRouter } from './routes/pfleger';
import { protokollRouter } from './routes/protokoll';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { configureCORS } from './configCORS';

const app = express();
const path = require('path');

// Middleware:
configureCORS(app);
app.use('*', express.json()) // vgl. Folie 138
app.use(cookieParser());

// Routes
app.use("/api/login", loginRouter)   // wird erst später implementiert, hier nur Dummy; hat aber bereits einen Präfix
app.use("/api/protokoll", protokollRouter)
app.use('/api/pfleger', pflegerRouter);
app.use('/api/eintrag', eintragRouter);
// TODO: Registrieren Sie hier die weiteren Router:

const _dirname = path._dirname("");
const buildPat = path.join(_dirname, "../client/build");

app.use(express.static(buildPat))

app.get("/*", function(req,res){
    res.sendFile(
        path.join(_dirname, "../client/build/index.html"),
        function(err){
            if(err){
                res.status(500).send(err);
            }
        }
    )
})

export default app;