"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FileDown, Loader2, Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AIProviderSelector } from "@/components/ai-provider-selector";
import type { AIProviderId } from "@/lib/ai-providers";
import { generateResume } from "@/lib/actions";

export default function ResumeBuilderPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [isDownloading, setIsDownloading] = useState({
    pdf: false,
    docx: false,
  });

  // Form state
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    title: "",
    summary: "",
  });

  const [experiences, setExperiences] = useState([
    { company: "", title: "", startDate: "", endDate: "", description: "" },
  ]);

  const [education, setEducation] = useState([
    { school: "", degree: "", field: "", startDate: "", endDate: "" },
  ]);

  const [skills, setSkills] = useState("");

  // Add state for selected AI provider
  const [selectedProvider, setSelectedProvider] =
    useState<AIProviderId>("MODELSLAB");

  const handleGenerateResume = async () => {
    setIsGenerating(true);

    // Submit the form data to the server action
    await generateResume({
      personalInfo,
      experiences,
      education,
      skills,
      selectedProvider,
    })
      .then((result) => {
        if (result.error) {
          // Handle error
          console.error(result.error);
          // Show error message to user
        } else {
          // Show success and preview
          // setResumeData(result.data);
          setShowPreview(true);
        }
      })
      .finally(() => {
        setIsGenerating(false);
      });
  };

  const addExperience = () => {
    setExperiences([
      ...experiences,
      { company: "", title: "", startDate: "", endDate: "", description: "" },
    ]);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    setEducation([
      ...education,
      { school: "", degree: "", field: "", startDate: "", endDate: "" },
    ]);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  // Function to download resume as PDF
  const handleDownloadPDF = async () => {
    setIsDownloading((prev) => ({ ...prev, pdf: true }));

    try {
      // Create the data to send
      const downloadData = {
        personalInfo,
        experiences,
        education,
        skills,
        format: "pdf",
      };

      // Make API call to server to generate PDF
      const response = await fetch("/api/download-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(downloadData),
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element and trigger download
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `${personalInfo.name || "Resume"}_CV.pdf`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      // Show error message to user
    } finally {
      setIsDownloading((prev) => ({ ...prev, pdf: false }));
    }
  };

  // Function to download resume as DOCX
  const handleDownloadDOCX = async () => {
    setIsDownloading((prev) => ({ ...prev, docx: true }));

    try {
      // Create the data to send
      const downloadData = {
        personalInfo,
        experiences,
        education,
        skills,
        format: "docx",
      };

      // Make API call to server to generate DOCX
      const response = await fetch("/api/download-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(downloadData),
      });

      if (!response.ok) {
        throw new Error("Failed to generate DOCX");
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element and trigger download
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `${personalInfo.name || "Resume"}_CV.docx`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading DOCX:", error);
      // Show error message to user
    } finally {
      setIsDownloading((prev) => ({ ...prev, docx: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Resume Builder</h1>
        <p className="text-muted-foreground">
          Fill in your details and let our AI create a professional resume for
          you
        </p>
      </div>

      <Tabs defaultValue="form" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="form">Resume Form</TabsTrigger>
          <TabsTrigger value="preview" disabled={!showPreview}>
            Resume Preview
          </TabsTrigger>
        </TabsList>
        <TabsContent value="form" className="space-y-6 pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Personal Information</h3>
                <p className="text-sm text-muted-foreground">
                  Enter your basic information for the resume header
                </p>
              </div>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={personalInfo.name}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Professional Title</Label>
                    <Input
                      id="title"
                      placeholder="Software Engineer"
                      value={personalInfo.title}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          title: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={personalInfo.email}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      placeholder="(123) 456-7890"
                      value={personalInfo.phone}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="New York, NY"
                      value={personalInfo.location}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          location: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template">Resume Template</Label>
                    <Select defaultValue="professional">
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">
                          Professional
                        </SelectItem>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="creative">Creative</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="summary">Professional Summary</Label>
                  <Textarea
                    id="summary"
                    placeholder="A brief summary of your professional background and goals"
                    className="min-h-[100px]"
                    value={personalInfo.summary}
                    onChange={(e) =>
                      setPersonalInfo({
                        ...personalInfo,
                        summary: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium">Work Experience</h3>
                  <p className="text-sm text-muted-foreground">
                    Add your relevant work experience
                  </p>
                </div>
                <Button onClick={addExperience} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              </div>

              {experiences.map((exp, index) => (
                <div key={index} className="border rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Experience {index + 1}</h4>
                    {experiences.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExperience(index)}
                        className="text-destructive hover:text-destructive/90"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`company-${index}`}>Company</Label>
                        <Input
                          id={`company-${index}`}
                          placeholder="Company Name"
                          value={exp.company}
                          onChange={(e) => {
                            const newExperiences = [...experiences];
                            newExperiences[index].company = e.target.value;
                            setExperiences(newExperiences);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`title-${index}`}>Job Title</Label>
                        <Input
                          id={`title-${index}`}
                          placeholder="Job Title"
                          value={exp.title}
                          onChange={(e) => {
                            const newExperiences = [...experiences];
                            newExperiences[index].title = e.target.value;
                            setExperiences(newExperiences);
                          }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`start-date-${index}`}>
                          Start Date
                        </Label>
                        <Input
                          id={`start-date-${index}`}
                          placeholder="MM/YYYY"
                          value={exp.startDate}
                          onChange={(e) => {
                            const newExperiences = [...experiences];
                            newExperiences[index].startDate = e.target.value;
                            setExperiences(newExperiences);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`end-date-${index}`}>End Date</Label>
                        <Input
                          id={`end-date-${index}`}
                          placeholder="MM/YYYY or Present"
                          value={exp.endDate}
                          onChange={(e) => {
                            const newExperiences = [...experiences];
                            newExperiences[index].endDate = e.target.value;
                            setExperiences(newExperiences);
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`description-${index}`}>
                        Description
                      </Label>
                      <Textarea
                        id={`description-${index}`}
                        placeholder="Describe your responsibilities and achievements"
                        className="min-h-[100px]"
                        value={exp.description}
                        onChange={(e) => {
                          const newExperiences = [...experiences];
                          newExperiences[index].description = e.target.value;
                          setExperiences(newExperiences);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium">Education</h3>
                  <p className="text-sm text-muted-foreground">
                    Add your educational background
                  </p>
                </div>
                <Button onClick={addEducation} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Education
                </Button>
              </div>

              {education.map((edu, index) => (
                <div key={index} className="border rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Education {index + 1}</h4>
                    {education.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEducation(index)}
                        className="text-destructive hover:text-destructive/90"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`school-${index}`}>
                        School/University
                      </Label>
                      <Input
                        id={`school-${index}`}
                        placeholder="University Name"
                        value={edu.school}
                        onChange={(e) => {
                          const newEducation = [...education];
                          newEducation[index].school = e.target.value;
                          setEducation(newEducation);
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`degree-${index}`}>Degree</Label>
                        <Input
                          id={`degree-${index}`}
                          placeholder="Bachelor's, Master's, etc."
                          value={edu.degree}
                          onChange={(e) => {
                            const newEducation = [...education];
                            newEducation[index].degree = e.target.value;
                            setEducation(newEducation);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`field-${index}`}>Field of Study</Label>
                        <Input
                          id={`field-${index}`}
                          placeholder="Computer Science, Business, etc."
                          value={edu.field}
                          onChange={(e) => {
                            const newEducation = [...education];
                            newEducation[index].field = e.target.value;
                            setEducation(newEducation);
                          }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`edu-start-date-${index}`}>
                          Start Date
                        </Label>
                        <Input
                          id={`edu-start-date-${index}`}
                          placeholder="MM/YYYY"
                          value={edu.startDate}
                          onChange={(e) => {
                            const newEducation = [...education];
                            newEducation[index].startDate = e.target.value;
                            setEducation(newEducation);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edu-end-date-${index}`}>
                          End Date
                        </Label>
                        <Input
                          id={`edu-end-date-${index}`}
                          placeholder="MM/YYYY or Present"
                          value={edu.endDate}
                          onChange={(e) => {
                            const newEducation = [...education];
                            newEducation[index].endDate = e.target.value;
                            setEducation(newEducation);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2 mb-4">
                <h3 className="text-lg font-medium">Skills</h3>
                <p className="text-sm text-muted-foreground">
                  List your relevant skills (separated by commas)
                </p>
              </div>
              <div className="space-y-2">
                <Textarea
                  id="skills"
                  placeholder="JavaScript, React, Node.js, Project Management, Communication, etc."
                  className="min-h-[100px]"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2 mb-4">
                <h3 className="text-lg font-medium">AI Provider</h3>
                <p className="text-sm text-muted-foreground">
                  Select which AI model to use for generating your resume
                </p>
              </div>
              <RadioGroup defaultValue="openai" name="aiProvider">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="openai" id="openai" />
                  <Label htmlFor="openai">OpenAI (ChatGPT)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="modelslab" id="modelslab" />
                  <Label htmlFor="modelslab">ModelsLab</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center">
            <AIProviderSelector
              onProviderChange={(provider) => setSelectedProvider(provider)}
              className="w-[250px]"
            />
            <Button onClick={handleGenerateResume} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Resume...
                </>
              ) : (
                <>Generate Resume with AI</>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="pt-4">
          {showPreview && (
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">
                      {personalInfo.name || "John Doe"}
                    </h2>
                    <div className="flex space-x-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadPDF}
                        disabled={isDownloading.pdf}
                      >
                        {isDownloading.pdf ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <FileDown className="h-4 w-4 mr-2" />
                        )}
                        Download PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadDOCX}
                        disabled={isDownloading.docx}
                      >
                        {isDownloading.docx ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <FileDown className="h-4 w-4 mr-2" />
                        )}
                        Download DOCX
                      </Button>
                    </div>
                  </div>

                  <div className="border p-8 rounded-lg bg-white text-black">
                    <div className="text-center mb-6">
                      <h1 className="text-3xl font-bold">
                        {personalInfo.name || "John Doe"}
                      </h1>
                      <p className="text-lg">
                        {personalInfo.title || "Software Engineer"}
                      </p>
                      <div className="flex justify-center space-x-4 mt-2 text-sm">
                        <span>{personalInfo.email || "john@example.com"}</span>
                        <span>|</span>
                        <span>{personalInfo.phone || "(123) 456-7890"}</span>
                        <span>|</span>
                        <span>{personalInfo.location || "New York, NY"}</span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h2 className="text-lg font-bold border-b pb-1 mb-2">
                        Professional Summary
                      </h2>
                      <p className="text-sm">
                        {personalInfo.summary ||
                          "Experienced software engineer with a passion for developing innovative solutions that deliver exceptional user experiences. Skilled in JavaScript, React, and Node.js, with a strong background in building scalable web applications."}
                      </p>
                    </div>

                    <div className="mb-6">
                      <h2 className="text-lg font-bold border-b pb-1 mb-2">
                        Experience
                      </h2>
                      {experiences.map((exp, index) => (
                        <div key={index} className="mb-4">
                          <div className="flex justify-between">
                            <h3 className="font-bold">
                              {exp.title || "Senior Software Engineer"}
                            </h3>
                            <span className="text-sm">
                              {exp.startDate || "01/2020"} -{" "}
                              {exp.endDate || "Present"}
                            </span>
                          </div>
                          <p className="font-medium">
                            {exp.company || "Tech Company Inc."}
                          </p>
                          <p className="text-sm mt-1">
                            {exp.description ||
                              "Led development of a web application that increased user engagement by 40%. Collaborated with cross-functional teams to implement new features and improve existing functionality."}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mb-6">
                      <h2 className="text-lg font-bold border-b pb-1 mb-2">
                        Education
                      </h2>
                      {education.map((edu, index) => (
                        <div key={index} className="mb-2">
                          <div className="flex justify-between">
                            <h3 className="font-bold">
                              {edu.degree || "Bachelor of Science"} in{" "}
                              {edu.field || "Computer Science"}
                            </h3>
                            <span className="text-sm">
                              {edu.startDate || "09/2016"} -{" "}
                              {edu.endDate || "05/2020"}
                            </span>
                          </div>
                          <p>{edu.school || "University of Technology"}</p>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h2 className="text-lg font-bold border-b pb-1 mb-2">
                        Skills
                      </h2>
                      <p className="text-sm">
                        {skills ||
                          "JavaScript, React, Node.js, TypeScript, HTML, CSS, Git, Agile, REST APIs, MongoDB, SQL, AWS, Docker, CI/CD, Problem Solving, Team Collaboration"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
