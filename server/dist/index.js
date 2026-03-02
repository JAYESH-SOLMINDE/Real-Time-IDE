"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const socketManager_1 = require("./socket/socketManager");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_1 = __importDefault(require("./routes/auth"));
const room_1 = __importDefault(require("./routes/room"));
const files_1 = __importDefault(require("./routes/files"));
const execute_1 = __importDefault(require("./routes/execute"));
const ai_1 = __importDefault(require("./routes/ai"));
const logger_1 = __importDefault(require("./utils/logger"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = http_1.default.createServer(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: false,
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
});
app.use((0, helmet_1.default)({ contentSecurityPolicy: false }));
app.use((0, cors_1.default)({ origin: '*', credentials: false }));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api/auth', auth_1.default);
app.use('/api/rooms', room_1.default);
app.use('/api/files', files_1.default);
app.use('/api/execute', execute_1.default);
app.use('/api/ai', ai_1.default);
app.get('/api/health', (_req, res) => {
    res.json({ status: 'OK', message: '🚀 Code Current server is running!' });
});
(0, socketManager_1.initSocket)(io);
app.use(errorHandler_1.errorHandler);
const PORT = process.env.PORT || 3001;
(0, db_1.default)().then(() => {
    httpServer.listen(PORT, () => {
        logger_1.default.info(`🚀 Server running on http://localhost:${PORT}`);
    });
});
