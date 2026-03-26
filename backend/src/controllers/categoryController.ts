import { Request, Response } from 'express';
import { categoryService } from '../services/categoryService';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    res.json(category);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.createCategory(req.body.name);
    res.status(201).json(category);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body.name);
    res.json(category);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.deleteCategory(req.params.id);
    res.json({ message: 'Category deleted', category });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
