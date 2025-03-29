"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FileDown, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// Add import for AIProviderSelector
import { AIProviderSelector } from "@/components/ai-provider-selector";
import type { AIProviderId } from "@/lib/ai-providers";
import { generateCoverLetter } from "@/actions/coverLetter/generateLetter";

export default function CoverLetterPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    recipient: "",
    strengths: "",
    experience: "",
    motivation: "",
  });

  // Add state for selected AI provider
  const [selectedProvider, setSelectedProvider] =
    useState<AIProviderId>("OPENAI");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  // Update the handleGenerateCoverLetter function to include the selected provider
  const handleGenerateCoverLetter = () => {
    setIsGenerating(true);

    // Create FormData with all the cover letter information
    const formData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append("aiProvider", selectedProvider);

    // Submit the form data to the server action
    generateCoverLetter(formData)
      .then((result) => {
        if (result.error) {
          // Handle error
          console.error(result.error);
          // Show error message to user
        } else {
          // Show success and preview
          setShowPreview(true);
        }
      })
      .finally(() => {
        setIsGenerating(false);
      });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          AI Cover Letter Generator
        </h1>
        <p className="text-muted-foreground">
          Create a personalized cover letter for your job application
        </p>
      </div>

      <Tabs defaultValue="form" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="form">Cover Letter Form</TabsTrigger>
          <TabsTrigger value="preview" disabled={!showPreview}>
            Cover Letter Preview
          </TabsTrigger>
        </TabsList>
        <TabsContent value="form" className="space-y-6 pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Personal Information</h3>
                <p className="text-sm text-muted-foreground">
                  Enter your contact information for the cover letter header
                </p>
              </div>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="(123) 456-7890"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Job Information</h3>
                <p className="text-sm text-muted-foreground">
                  Enter details about the job you're applying for
                </p>
              </div>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                      id="company"
                      placeholder="Acme Inc."
                      value={formData.company}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      placeholder="Software Engineer"
                      value={formData.position}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient (Optional)</Label>
                  <Input
                    id="recipient"
                    placeholder="Hiring Manager or Specific Name"
                    value={formData.recipient}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template">Cover Letter Style</Label>
                  <Select defaultValue="professional">
                    <SelectTrigger>
                      <SelectValue placeholder="Select a style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                      <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Key Information for AI</h3>
                <p className="text-sm text-muted-foreground">
                  Provide details to help our AI create a personalized cover
                  letter
                </p>
              </div>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="strengths">Key Strengths & Skills</Label>
                  <Textarea
                    id="strengths"
                    placeholder="List your top skills and strengths relevant to this position"
                    className="min-h-[100px]"
                    value={formData.strengths}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Relevant Experience</Label>
                  <Textarea
                    id="experience"
                    placeholder="Briefly describe your most relevant experience for this role"
                    className="min-h-[100px]"
                    value={formData.experience}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motivation">Why This Company</Label>
                  <Textarea
                    id="motivation"
                    placeholder="Why are you interested in this company and position?"
                    className="min-h-[100px]"
                    value={formData.motivation}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2 mb-4">
                <h3 className="text-lg font-medium">AI Provider</h3>
                <p className="text-sm text-muted-foreground">
                  Select which AI model to use for generating your cover letter
                </p>
              </div>
              <RadioGroup defaultValue="openai" name="aiProvider">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="openai" id="openai-cl" />
                  <Label htmlFor="openai-cl">OpenAI (ChatGPT)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="modelslab" id="modelslab-cl" />
                  <Label htmlFor="modelslab-cl">ModelsLab</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center">
            <AIProviderSelector
              onProviderChange={(provider) => setSelectedProvider(provider)}
              className="w-[250px]"
            />
            <Button onClick={handleGenerateCoverLetter} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Cover Letter...
                </>
              ) : (
                <>Generate Cover Letter with AI</>
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
                    <h2 className="text-2xl font-bold">Your Cover Letter</h2>
                    <div className="flex space-x-4">
                      <Button variant="outline" size="sm">
                        <FileDown className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileDown className="h-4 w-4 mr-2" />
                        Download DOCX
                      </Button>
                    </div>
                  </div>

                  <div className="border p-8 rounded-lg bg-white text-black">
                    <div className="mb-8">
                      <div className="text-right mb-8">
                        <p className="font-bold">
                          {formData.name || "John Doe"}
                        </p>
                        <p>{formData.email || "john@example.com"}</p>
                        <p>{formData.phone || "(123) 456-7890"}</p>
                        <p>{new Date().toLocaleDateString()}</p>
                      </div>

                      <div className="mb-8">
                        <p>Dear {formData.recipient || "Hiring Manager"},</p>
                      </div>

                      <div className="space-y-4">
                        <p>
                          I am writing to express my interest in the{" "}
                          {formData.position || "Software Engineer"} position at{" "}
                          {formData.company || "Acme Inc."} as advertised. With
                          my background in software development and passion for
                          creating innovative solutions, I believe I would be a
                          valuable addition to your team.
                        </p>

                        <p>
                          {formData.experience
                            ? formData.experience
                            : "Throughout my career, I have developed strong skills in full-stack development, with particular expertise in React, Node.js, and cloud technologies. In my previous role at Tech Solutions Inc., I led the development of a web application that increased user engagement by 40% and reduced load times by 25%."}
                        </p>

                        <p>
                          {formData.strengths
                            ? formData.strengths
                            : "My technical skills include proficiency in JavaScript, TypeScript, React, Node.js, and AWS. Beyond technical abilities, I am a collaborative team player with excellent communication skills and a proven track record of delivering projects on time and within scope."}
                        </p>

                        <p>
                          {formData.motivation
                            ? formData.motivation
                            : `I am particularly drawn to ${
                                formData.company || "Acme Inc."
                              } because of your commitment to innovation and your impressive product portfolio. I have been following your company's growth and am excited about the opportunity to contribute to your continued success.`}
                        </p>

                        <p>
                          I would welcome the opportunity to discuss how my
                          skills and experience align with your needs. Thank you
                          for considering my application. I look forward to the
                          possibility of working with the talented team at{" "}
                          {formData.company || "Acme Inc."}.
                        </p>
                      </div>

                      <div className="mt-8">
                        <p>Sincerely,</p>
                        <p className="mt-4 font-bold">
                          {formData.name || "John Doe"}
                        </p>
                      </div>
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
