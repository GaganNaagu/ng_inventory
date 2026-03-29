import { Request, Response } from 'express';
import { analyticsRepository } from '../repositories/analyticsRepository';
import { aiService } from '../services/aiService';
import { getCachedDashboard } from '../jobs/analyticsJob';
import { getLatestAISummary } from '../jobs/aiSummaryJob';

export const getDashboard = async (req: Request, res: Response) => {
  try {
    // 1. Try cache first (populated by cron every 5 min)
    const cached = await getCachedDashboard();
    if (cached) {
      // Optionally attach the latest pre-generated AI summary
      const latestSummary = await getLatestAISummary();
      return res.json({ ...cached, latestSummary });
    }

    // 2. Cache miss — fall back to live SQL
    const salesSummary = await analyticsRepository.getSalesSummary();
    const topProducts = await analyticsRepository.getTopProducts(5);
    const lowStock = await analyticsRepository.getLowStockProducts();

    res.json({
      salesSummary,
      topProducts,
      lowStock,
      latestSummary: null
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const generateInsights = async (req: Request, res: Response) => {
  try {
    // Always use live data for on-demand generation
    const salesSummary = await analyticsRepository.getSalesSummary();
    const topProducts = await analyticsRepository.getTopProducts(5);
    const lowStock = await analyticsRepository.getLowStockProducts();

    const dashboardData = { salesSummary, topProducts, lowStock };
    const insights = await aiService.generateInsights(dashboardData);

    res.json({ insights });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
