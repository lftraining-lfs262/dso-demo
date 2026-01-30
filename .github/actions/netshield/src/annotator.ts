import * as core from '@actions/core';
import * as github from '@actions/github';
import { SecretFinding } from './types';

export async function annotateFindings(findings: SecretFinding[]): Promise<void> {
  if (findings.length === 0) {
    return;
  }

  // Add annotations using GitHub Actions annotations
  for (const finding of findings) {
    core.error(
      `Secret detected: ${finding.rule}`,
      {
        file: finding.file,
        startLine: finding.line,
        title: '🛡️ NetShield: Secret Detected'
      }
    );
  }

  // Create summary
  await core.summary
    .addHeading('🛡️ NetShield: Secrets Detected', 2)
    .addRaw(`NetShield blocked this PR because ${findings.length} secret(s) were found.`)
    .addBreak()
    .addBreak()
    .addTable([
      [
        { data: 'File', header: true },
        { data: 'Line', header: true },
        { data: 'Rule', header: true }
      ],
      ...findings.map(f => [
        f.file,
        f.line.toString(),
        f.rule
      ])
    ])
    .addBreak()
    .addRaw('**Action Required:** Remove the detected secrets and push new commits.')
    .write();

  core.setFailed(`NetShield blocked: ${findings.length} secret(s) detected`);
}

export function reportSuccess(): void {
  core.info('✅ NetShield: No secrets detected');
  
  core.summary
    .addHeading('🛡️ NetShield: Passed', 2)
    .addRaw('No secrets detected in this pull request.')
    .write();
}
