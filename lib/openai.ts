import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const generateResumeContent = async (
  personalInfo: any,
  experiences: any[],
  education: any[],
  skills: string,
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

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional resume writer who creates compelling, ATS-friendly resumes.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    })

    const content = JSON.parse(response.choices[0].message.content || "{}")

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

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional cover letter writer who creates compelling, personalized cover letters.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    })

    return JSON.parse(response.choices[0].message.content || "{}")
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

