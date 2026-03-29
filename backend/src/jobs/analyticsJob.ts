import cron from 'node-cron';
import { analyticsRepository } from '../repositories/analyticsRepository';
import { redisClient } from '../config/redis';
import { pool } from '../config/db';

const CACHE_KEY = 'analytics:dashboard';
const CACHE_TTL = 600; // 10 minutes in seconds

/**
 * Refreshes the analytics cache in Redis and persists today's snapshot to the DB.
 * Called every 5 minutes by cron and once on startup.
 */
export async function refreshAnalyticsCache(): Promise<void> {
  try {
    const salesSummary = await analyticsRepository.getSalesSummary();
    const topProducts = await analyticsRepository.getTopProducts(5);
    const lowStock = await analyticsRepository.getLowStockProducts();

    const dashboardData = { salesSummary, topProducts, lowStock };

    // 1. Write to Redis cache
    if (redisClient.isOpen) {
      await redisClient.setEx(CACHE_KEY, CACHE_TTL, JSON.stringify(dashboardData));
    }

    // 2. Upsert today's snapshot into analytics_snapshots
    await pool.query(`
      INSERT INTO analytics_snapshots (date, daily_total, weekly_total, monthly_total, top_products, low_stock_count, updated_at)
      VALUES (CURRENT_DATE, $1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      ON CONFLICT (date) DO UPDATE SET
        daily_total = EXCLUDED.daily_total,
        weekly_total = EXCLUDED.weekly_total,
        monthly_total = EXCLUDED.monthly_total,
        top_products = EXCLUDED.top_products,
        low_stock_count = EXCLUDED.low_stock_count,
        updated_at = CURRENT_TIMESTAMP
    `, [
      salesSummary.today,
      salesSummary.thisWeek,
      salesSummary.thisMonth,
      JSON.stringify(topProducts),
      lowStock.length,
    ]);

    console.log(`[Cron] Analytics cache refreshed at ${new Date().toISOString()}`);
  } catch (err: any) {
    console.error('[Cron] Failed to refresh analytics cache:', err.message);
  }
}

/**
 * Reads the cached dashboard data from Redis.
 * Returns null on cache miss.
 */
export async function getCachedDashboard(): Promise<any | null> {
  try {
    if (!redisClient.isOpen) return null;
    const cached = await redisClient.get(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

/**
 * Registers all cron schedules for analytics background jobs.
 */
export function registerAnalyticsCron(): void {
  // Every 5 minutes: refresh dashboard cache
  cron.schedule('*/5 * * * *', () => {
    refreshAnalyticsCache();
  });

  console.log('[Cron] Analytics job scheduled: every 5 minutes');

  // Pre-warm cache on startup
  refreshAnalyticsCache();
}
