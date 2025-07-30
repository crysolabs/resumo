import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { type AIProviderId, getDefaultProvider } from "./ai-providers"

// ModelsLab API client (simplified implementation)
class ModelsLabClient {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    /**
     * Generate a response using the ModelsLab uncensored chat API
     * @param options.prompt The user message to send
     * @param options.systemPrompt Optional system prompt to set context
     * @param options.maxTokens Maximum number of tokens in the response (default: 1000)
     * @param options.previousMessages Optional previous conversation history
     * @returns The generated response text
     */
    async generateCompletion(options: {
        prompt: string;
        systemPrompt?: string;
        maxTokens?: number;
        previousMessages?: Array<{ role: string, content: string }>;
    }): Promise<string> {
        const { prompt, systemPrompt, maxTokens = 1000, previousMessages = [] } = options;

        // Construct messages array according to the API format
        const messages = [];

        // Add system message if provided
        if (systemPrompt) {
            messages.push({
                role: "system",
                content: systemPrompt
            });
        }

        // Add previous messages if any
        if (previousMessages.length > 0) {
            messages.push(...previousMessages);
        }

        // Add the current user prompt
        messages.push({
            role: "user",
            content: prompt
        });

        try {
            const response = await fetch("https://modelslab.com/api/v6/llm/uncensored_chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    key: this.apiKey,
                    messages: messages,
                    max_tokens: maxTokens
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`ModelsLab API error: ${response.status} - ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();

            if (data.status !== "success") {
                throw new Error(`ModelsLab API error: ${data.message || "Unknown error"}`);
            }

            return data.message;
        } catch (error) {
            console.error("Error calling ModelsLab API:", error);
            throw error;
        }
    }

    /**
     * Continue a conversation with the ModelsLab API
     * @param conversation Array of message objects with role and content
     * @param maxTokens Maximum number of tokens in the response
     * @returns The full API response including the new assistant message
     */
    async continueConversation(
        conversation: Array<{ role: string, content: string }>,
        maxTokens: number = 1000
    ): Promise<{
        message: string,
        conversation: Array<{ role: string, content: string }>
    }> {
        try {
            const response = await fetch("https://modelslab.com/api/v6/llm/uncensored_chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    key: this.apiKey,
                    messages: conversation,
                    max_tokens: maxTokens
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`ModelsLab API error: ${response.status} - ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();

            if (data.status !== "success") {
                throw new Error(`ModelsLab API error: ${data.message || "Unknown error"}`);
            }

            // Add the assistant's response to the conversation
            const updatedConversation = [...conversation, {
                role: "assistant",
                content: data.message
            }];

            return {
                message: data.message,
                conversation: updatedConversation
            };
        } catch (error) {
            console.error("Error continuing conversation with ModelsLab API:", error);
            throw error;
        }
    }
}

// Get ModelsLab client instance
function getModelsLabClient() {
    const apiKey = process.env.MODELSLAB_API_KEY
    if (!apiKey) {
        throw new Error("ModelsLab API key not found")
    }
    return new ModelsLabClient(apiKey)
}

// Generate text with the specified provider
export async function generateWithProvider({
    provider = getDefaultProvider(),
    prompt,
    systemPrompt,
    format,
}: {
    provider?: AIProviderId
    prompt: string
    systemPrompt?: string
    format?: "json" | "text"
}): Promise<string> {
    // Use OpenAI through AI SDK
    if (provider === "OPENAI") {
        const { text } = await generateText({
            model: openai("gpt-4o"),
            prompt,
            system: systemPrompt,
            // format: format as any,
        })
        return text
    }

    // Use ModelsLab
    if (provider === "MODELSLAB") {
        const client = getModelsLabClient()
        return await client.generateCompletion({
            prompt,
            systemPrompt,
            // format,
        })
    }

    throw new Error(`Unsupported AI provider: ${provider}`)
}

export const generateResumeContent = async (
    personalInfo: any,
    experiences: any[],
    education: any[],
    skills: string,
    provider?: AIProviderId,
) => {
    try {
        const prompt = `
      Create a professional resume for ${personalInfo.name} who is a ${personalInfo.title}.
      
      Personal Information:
      - Name: ${personalInfo.name}
      - Email: ${personalInfo.email}
      - Phone: ${personalInfo.phone}
      - Location: ${personalInfo.location}
      
      Professional Summary:
      ${personalInfo.summary}
      
      Work Experience:
      ${experiences
                .map(
                    (exp) => `
        - ${exp.title} at ${exp.company} (${exp.startDate} - ${exp.endDate})
        ${exp.description}
      `,
                )
                .join("\n")}
      
      Education:
      ${education
                .map(
                    (edu) => `
        - ${edu.degree} in ${edu.field} from ${edu.school} (${edu.startDate} - ${edu.endDate})
      `,
                )
                .join("\n")}
      
      Skills:
      ${skills}
      
      Please format this as a professional resume with clear sections and bullet points for achievements.
      Return the result as a JSON object with sections for summary, experience, education, and skills.
    `

        const text = await generateWithProvider({
            provider,
            prompt,
            systemPrompt: "You are a professional resume writer who creates compelling, ATS-friendly resumes.",
            // format: "json",
        })

        // const content = JSON.parse(text)
        const content = (text)

        // Calculate AI score based on content quality
        const aiScore = calculateAIScore(content)

        return { content, aiScore }
    } catch (error) {
        console.error("Error generating resume content:", error)
        throw new Error("Failed to generate resume content")
    }
}

export const generateCoverLetterContent = async (
    name: string,
    email: string,
    phone: string,
    company: string,
    position: string,
    recipient: string,
    strengths: string,
    experience: string,
    motivation: string,
    provider?: AIProviderId,
) => {
    try {
        const prompt = `
      Create a professional cover letter for ${name} who is applying for the ${position} position at ${company}.
      
      Personal Information:
      - Name: ${name}
      - Email: ${email}
      - Phone: ${phone}
      
      Recipient: ${recipient || "Hiring Manager"}
      
      Key Strengths:
      ${strengths}
      
      Relevant Experience:
      ${experience}
      
      Motivation for this company:
      ${motivation}
      
      Please format this as a professional cover letter with a proper greeting, introduction, body paragraphs highlighting qualifications, and a conclusion.
      Return the result as a JSON object with sections for greeting, introduction, body, and conclusion.
    `

        const text = await generateWithProvider({
            provider,
            prompt,
            systemPrompt: "You are a professional cover letter writer who creates compelling, personalized cover letters.",
            format: "json",
        })

        return JSON.parse(text)
    } catch (error) {
        console.error("Error generating cover letter content:", error)
        throw new Error("Failed to generate cover letter content")
    }
}

// Helper function to calculate AI score based on content quality
const calculateAIScore = (content: any) => {
    let score = 0

    // Check for comprehensive summary
    if (content.summary && content.summary.length > 100) {
        score += 20
    } else if (content.summary) {
        score += 10
    }
    console.log({content})
    // Check for quantifiable achievements in experience
    const experienceText = JSON.stringify(content)
    if (experienceText.match(/increased|improved|reduced|achieved|led|managed|created/gi)) {
        score += 20
    }

    // Check for numbers/percentages in experience
    if (experienceText.match(/\d+%|\d+ percent|\d+ times/gi)) {
        score += 20
    }

    // Check for skills relevance
    if (content.skills && content.skills.length > 5) {
        score += 20
    } else if (content.skills) {
        score += 10
    }

    // Check for education details
    if (content.education && JSON.stringify(content.education).length > 50) {
        score += 20
    } else if (content.education) {
        score += 10
    }

    return Math.min(score, 100) // Cap at 100
}

