import cron from 'node-cron';
import { analyticsRepository } from '../repositories/analyticsRepository';
import { aiService } from '../services/aiService';
import { redisClient } from '../config/redis';
import { pool } from '../config/db';

const SUMMARY_KEY_PREFIX = 'analytics:daily-summary';

/**
 * Generates an AI summary for yesterday's data and stores it.
 * Scheduled to run at midnight (00:00).
 */
async function generateNightlySummary(): Promise<void> {
  try {
    const salesSummary = await analyticsRepository.getSalesSummary();
    const topProducts = await analyticsRepository.getTopProducts(5);
    const lowStock = await analyticsRepository.getLowStockProducts();

    const dashboardData = { salesSummary, topProducts, lowStock };
    const insights = await aiService.generateInsights(dashboardData);

    // Store in Redis with 48-hour TTL
    const todayKey = `${SUMMARY_KEY_PREFIX}:${new Date().toISOString().split('T')[0]}`;
    if (redisClient.isOpen) {
      await redisClient.setEx(todayKey, 172800, insights); // 48 hours
    }

    // Also persist to DB snapshot
    await pool.query(`
      UPDATE analytics_snapshots 
      SET ai_summary = $1, updated_at = CURRENT_TIMESTAMP
      WHERE date = CURRENT_DATE
    `, [insights]);

    console.log(`[Cron] Nightly AI summary generated at ${new Date().toISOString()}`);
  } catch (err: any) {
    console.error('[Cron] Failed to generate nightly AI summary:', err.message);
  }
}

/**
 * Gets the latest stored AI summary (today or yesterday).
 */
export async function getLatestAISummary(): Promise<string | null> {
  try {
    if (!redisClient.isOpen) return null;
    
    const today = new Date().toISOString().split('T')[0];
    const todaySummary = await redisClient.get(`${SUMMARY_KEY_PREFIX}:${today}`);
    if (todaySummary) return todaySummary;

    // Try yesterday
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    return await redisClient.get(`${SUMMARY_KEY_PREFIX}:${yesterday}`);
  } catch {
    return null;
  }
}

/**
 * Registers the nightly AI summary cron job.
 */
export function registerAISummaryCron(): void {
  // Midnight: generate AI summary 
  cron.schedule('0 0 * * *', () => {
    generateNightlySummary();
  });

  console.log('[Cron] Nightly AI summary job scheduled: midnight daily');
}
