export function AiTips() {
  const tips = [
    "Add more quantifiable achievements to your experience section",
    "Include relevant keywords from job descriptions to pass ATS systems",
    "Improve your skills section with more technical competencies",
    "Add a professional summary that highlights your unique value",
    "Use action verbs to start bullet points in your experience section",
  ]

  return (
    <div className="space-y-4">
      {tips.map((tip, index) => (
        <div key={index} className="flex items-start space-x-3">
          <div className="mt-0.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-primary"
            >
              <path d="m8 12 2 2 4-4" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <p className="text-sm">{tip}</p>
        </div>
      ))}
    </div>
  )
}

