import { Router } from 'express';
import { getFiles, saveFile, deleteFile } from '../controllers/fileController';

const router = Router();

router.get('/:roomId', getFiles);
router.post('/', saveFile);
router.delete('/:fileId', deleteFile);

export default router;