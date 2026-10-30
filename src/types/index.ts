export type ToolCategory =
  | 'developer'
  | 'creator'
  | 'seller'
  | 'productivity'
  | 'construction'
  | 'pets';

export interface CategoryInfo {
  id: ToolCategory;
  name: string;
  description: string;
  icon: string;
}

export interface ToolDefinition {
  id: string;
  name: string;
  category: ToolCategory;
  shortDesc: string;
  seoTitle: string;
  seoDescription: string;
  tags: string[];
  component: React.ComponentType;
  formulaOrInfo?: string;
}
