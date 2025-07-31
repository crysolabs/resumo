// Interface for AI provider configuration
export interface AIProviderConfig {
    name: string
    id: string
    apiKeyEnvVar?: string
    endpointEnvVar?: string
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
    OLLAMA: {
        name: "Ollama",
        id: "ollama",
        endpointEnvVar: "OLLAMA_API_ENDPOINT",
    },
} as const

// Type for provider IDs
export type AIProviderId = keyof typeof AI_PROVIDERS

// Function to check if an API key/endpoint is available for a provider
export function isProviderAvailable(providerId: AIProviderId): boolean {
    const provider = AI_PROVIDERS[providerId]

    // For Ollama, check if endpoint is configured
    if (providerId === "OLLAMA" && "endpointEnvVar" in provider) {
        return !!process.env[provider.endpointEnvVar]
    }

    // For other providers, check API key
    if ("apiKeyEnvVar" in provider) {
        return !!process.env[provider.apiKeyEnvVar]
    }

    return false
}

// Get all available providers (those with API keys/endpoints configured)
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
    // Check if Ollama is available
    if (isProviderAvailable("OLLAMA")) {
        return "OLLAMA"
    }
    // Fall back to OpenAI
    if (isProviderAvailable("OPENAI")) {
        return "OPENAI"
    }
    // If none are available, default to OpenAI (will likely fail at runtime)
    return "OPENAI"
}
