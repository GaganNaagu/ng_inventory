export const aiService = {
  async generateInsights(dashboardData: any) {
    // 1. In a real environment, you'd instantiate the OpenAI or Gemini SDK here
    // import OpenAI from 'openai';
    // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    // 2. Prepare the prompt with the real data
    const prompt = `
      You are an expert retail analyst. Analyze the following store data and provide a concise 3-paragraph executive summary with actionable insights:
      
      Sales Today: $${dashboardData.salesSummary.today}
      Sales This Week: $${dashboardData.salesSummary.thisWeek}
      Sales This Month: $${dashboardData.salesSummary.thisMonth}
      
      Top Selling Products:
      ${dashboardData.topProducts.map((p: any) => `- ${p.name} (${p.total_sold} sold)`).join('\n')}
      
      Low Stock Warnings:
      ${dashboardData.lowStock.map((p: any) => `- ${p.name} (Qty: ${p.quantity}, Threshold: ${p.reorder_threshold})`).join('\n')}
    `;

    // 3. Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 4. Return formatted mock response. Replace this block when live!
    let mockResponse = `### 📈 Daily Sales Performance\n`;
    mockResponse += `Today's sales have reached **$${dashboardData.salesSummary.today}**, bringing the weekly total to **$${dashboardData.salesSummary.thisWeek}**. Your store is pacing consistently, and given the monthly total of $${dashboardData.salesSummary.thisMonth}, we recommend pushing a weekend promotional bundle to break current targets.\n\n`;
    
    mockResponse += `### 🔥 Product Trends\n`;
    if (dashboardData.topProducts.length > 0) {
      mockResponse += `Your strongest performer right now is **${dashboardData.topProducts[0].name}**. Consider grouping it with slower-moving inventory into a strategic cross-sell package to clear underperforming stock.\n\n`;
    } else {
      mockResponse += `We haven't seen significant volume movement on individual items yet today. Keep an eye on foot traffic patterns over the next few hours.\n\n`;
    }

    mockResponse += `### ⚠️ Inventory Actions Required\n`;
    if (dashboardData.lowStock.length > 0) {
      mockResponse += `You have **${dashboardData.lowStock.length} items** beneath their critical reorder threshold. The most urgent is **${dashboardData.lowStock[0].name}** (only ${dashboardData.lowStock[0].quantity} left). Contact suppliers immediately to prevent stockout losses.`;
    } else {
      mockResponse += `Your inventory levels are incredibly healthy. All items currently sit securely above their restock thresholds!`;
    }

    return mockResponse;
  }
};
