import { Router } from 'express';
import * as libraryController from '../controllers/library.controller';
import * as tagsController from '../controllers/tags.controller';
import { authMiddleware } from '../middleware/auth';
import { validateBody } from '../middleware/validateBody';
import { validateQuery } from '../middleware/validateQuery';
import { addToLibrarySchema, updateUserBookSchema } from '../validators/library';
import { libraryQuerySchema } from '../validators/queryParams';
import { setTagsSchema } from '../validators/tags';

const router = Router();

router.post('/', authMiddleware, validateBody(addToLibrarySchema), libraryController.addToLibrary);
router.get('/years', authMiddleware, libraryController.getLibraryYears);
router.get('/', authMiddleware, validateQuery(libraryQuerySchema), libraryController.getLibrary);
router.get('/:userBookId', authMiddleware, libraryController.getDetail);
router.patch('/:userBookId', authMiddleware, validateBody(updateUserBookSchema), libraryController.updateUserBook);
router.delete('/:userBookId', authMiddleware, libraryController.deleteUserBook);
router.post('/:userBookId/tags', authMiddleware, validateBody(setTagsSchema), tagsController.setTags);

export default router;
