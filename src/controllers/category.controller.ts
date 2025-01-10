import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { Category, Prisma } from '@prisma/client';

type CategoryResponse = 
  | { data: Category | Category[] }
  | { error: string }
  | { message: string };

const getAllCategories = async (req: Request, res: Response<CategoryResponse>) => {
  try {
    const userId = req.session.passport?.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'Użytkownik nie jest zalogowany'
      });
    }

    const categories = await prisma.category.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    res.json({ data: categories });
  } catch (error) {
    console.error('Błąd podczas pobierania kategorii:', error);
    res.status(500).json({ 
      error: 'Wystąpił błąd podczas pobierania kategorii' 
    });
  }
};

const createCategory = async (req: Request, res: Response<CategoryResponse>) => {
  try {
    const userId = req.session.passport?.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'Użytkownik nie jest zalogowany'
      });
    }

    const categoryData: Prisma.CategoryUncheckedCreateInput = {
      name: req.body.name,
      color: req.body.color,
      budget: new Prisma.Decimal(req.body.budget),
      currentSpent: new Prisma.Decimal(0),
      userId: userId
    };

    console.log('Próba utworzenia kategorii:', categoryData);

    const category = await prisma.category.create({
      data: categoryData
    });

    res.status(201).json({ data: category });
  } catch (error) {
    console.error('Szczegóły błędu podczas tworzenia kategorii:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(400).json({
          error: 'Kategoria o takiej nazwie już istnieje'
        });
      }
    }

    res.status(500).json({ 
      error: 'Wystąpił błąd podczas tworzenia kategorii'
    });
  }
};

const updateCategory = async (req: Request<{ id: string }>, res: Response<CategoryResponse>) => {
  try {
    const categoryData: Prisma.CategoryUpdateInput = {
      name: req.body.name,
      color: req.body.color,
      budget: new Prisma.Decimal(req.body.budget),
    };

    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: categoryData,
    });

    res.json({ data: category });
  } catch (error) {
    res.status(500).json({ 
      error: 'Wystąpił błąd podczas aktualizacji kategorii' 
    });
  }
};

const deleteCategory = async (req: Request<{ id: string }>, res: Response<CategoryResponse>) => {
  try {
    // Sprawdź czy kategoria ma powiązane transakcje
    const transactionsCount = await prisma.transaction.count({
      where: { categoryId: req.params.id }
    });

    if (transactionsCount > 0) {
      return res.status(400).json({
        error: 'Nie można usunąć kategorii, która ma powiązane transakcje'
      });
    }

    await prisma.category.delete({
      where: { id: req.params.id },
    });

    res.status(200).json({
      message: 'Kategoria została pomyślnie usunięta'
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Wystąpił błąd podczas usuwania kategorii' 
    });
  }
};

const getCategoryById = async (req: Request<{ id: string }>, res: Response<CategoryResponse>) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
    });

    if (!category) {
      return res.status(404).json({
        error: 'Kategoria nie została znaleziona'
      });
    }

    res.json({ data: category });
  } catch (error) {
    res.status(500).json({ 
      error: 'Wystąpił błąd podczas pobierania kategorii' 
    });
  }
};

export default {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById
}; 