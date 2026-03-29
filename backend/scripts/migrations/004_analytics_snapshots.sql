CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  daily_total NUMERIC(12,2) DEFAULT 0,
  weekly_total NUMERIC(12,2) DEFAULT 0,
  monthly_total NUMERIC(12,2) DEFAULT 0,
  top_products JSONB DEFAULT '[]',
  low_stock_count INTEGER DEFAULT 0,
  ai_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
