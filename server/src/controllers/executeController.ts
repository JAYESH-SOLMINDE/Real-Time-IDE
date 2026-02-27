import { Request, Response } from 'express';
import { exec } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';

const TIMEOUT = 10000;

export const executeCode = async (req: Request, res: Response): Promise<void> => {
  const { code, language, stdin = '' } = req.body;
  const id = uuidv4();
  const tmpDir = os.tmpdir();

  const fileMap: Record<string, { file: string; cmd: string }> = {
    javascript: { file: `${id}.js`,   cmd: `echo ${JSON.stringify(stdin)} | node ${join(tmpDir, `${id}.js`)}` },
    typescript: { file: `${id}.ts`,   cmd: `echo ${JSON.stringify(stdin)} | npx ts-node ${join(tmpDir, `${id}.ts`)}` },
    python:     { file: `${id}.py`,   cmd: `echo ${JSON.stringify(stdin)} | python3 ${join(tmpDir, `${id}.py`)}` },
    java:       { file: `Main.java`,  cmd: `cd ${tmpDir} && javac Main.java && echo ${JSON.stringify(stdin)} | java Main` },
    cpp:        { file: `${id}.cpp`,  cmd: `cd ${tmpDir} && g++ -o ${id} ${id}.cpp && echo ${JSON.stringify(stdin)} | ./${id}` },
    c:          { file: `${id}.c`,    cmd: `cd ${tmpDir} && gcc -o ${id} ${id}.c && echo ${JSON.stringify(stdin)} | ./${id}` },
    go:         { file: `${id}.go`,   cmd: `echo ${JSON.stringify(stdin)} | go run ${join(tmpDir, `${id}.go`)}` },
  };

  const config = fileMap[language] || fileMap['javascript'];
  const filePath = join(tmpDir, config.file);

  try {
    writeFileSync(filePath, code);
    const start = Date.now();

    exec(config.cmd, { timeout: TIMEOUT }, (error, stdout, stderr) => {
      const elapsed = Date.now() - start;

      // Cleanup
      try { unlinkSync(filePath); } catch {}

      if (error && !stdout) {
        res.json({ success: true, output: stderr || error.message, elapsed });
        return;
      }

      res.json({ success: true, output: stdout || stderr || '(no output)', elapsed });
    });
  } catch (err: any) {
    res.status(500).json({ success: false, output: `Error: ${err.message}` });
  }
};