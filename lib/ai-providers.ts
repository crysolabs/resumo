// Interface for AI provider configuration
export interface AIProviderConfig {
    name: string
    id: string
    apiKeyEnvVar: string
}

// Available AI providers
export const AI_PROVIDERS = {
    OPENAI: {
        name: "ChatGPT",
        id: "openai",
        apiKeyEnvVar: "OPENAI_API_KEY",
    },
    MODELSLAB: {
        name: "ModelsLab",
        id: "modelslab",
        apiKeyEnvVar: "MODELSLAB_API_KEY",
    },
} as const

// Type for provider IDs
export type AIProviderId = keyof typeof AI_PROVIDERS

// Function to check if an API key is available for a provider
export function isProviderAvailable(providerId: AIProviderId): boolean {
    const provider = AI_PROVIDERS[providerId]
    return !!process.env[provider.apiKeyEnvVar]
}

// Get all available providers (those with API keys configured)
export function getAvailableProviders(): Array<(typeof AI_PROVIDERS)[AIProviderId]> {
    return (Object.keys(AI_PROVIDERS) as Array<AIProviderId>)
        .filter((id) => isProviderAvailable(id))
        .map((id) => AI_PROVIDERS[id])
}

// Default provider selection logic
export function getDefaultProvider(): AIProviderId {
    // Check if ModelsLab is available, use it as first choice
    if (isProviderAvailable("MODELSLAB")) {
        return "MODELSLAB"
    }
    // Fall back to OpenAI
    if (isProviderAvailable("OPENAI")) {
        return "OPENAI"
    }
    // If neither is available, default to OpenAI (will likely fail at runtime)
    return "OPENAI"
}

