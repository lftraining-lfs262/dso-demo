export interface SecretFinding {
  file: string;
  line: number;
  match: string;
  rule: string;
  commit: string;
}

export interface ScanResult {
  findings: SecretFinding[];
  blocked: boolean;
}
