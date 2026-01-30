import * as exec from '@actions/exec';
import * as core from '@actions/core';
import { SecretFinding, ScanResult } from './types';

const GITLEAKS_VERSION = '8.18.1';

async function installGitleaks(): Promise<void> {
  core.info('Installing gitleaks...');
  
  const platform = process.platform === 'darwin' ? 'darwin' : 'linux';
  const arch = process.arch === 'arm64' ? 'arm64' : 'x64';
  const url = `https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/gitleaks_${GITLEAKS_VERSION}_${platform}_${arch}.tar.gz`;
  
  await exec.exec('curl', ['-sSL', url, '-o', 'gitleaks.tar.gz']);
  await exec.exec('tar', ['-xzf', 'gitleaks.tar.gz']);
  await exec.exec('chmod', ['+x', 'gitleaks']);
}

async function runGitleaks(): Promise<string> {
  let output = '';
  let errorOutput = '';

  const options = {
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString();
      },
      stderr: (data: Buffer) => {
        errorOutput += data.toString();
      }
    },
    ignoreReturnCode: true
  };

  // Scan only the current diff
  const exitCode = await exec.exec(
    './gitleaks',
    [
      'detect',
      '--no-git',
      '--redact',
      '--report-format', 'json',
      '--report-path', 'gitleaks-report.json',
      '--verbose'
    ],
    options
  );

  // Gitleaks returns 1 when secrets are found
  if (exitCode === 0) {
    core.info('No secrets detected by gitleaks');
  } else if (exitCode === 1) {
    core.warning('Secrets detected by gitleaks');
  } else {
    throw new Error(`Gitleaks failed with exit code ${exitCode}: ${errorOutput}`);
  }

  return output;
}

async function parseGitleaksReport(): Promise<SecretFinding[]> {
  const fs = require('fs');
  
  if (!fs.existsSync('gitleaks-report.json')) {
    return [];
  }

  const reportContent = fs.readFileSync('gitleaks-report.json', 'utf8');
  
  if (!reportContent.trim()) {
    return [];
  }

  const report = JSON.parse(reportContent);
  
  if (!Array.isArray(report) || report.length === 0) {
    return [];
  }

  return report.map((finding: any) => ({
    file: finding.File || finding.file || 'unknown',
    line: finding.StartLine || finding.line || 0,
    match: finding.Secret ? '[REDACTED]' : finding.Match || '[REDACTED]',
    rule: finding.RuleID || finding.rule || 'unknown',
    commit: finding.Commit || finding.commit || 'HEAD'
  }));
}

export async function scanForSecrets(): Promise<ScanResult> {
  await installGitleaks();
  await runGitleaks();
  const findings = await parseGitleaksReport();

  return {
    findings,
    blocked: findings.length > 0
  };
}
