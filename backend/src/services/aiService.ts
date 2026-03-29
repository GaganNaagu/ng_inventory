import OpenAI from 'openai';

// Fallback mock generator for when no API key is configured
const generateMockInsights = (dashboardData: any): string => {
  let response = `### 📈 Daily Sales Performance\n`;
  response += `Today's sales have reached **₹${dashboardData.salesSummary.today}**, bringing the weekly total to **₹${dashboardData.salesSummary.thisWeek}**. Your store is pacing consistently, and given the monthly total of ₹${dashboardData.salesSummary.thisMonth}, we recommend pushing a weekend promotional bundle to break current targets.\n\n`;

  response += `### 🔥 Product Trends\n`;
  if (dashboardData.topProducts.length > 0) {
    response += `Your strongest performer right now is **${dashboardData.topProducts[0].name}**. Consider grouping it with slower-moving inventory into a strategic cross-sell package to clear underperforming stock.\n\n`;
  } else {
    response += `We haven't seen significant volume movement on individual items yet today. Keep an eye on foot traffic patterns over the next few hours.\n\n`;
  }

  response += `### ⚠️ Inventory Actions Required\n`;
  if (dashboardData.lowStock.length > 0) {
    response += `You have **${dashboardData.lowStock.length} items** beneath their critical reorder threshold. The most urgent is **${dashboardData.lowStock[0].name}** (only ${dashboardData.lowStock[0].quantity} left). Contact suppliers immediately to prevent stockout losses.`;
  } else {
    response += `Your inventory levels are incredibly healthy. All items currently sit securely above their restock thresholds!`;
  }

  return response;
};

export const aiService = {
  async generateInsights(dashboardData: any): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;

    // Build the data context string used by both mock and real paths
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

    // If no API key is configured, use the mock generator
    if (!apiKey) {
      console.log('[AI Service] No OPENAI_API_KEY found. Using mock insights.');
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
      return generateMockInsights(dashboardData);
    }

    // Real OpenAI integration
    try {
      const openai = new OpenAI({ apiKey });

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert retail analyst for a small retail store. Analyze the provided store data and generate a concise executive summary in markdown format with 3 sections:
1. "### 📈 Daily Sales Performance" — Comment on today's revenue, weekly trajectory, and monthly pacing. Give one actionable sales recommendation.
2. "### 🔥 Product Trends" — Highlight the top performer and suggest a cross-sell or bundling strategy.
3. "### ⚠️ Inventory Actions Required" — Flag low-stock items urgently and recommend supplier action.
Keep it concise (under 250 words). Use bold for key numbers. Be specific and data-driven.`
          },
          {
            role: 'user',
            content: dataContext
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return completion.choices[0]?.message?.content || generateMockInsights(dashboardData);
    } catch (error: any) {
      console.error('[AI Service] OpenAI API error:', error.message);
      // Graceful fallback to mock if API call fails
      return generateMockInsights(dashboardData);
    }
  }
};
