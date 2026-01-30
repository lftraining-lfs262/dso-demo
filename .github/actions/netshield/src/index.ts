import * as core from '@actions/core';
import * as github from '@actions/github';
import { scanForSecrets } from './scanner';
import { annotateFindings, reportSuccess } from './annotator';

async function run(): Promise<void> {
  try {
    // Enforce PR-only execution
    if (github.context.eventName !== 'pull_request' && github.context.eventName !== 'pull_request_target') {
      core.setFailed('NetShield only runs on pull requests');
      return;
    }

    core.info('🛡️ NetShield: Starting secrets scan...');
    core.info(`Event: ${github.context.eventName}`);
    core.info(`PR: #${github.context.payload.pull_request?.number}`);

    // Run the scan
    const result = await scanForSecrets();

    // Handle results
    if (result.blocked) {
      core.warning(`Found ${result.findings.length} secret(s)`);
      await annotateFindings(result.findings);
      // annotateFindings already calls setFailed
    } else {
      reportSuccess();
    }

  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(`NetShield failed: ${error.message}`);
    } else {
      core.setFailed('NetShield failed with unknown error');
    }
  }
}

run();
