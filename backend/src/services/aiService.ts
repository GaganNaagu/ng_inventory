import { resolveProvider, AIProvider } from './aiProviders';

// Resolve provider once at startup
let provider: AIProvider;

function getProvider(): AIProvider {
  if (!provider) {
    provider = resolveProvider();
  }
  return provider;
}

// ─── Mock insights generator (data-driven, no API needed) ───────────
const generateMockInsights = (dashboardData: any): string => {
  let response = `📈 Daily Sales Performance\n`;
  response += `Today's sales have reached ₹${dashboardData.salesSummary.today}, bringing the weekly total to ₹${dashboardData.salesSummary.thisWeek}. Your store is pacing consistently, and given the monthly total of ₹${dashboardData.salesSummary.thisMonth}, we recommend pushing a weekend promotional bundle to break current targets.\n\n`;

  response += `🔥 Product Trends\n`;
  if (dashboardData.topProducts.length > 0) {
    response += `Your strongest performer right now is ${dashboardData.topProducts[0].name}. Consider grouping it with slower-moving inventory into a strategic cross-sell package to clear underperforming stock.\n\n`;
  } else {
    response += `We haven't seen significant volume movement on individual items yet today. Keep an eye on foot traffic patterns over the next few hours.\n\n`;
  }

  response += `⚠️ Inventory Actions Required\n`;
  if (dashboardData.lowStock.length > 0) {
    response += `You have ${dashboardData.lowStock.length} items beneath their critical reorder threshold. The most urgent is ${dashboardData.lowStock[0].name} (only ${dashboardData.lowStock[0].quantity} left). Contact suppliers immediately to prevent stockout losses.`;
  } else {
    response += `Your inventory levels are incredibly healthy. All items currently sit securely above their restock thresholds!`;
  }

  return response;
};

// ─── System prompt used for all AI providers ────────────────────────
const SYSTEM_PROMPT = `You are an expert retail analyst for a small retail store. Analyze the provided store data and generate a concise executive summary as PLAIN TEXT (no markdown, no hashtags, no bold markers) with 3 sections separated by blank lines:

1. Start with "📈 Daily Sales Performance" on its own line, then write 2-3 sentences about today's revenue, weekly trajectory, and monthly pacing. End with one actionable sales recommendation.

2. Start with "🔥 Product Trends" on its own line, then write 2-3 sentences highlighting the top performer and suggest a cross-sell or bundling strategy.

3. Start with "⚠️ Inventory Actions Required" on its own line, then write 2-3 sentences flagging low-stock items urgently and recommending supplier action.

Keep it concise (under 250 words). Do NOT use any markdown formatting like #, ##, ###, *, **, or bullet points. Write in natural flowing sentences. Use actual numbers from the data.`;

// ─── Main service ───────────────────────────────────────────────────
export const aiService = {
  async generateInsights(dashboardData: any): Promise<string> {
    const dataContext = `
Sales Today: ₹${dashboardData.salesSummary.today}
Sales This Week: ₹${dashboardData.salesSummary.thisWeek}
Sales This Month: ₹${dashboardData.salesSummary.thisMonth}

Top Selling Products:
${dashboardData.topProducts.map((p: any) => `- ${p.name}: ${p.total_sold} units sold, ₹${p.total_revenue} revenue`).join('\n')}

Low Stock Warnings:
${dashboardData.lowStock.length > 0
  ? dashboardData.lowStock.map((p: any) => `- ${p.name} (SKU: ${p.sku}): ${p.quantity} left, threshold: ${p.reorder_threshold}`).join('\n')
  : '- None. All items are above reorder thresholds.'}
    `.trim();

    const activeProvider = getProvider();

    // Mock provider → use local generator
    if (activeProvider.name === 'mock') {
      console.log('[AI Service] Using mock insights (no provider configured).');
      await new Promise(resolve => setTimeout(resolve, 1500));
      return generateMockInsights(dashboardData);
    }

    // Real provider → call API with graceful fallback
    try {
      const result = await activeProvider.generateText(SYSTEM_PROMPT, dataContext);
      console.log('[AI Service] Insights generated:', result);
      if (!result) return generateMockInsights(dashboardData);
      return result;
    } catch (error: any) {
      console.error(`[AI Service] ${activeProvider.name} API error:`, error.message);
      return generateMockInsights(dashboardData);
    }
  }
};
