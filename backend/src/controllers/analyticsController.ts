import { Request, Response } from 'express';
import { analyticsRepository } from '../repositories/analyticsRepository';
import { aiService } from '../services/aiService';

export const getDashboard = async (req: Request, res: Response) => {
  try {
    const salesSummary = await analyticsRepository.getSalesSummary();
    const topProducts = await analyticsRepository.getTopProducts(5);
    const lowStock = await analyticsRepository.getLowStockProducts();

    res.json({
      salesSummary,
      topProducts,
      lowStock
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const generateInsights = async (req: Request, res: Response) => {
  try {
    // 1. Fetch live DB data
    const salesSummary = await analyticsRepository.getSalesSummary();
    const topProducts = await analyticsRepository.getTopProducts(5);
    const lowStock = await analyticsRepository.getLowStockProducts();

    const dashboardData = { salesSummary, topProducts, lowStock };

    // 2. Transmit to AI Agent (Simulated)
    const insights = await aiService.generateInsights(dashboardData);

    res.json({ insights });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
