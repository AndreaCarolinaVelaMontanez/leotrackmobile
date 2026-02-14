import { Router } from 'express';
import * as libraryController from '../controllers/library.controller';
import { authMiddleware } from '../middleware/auth';
import { validateBody } from '../middleware/validateBody';
import { validateQuery } from '../middleware/validateQuery';
import { addToLibrarySchema, updateUserBookSchema } from '../validators/library';
import { libraryQuerySchema } from '../validators/queryParams';

const router = Router();

router.post('/', authMiddleware, validateBody(addToLibrarySchema), libraryController.addToLibrary);
router.get('/', authMiddleware, validateQuery(libraryQuerySchema), libraryController.getLibrary);
router.get('/:userBookId', authMiddleware, libraryController.getDetail);
router.patch('/:userBookId', authMiddleware, validateBody(updateUserBookSchema), libraryController.updateUserBook);
router.delete('/:userBookId', authMiddleware, libraryController.deleteUserBook);

export default router;
