import { Router } from 'express';
import * as booksController from '../controllers/books.controller';
import { authMiddleware } from '../middleware/auth';
import { validateBody } from '../middleware/validateBody';
import { validateQuery } from '../middleware/validateQuery';
import { manualBookSchema, searchBooksSchema } from '../validators/books';

const router = Router();

router.get('/search', authMiddleware, validateQuery(searchBooksSchema), booksController.search);
router.post('/manual', authMiddleware, validateBody(manualBookSchema), booksController.createManual);

export default router;
