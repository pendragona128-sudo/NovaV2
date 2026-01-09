export enum BottleneckCategory {
  PROCESS = 'Process Bottleneck',
  ROLE = 'Role & Ownership Bottleneck',
  VISIBILITY = 'Performance Visibility Bottleneck',
}

export interface Question {
  id: number;
  text: string;
  options: Option[];
}

export interface Option {
  text: string;
  category: BottleneckCategory;
}

export interface DiagnosticResult {
  category: BottleneckCategory;
  description: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
