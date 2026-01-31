"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanForSecrets = scanForSecrets;
const exec = __importStar(require("@actions/exec"));
const core = __importStar(require("@actions/core"));
const GITLEAKS_VERSION = '8.18.1';
async function installGitleaks() {
    core.info('Installing gitleaks...');
    const platform = process.platform === 'darwin' ? 'darwin' : 'linux';
    const arch = process.arch === 'arm64' ? 'arm64' : 'x64';
    const url = `https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/gitleaks_${GITLEAKS_VERSION}_${platform}_${arch}.tar.gz`;
    await exec.exec('curl', ['-sSL', url, '-o', 'gitleaks.tar.gz']);
    await exec.exec('tar', ['-xzf', 'gitleaks.tar.gz']);
    await exec.exec('chmod', ['+x', 'gitleaks']);
}
async function runGitleaks() {
    let output = '';
    let errorOutput = '';
    const options = {
        listeners: {
            stdout: (data) => {
                output += data.toString();
            },
            stderr: (data) => {
                errorOutput += data.toString();
            }
        },
        ignoreReturnCode: true
    };
    // Scan only the current diff
    const exitCode = await exec.exec('./gitleaks', [
        'detect',
        '--no-git',
        '--redact',
        '--report-format', 'json',
        '--report-path', 'gitleaks-report.json',
        '--verbose'
    ], options);
    // Gitleaks returns 1 when secrets are found
    if (exitCode === 0) {
        core.info('No secrets detected by gitleaks');
    }
    else if (exitCode === 1) {
        core.warning('Secrets detected by gitleaks');
    }
    else {
        throw new Error(`Gitleaks failed with exit code ${exitCode}: ${errorOutput}`);
    }
    return output;
}
async function parseGitleaksReport() {
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
    return report.map((finding) => ({
        file: finding.File || finding.file || 'unknown',
        line: finding.StartLine || finding.line || 0,
        match: finding.Secret ? '[REDACTED]' : finding.Match || '[REDACTED]',
        rule: finding.RuleID || finding.rule || 'unknown',
        commit: finding.Commit || finding.commit || 'HEAD'
    }));
}
async function scanForSecrets() {
    await installGitleaks();
    await runGitleaks();
    const findings = await parseGitleaksReport();
    return {
        findings,
        blocked: findings.length > 0
    };
}
//# sourceMappingURL=scanner.js.map