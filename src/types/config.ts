export interface GlobalConfig {
  default_profile: string;
  sync: {
    method: 'git' | 'none';
    remote?: string;
    auto_pull: boolean;
    auto_push: boolean;
  };
  cli: {
    colors: boolean;
    confirm_destructive: boolean;
  };
  global: {
    enabled: boolean;
  };
  paths?: {
    library?: string;
  };
}

export interface LocalConfig {
  profile: string;
  blocks: BlockReference[];
  agents?: string[];
  commands?: string[];
  generated_at: string;
}

export interface BlockReference {
  name: string;
  version: string;
  hash: string;
}

export const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  default_profile: 'default',
  sync: {
    method: 'none',
    auto_pull: true,
    auto_push: false,
  },
  cli: {
    colors: true,
    confirm_destructive: true,
  },
  global: {
    enabled: true,
  },
};
