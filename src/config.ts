/**
 * Configuration module for the Cognigy MCP server.
 * Reads environment variables and provides typed config.
 */

export interface Config {
  cognigyBaseUrl: string;
  cognigyApiKey: string;
  defaultProjectId?: string;
}

function getEnvVar(name: string, required: true): string;
function getEnvVar(name: string, required: false): string | undefined;
function getEnvVar(name: string, required: boolean): string | undefined {
  const value = process.env[name];
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function loadConfig(): Config {
  return {
    cognigyBaseUrl: getEnvVar("COGNIGY_BASE_URL", true),
    cognigyApiKey: getEnvVar("COGNIGY_API_KEY", true),
    defaultProjectId: getEnvVar("COGNIGY_DEFAULT_PROJECT_ID", false),
  };
}
