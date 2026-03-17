import { readFileSync } from 'fs';
import { join } from 'path';

export function loadAgentPrompt(): string {
  try {
    const promptPath = join(process.cwd(), 'AGENT_PROMPT.md');
    const prompt = readFileSync(promptPath, 'utf-8');
    return prompt;
  } catch (error) {
    console.error('Error loading agent prompt:', error);
    return 'You are a helpful customer support assistant.';
  }
}
