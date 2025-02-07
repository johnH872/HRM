import express, { json } from 'express';
import 'dotenv/config';
import cors from 'cors';
import bodyParser from 'body-parser';
import http from 'http';
import { Server } from 'socket.io';
import admin from 'firebase-admin';
import serviceAccount from '../config/push-notification-key.json' assert { type: "json" };

const app = express();
const server = http.createServer(app);
const socketIO = new Server(server, {
    cors: {
        origins: ['http://localhost:4200/'],
    }
});
import route from './routes/indexRoutes.js';
import { Sequelize } from 'sequelize';
import dbConfigs from './config/db.config.js';
import { generationLeaveEntitlementJob } from './cronJobs/generationLeaveEntitlementJobs.js';
import { balanceLeaveEntitlementJob } from './cronJobs/balanceLeaveEntitlementJobs.js';
import { workCalendarJob } from './cronJobs/workCalendarJobs.js';
import { notificationJobs } from './cronJobs/notificationJobs.js';

//database connection
const sequelize = new Sequelize(
    dbConfigs.development
)
sequelize.authenticate()
    .then(() => {
        console.log('MSQL connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

//middleware
app.use(json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/assets/images', express.static('assets/images'));

//base route    
route(app);

// cron jobs
workCalendarJob.start();
generationLeaveEntitlementJob.start();
balanceLeaveEntitlementJob.start();
notificationJobs.start();

// app.get('/socket.io', (req, res) => {
//     res.send('<h1>Hey Socket.io</h1>');
// });

socketIO.on('connection', (socket) => {
    console.log('-----------------A user connected-----------------');
    socket.on('disconnect', () => {
        console.log('---------------A user disconnected------------');
    });
});

// firbase setup
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

export {
    server,
    socketIO
};

