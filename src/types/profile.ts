export interface ProfileConfig {
  name: string;
  description: string;
  blocks: string[];
  agents?: string[];
  commands?: string[];
  settings?: Record<string, any>;
}

export interface Profile {
  path: string;
  slug: string;
  config: ProfileConfig;
}
