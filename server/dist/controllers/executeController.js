"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeCode = void 0;
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path_1 = require("path");
const uuid_1 = require("uuid");
const os_1 = __importDefault(require("os"));
const TIMEOUT = 10000;
const executeCode = async (req, res) => {
    const { code, language, stdin = '' } = req.body;
    const id = (0, uuid_1.v4)();
    const tmpDir = os_1.default.tmpdir();
    const fileMap = {
        javascript: { file: `${id}.js`, cmd: `echo ${JSON.stringify(stdin)} | node ${(0, path_1.join)(tmpDir, `${id}.js`)}` },
        typescript: { file: `${id}.ts`, cmd: `echo ${JSON.stringify(stdin)} | npx ts-node ${(0, path_1.join)(tmpDir, `${id}.ts`)}` },
        python: { file: `${id}.py`, cmd: `echo ${JSON.stringify(stdin)} | python3 ${(0, path_1.join)(tmpDir, `${id}.py`)}` },
        java: { file: `Main.java`, cmd: `cd ${tmpDir} && javac Main.java && echo ${JSON.stringify(stdin)} | java Main` },
        cpp: { file: `${id}.cpp`, cmd: `cd ${tmpDir} && g++ -o ${id} ${id}.cpp && echo ${JSON.stringify(stdin)} | ./${id}` },
        c: { file: `${id}.c`, cmd: `cd ${tmpDir} && gcc -o ${id} ${id}.c && echo ${JSON.stringify(stdin)} | ./${id}` },
        go: { file: `${id}.go`, cmd: `echo ${JSON.stringify(stdin)} | go run ${(0, path_1.join)(tmpDir, `${id}.go`)}` },
    };
    const config = fileMap[language] || fileMap['javascript'];
    const filePath = (0, path_1.join)(tmpDir, config.file);
    try {
        (0, fs_1.writeFileSync)(filePath, code);
        const start = Date.now();
        (0, child_process_1.exec)(config.cmd, { timeout: TIMEOUT }, (error, stdout, stderr) => {
            const elapsed = Date.now() - start;
            // Cleanup
            try {
                (0, fs_1.unlinkSync)(filePath);
            }
            catch { }
            if (error && !stdout) {
                res.json({ success: true, output: stderr || error.message, elapsed });
                return;
            }
            res.json({ success: true, output: stdout || stderr || '(no output)', elapsed });
        });
    }
    catch (err) {
        res.status(500).json({ success: false, output: `Error: ${err.message}` });
    }
};
exports.executeCode = executeCode;
