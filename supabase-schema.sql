-- PortfolioLab Database Schema for Supabase

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blocks table (Hero, About, Skills, etc.)
CREATE TABLE IF NOT EXISTS blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pages table (if needed for multi-page portfolios)
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for blocks
CREATE POLICY "Users can view blocks of their projects"
  ON blocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = blocks.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create blocks in their projects"
  ON blocks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = blocks.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update blocks in their projects"
  ON blocks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = blocks.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete blocks in their projects"
  ON blocks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = blocks.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies for pages
CREATE POLICY "Users can view pages of their projects"
  ON pages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = pages.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create pages in their projects"
  ON pages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = pages.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update pages in their projects"
  ON pages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = pages.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete pages in their projects"
  ON pages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = pages.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Indexes for better performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_updated_at ON projects(updated_at DESC);
CREATE INDEX idx_blocks_project_id ON blocks(project_id);
CREATE INDEX idx_blocks_order ON blocks("order");
CREATE INDEX idx_pages_project_id ON pages(project_id);

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating updated_at
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER blocks_updated_at
  BEFORE UPDATE ON blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
