import Link from "next/link"
import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"

interface RecentActivityProps {
  resumes: any[]
  coverLetters: any[]
}

export function RecentActivity({ resumes, coverLetters }: RecentActivityProps) {
  if (resumes.length === 0 && coverLetters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <FileText className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No documents yet</h3>
        <p className="text-sm text-muted-foreground mb-4">Create your first resume or cover letter to get started</p>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/dashboard/resume-builder">Create Resume</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/cover-letter">Create Cover Letter</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {resumes.map((resume) => (
        <div key={resume.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="rounded-full bg-primary/10 p-2">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{resume.title}</p>
              <p className="text-xs text-muted-foreground">
                Updated {formatDate(resume.updatedAt)} • {resume.downloads || 0} downloads
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/dashboard/resume-builder/${resume.id}`}>
                <span className="sr-only">Edit</span>
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
                  className="h-4 w-4"
                >
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
              </Link>
            </Button>
          </div>
        </div>
      ))}

      {coverLetters.map((letter) => (
        <div key={letter.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="rounded-full bg-primary/10 p-2">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{letter.title}</p>
              <p className="text-xs text-muted-foreground">
                Updated {formatDate(letter.updatedAt)} • {letter.downloads || 0} downloads
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/dashboard/cover-letter/${letter.id}`}>
                <span className="sr-only">Edit</span>
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
                  className="h-4 w-4"
                >
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
              </Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

