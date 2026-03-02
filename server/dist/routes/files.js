"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fileController_1 = require("../controllers/fileController");
const router = (0, express_1.Router)();
router.get('/:roomId', fileController_1.getFiles);
router.post('/', fileController_1.saveFile);
router.delete('/:fileId', fileController_1.deleteFile);
exports.default = router;
