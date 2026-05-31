/**
 * Cognigy REST API client wrapper.
 * Provides a configured instance of the official Cognigy client.
 */

import { RestAPIClient } from "@cognigy/rest-api-client";
import type { Config } from "./config.js";

export type CognigyClient = ReturnType<typeof createCognigyClient>;

export function createCognigyClient(config: Config) {
  const client = new RestAPIClient({
    baseUrl: config.cognigyBaseUrl,
  });

  client.setCredentials({
    type: "ApiKey",
    apiKey: config.cognigyApiKey,
  });

  return client;
}
