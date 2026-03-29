import { Request, Response } from 'express';
import { productService } from '../services/productService';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const filters = {
      search: req.query.search as string | undefined,
      category_id: req.query.category_id as string | undefined,
      low_stock: req.query.low_stock === 'true',
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
    };
    const products = await productService.getAllProducts(filters);
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json(product);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.json(product);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await productService.deleteProduct(req.params.id);
    res.json({ message: 'Product deleted', product });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
