import { Request, Response } from 'express';
import { saleService } from '../services/saleService';

export const createSale = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { items } = req.body;
    
    const sale = await saleService.checkout(userId, items);
    res.status(201).json({ message: 'Sale completed successfully', sale });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getSales = async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    const sales = await saleService.getSalesHistory(limit, offset);
    res.json(sales);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getSaleDetails = async (req: Request, res: Response) => {
  try {
    const sale = await saleService.getSaleById(req.params.id);
    res.json(sale);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
};
