"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const executeController_1 = require("../controllers/executeController");
const router = (0, express_1.Router)();
router.post('/', executeController_1.executeCode);
exports.default = router;
