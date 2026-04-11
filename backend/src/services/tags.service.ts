import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { SetTagsInput } from '../validators/tags';

export async function setTags(userId: string, userBookId: string, input: SetTagsInput) {
  const userBook = await prisma.userBook.findFirst({
    where: { id: userBookId, userId },
  });

  if (!userBook) {
    throw new AppError(404, 'Book not found in library');
  }

  if (userBook.status !== 'FINISHED') {
    throw new AppError(400, 'Tags can only be set for finished books');
  }

  if (userBook.recommended !== true) {
    throw new AppError(400, 'Tags can only be set for recommended books');
  }

  // Replace all existing tags with the new selection
  await prisma.bookTag.deleteMany({ where: { userBookId } });

  if (input.tags.length > 0) {
    await prisma.bookTag.createMany({
      data: input.tags.map((tag) => ({ userBookId, tag })),
    });
  }

  return prisma.bookTag.findMany({ where: { userBookId } });
}
