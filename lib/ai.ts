import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { type AIProviderId, getDefaultProvider } from "./ai-providers"

// ModelsLab API client (simplified implementation)
class ModelsLabClient {
    private apiKey: string

    constructor(apiKey: string) {
        this.apiKey = apiKey
    }

    async generateCompletion(options: {
        prompt: string
        systemPrompt?: string
        format?: string
    }) {
        const { prompt, systemPrompt, format } = options

        const response = await fetch("https://api.modelslab.com/v1/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: "modelslab-latest",
                prompt,
                system: systemPrompt,
                response_format: format === "json" ? { type: "json_object" } : undefined,
                max_tokens: 2000,
            }),
        })

        if (!response.ok) {
            throw new Error(`ModelsLab API error: ${response.status}`)
        }

        const data = await response.json()
        return data.choices[0].text
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
            format,
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
            format: "json",
        })

        const content = JSON.parse(text)

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

    // Check for quantifiable achievements in experience
    const experienceText = JSON.stringify(content.experience)
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

