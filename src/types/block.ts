export interface BlockFrontmatter {
  name: string;
  description: string;
  version: string;
  tags?: string[];
}

export interface Block {
  path: string;
  slug: string;
  frontmatter: BlockFrontmatter;
  content: string;
  hash: string;
}

export interface BlockCategory {
  name: string;
  blocks: Block[];
}
