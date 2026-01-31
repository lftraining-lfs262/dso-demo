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
exports.annotateFindings = annotateFindings;
exports.reportSuccess = reportSuccess;
const core = __importStar(require("@actions/core"));
async function annotateFindings(findings) {
    if (findings.length === 0) {
        return;
    }
    // Add annotations using GitHub Actions annotations
    for (const finding of findings) {
        core.error(`Secret detected: ${finding.rule}`, {
            file: finding.file,
            startLine: finding.line,
            title: '🛡️ NetShield: Secret Detected'
        });
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
function reportSuccess() {
    core.info('✅ NetShield: No secrets detected');
    core.summary
        .addHeading('🛡️ NetShield: Passed', 2)
        .addRaw('No secrets detected in this pull request.')
        .write();
}
//# sourceMappingURL=annotator.js.map