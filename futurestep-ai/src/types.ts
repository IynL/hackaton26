export type Mode = 'choice' | 'simulator' | 'portfolio' | 'skill_up' | 'battle' | 'interview';

export interface Stats {
  hard_skills: number;
  soft_skills: number;
  market_value: number;
}

export interface InteractiveElement {
  id: string;
  label: string;
}

export interface PortfolioEntry {
  project_name: string;
  role: string;
  tools: string[];
}

export interface AIResponse {
  message: string;
  mode: Mode;
  visual_data: {
    skill_tree_update: string[];
    stats: Stats;
    battle_details?: {
      prof1: string;
      prof2: string;
      arguments1: string[];
      arguments2: string[];
    };
    salary_data?: {
      labels: string[];
      values: number[];
    };
  };
  interactive_elements: InteractiveElement[];
  portfolio_entry: PortfolioEntry | null;
}

export interface UserState {
  stats: Stats;
  skills: string[];
  portfolio: PortfolioEntry[];
  history: { role: 'user' | 'assistant'; content: string }[];
  currentMode: Mode;
}
