/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { ToolCallRequestInfo, ToolCallResponseInfo, Config } from '../index.js';
import { CoreToolScheduler } from './coreToolScheduler.js';

/**
 * Executes a single tool call non-interactively by leveraging the CoreToolScheduler.
 */
export async function executeToolCall(
  config: Config,
  toolCallRequest: ToolCallRequestInfo,
  abortSignal?: AbortSignal,
): Promise<ToolCallResponseInfo> {
  return new Promise<ToolCallResponseInfo>((resolve, reject) => {
    const scheduler = new CoreToolScheduler({
      toolRegistry: config.getToolRegistry(),
      config,
      getPreferredEditor: () => undefined,
      onEditorClose: () => {},
      onAllToolCallsComplete: async (completedToolCalls) => {
        if (completedToolCalls.length !== 1) {
          reject(
            new Error(
              `Expected exactly one tool call to complete, but got ${
                completedToolCalls.length
              }.`,
            ),
          );
          return;
        }
        const completedCall = completedToolCalls[0];
        resolve(completedCall.response);
      },
    });

    const effectiveAbortSignal = abortSignal ?? new AbortController().signal;
    scheduler.schedule(toolCallRequest, effectiveAbortSignal).catch(reject);
  });
}
