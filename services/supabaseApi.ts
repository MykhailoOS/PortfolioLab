import { supabase } from '../lib/supabase';

export interface Project {
  id: string;
  name: string;
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  blocks?: Block[];
  pages?: Page[];
}

export interface Block {
  id: string;
  project_id: string;
  type: string;
  data: any;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: string;
  project_id: string;
  path: string;
  data: any;
  created_at: string;
  updated_at: string;
}

// ========== PROJECTS ==========

export async function getProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getProject(id: string) {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      blocks (*),
      pages (*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createProject(name: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('projects')
    .insert({
      name,
      user_id: user.id,
      status: 'draft',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProject(id: string, updates: Partial<Project>) {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProject(id: string) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ========== BLOCKS ==========

export async function getBlocks(projectId: string) {
  const { data, error } = await supabase
    .from('blocks')
    .select('*')
    .eq('project_id', projectId)
    .order('order', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createBlock(projectId: string, type: string, data: any, order: number) {
  const { data: block, error } = await supabase
    .from('blocks')
    .insert({
      project_id: projectId,
      type,
      data,
      order,
    })
    .select()
    .single();

  if (error) throw error;
  return block;
}

export async function updateBlock(id: string, updates: Partial<Block>) {
  const { data, error } = await supabase
    .from('blocks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBlock(id: string) {
  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function reorderBlocks(projectId: string, blocks: { id: string; order: number }[]) {
  // Update each block's order
  const updates = blocks.map(({ id, order }) =>
    supabase
      .from('blocks')
      .update({ order })
      .eq('id', id)
  );

  await Promise.all(updates);
}

// ========== PAGES ==========

export async function getPages(projectId: string) {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('project_id', projectId);

  if (error) throw error;
  return data;
}

export async function getPage(id: string) {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createPage(projectId: string, path: string, data: any) {
  const { data: page, error } = await supabase
    .from('pages')
    .insert({
      project_id: projectId,
      path,
      data,
    })
    .select()
    .single();

  if (error) throw error;
  return page;
}

export async function updatePage(id: string, updates: Partial<Page>) {
  const { data, error } = await supabase
    .from('pages')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePage(id: string) {
  const { error } = await supabase
    .from('pages')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ========== HELPER FUNCTIONS ==========

// Autosave entire project with blocks
export async function autosaveProject(projectId: string, blocks: Block[]) {
  // Update project's updated_at
  await updateProject(projectId, { updated_at: new Date().toISOString() } as any);

  // Update all blocks
  const updates = blocks.map(block =>
    updateBlock(block.id, {
      data: block.data,
      order: block.order,
    })
  );

  await Promise.all(updates);
}
