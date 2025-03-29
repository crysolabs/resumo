"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  type AIProviderId,
  AI_PROVIDERS,
  getDefaultProvider,
} from "@/lib/ai-providers";

interface AIProviderSelectorProps {
  onProviderChange: (provider: AIProviderId) => void;
  defaultProvider?: AIProviderId;
  className?: string;
}

export function AIProviderSelector({
  onProviderChange,
  defaultProvider = getDefaultProvider(),
  className,
}: AIProviderSelectorProps) {
  const [availableProviders, setAvailableProviders] = useState<
    Array<(typeof AI_PROVIDERS)[AIProviderId]>
  >([]);
  const [selectedProvider, setSelectedProvider] =
    useState<AIProviderId>(defaultProvider);

  useEffect(() => {
    // Fetch available providers
    const fetchProviders = async () => {
      try {
        const providers = await fetch("/api/ai/providers").then((res) =>
          res.json()
        );
        setAvailableProviders(providers);
      } catch (error) {
        console.error("Failed to fetch AI providers:", error);
        // Fallback to default providers
        setAvailableProviders([AI_PROVIDERS.OPENAI]);
      }
    };

    fetchProviders();
  }, []);

  const handleProviderChange = (value: string) => {
    const provider = value as AIProviderId;
    setSelectedProvider(provider);
    onProviderChange(provider);
  };

  if (availableProviders.length <= 1) {
    return null; // Don't show selector if only one provider is available
  }

  return (
    <div className={className}>
      <Label htmlFor="ai-provider">AI Provider</Label>
      <Select value={selectedProvider} onValueChange={handleProviderChange}>
        <SelectTrigger id="ai-provider">
          <SelectValue placeholder="Select AI provider" />
        </SelectTrigger>
        <SelectContent>
          {availableProviders.map((provider) => (
            <SelectItem key={provider.id} value={provider.id}>
              {provider.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
