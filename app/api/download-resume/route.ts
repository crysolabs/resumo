// File: app/api/download-resume/route.ts
import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

interface PersonalInfo {
    name?: string;
    title?: string;
    email?: string;
    phone?: string;
    location?: string;
    summary?: string;
}

interface Experience {
    title?: string;
    company?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
}

interface Education {
    degree?: string;
    field?: string;
    school?: string;
    startDate?: string;
    endDate?: string;
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { personalInfo, experiences, education, skills, format }: {
            personalInfo: PersonalInfo;
            experiences: Experience[];
            education: Education[];
            skills: string;
            format: string;
        } = data;

        let buffer: Buffer;

        if (format === 'pdf') {
            buffer = await generatePDF(personalInfo, experiences, education, skills);
            return new NextResponse(buffer, {
                status: 200,
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="${personalInfo.name || 'Resume'}_CV.pdf"`
                }
            });
        } else if (format === 'docx') {
            buffer = await generateDOCX(personalInfo, experiences, education, skills);
            return new NextResponse(buffer, {
                status: 200,
                headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'Content-Disposition': `attachment; filename="${personalInfo.name || 'Resume'}_CV.docx"`
                }
            });
        } else {
            return new NextResponse(JSON.stringify({ error: 'Invalid format requested' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (error) {
        console.error('Error processing download request:', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to generate document' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Function to generate PDF
async function generatePDF(personalInfo: PersonalInfo, experiences: Experience[], education: Education[], skills: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        // Create a buffer to store PDF data
        const buffers: Buffer[] = [];
        const doc = new PDFDocument({ margin: 50 });

        // Direct output to buffers
        doc.on('data', (chunk: Buffer) => buffers.push(chunk));
        doc.on('end', () => {
            const buffer = Buffer.concat(buffers);
            resolve(buffer);
        });
        doc.on('error', reject);

        // Header/Contact information
        doc.fontSize(24).text(personalInfo.name || 'John Doe', { align: 'center' });
        doc.fontSize(14).text(personalInfo.title || 'Professional Title', { align: 'center' });

        doc.moveDown();
        const contactText = [
            personalInfo.email || 'email@example.com',
            personalInfo.phone || '(123) 456-7890',
            personalInfo.location || 'City, State'
        ].join(' | ');
        doc.fontSize(10).text(contactText, { align: 'center' });

        // Professional Summary
        doc.moveDown();
        doc.fontSize(16).text('Professional Summary', { underline: true });
        doc.fontSize(10).text(personalInfo.summary || 'Professional with experience in the industry.');

        // Experience
        doc.moveDown(2);
        doc.fontSize(16).text('Experience', { underline: true });
        experiences.forEach((exp) => {
            doc.moveDown();
            doc.fontSize(12).font('Helvetica-Bold').text(exp.title || 'Job Title');
            doc.fontSize(10).font('Helvetica').text(`${exp.company || 'Company'} | ${exp.startDate || 'Start Date'} - ${exp.endDate || 'End Date'}`);
            doc.fontSize(10).text(exp.description || 'Job description');
        });

        // Education
        doc.moveDown(2);
        doc.fontSize(16).text('Education', { underline: true });
        education.forEach((edu) => {
            doc.moveDown();
            doc.fontSize(12).font('Helvetica-Bold').text(`${edu.degree || 'Degree'} in ${edu.field || 'Field'}`);
            doc.fontSize(10).font('Helvetica').text(`${edu.school || 'School'} | ${edu.startDate || 'Start Date'} - ${edu.endDate || 'End Date'}`);
        });

        // Skills
        doc.moveDown(2);
        doc.fontSize(16).text('Skills', { underline: true });
        doc.fontSize(10).text(skills || 'Skills list');

        doc.end();
    });
}

// Function to generate DOCX using the modern 'docx' package
async function generateDOCX(personalInfo: PersonalInfo, experiences: Experience[], education: Education[], skills: string): Promise<Buffer> {
    try {
        // Create document sections
        const children: Paragraph[] = [];

        // Header with name and title
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: personalInfo.name || 'John Doe',
                        bold: true,
                        size: 48, // 24pt in half-points
                    }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: personalInfo.title || 'Professional Title',
                        size: 28, // 14pt in half-points
                    }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
            })
        );

        // Contact information
        const contactText = [
            personalInfo.email || 'email@example.com',
            personalInfo.phone || '(123) 456-7890',
            personalInfo.location || 'City, State'
        ].join(' | ');

        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: contactText,
                        size: 20, // 10pt in half-points
                    }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
            })
        );

        // Professional Summary
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'Professional Summary',
                        bold: true,
                        size: 32, // 16pt in half-points
                        underline: {},
                    }),
                ],
                spacing: { before: 400, after: 200 },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: personalInfo.summary || 'Professional with experience in the industry.',
                        size: 20, // 10pt in half-points
                    }),
                ],
                spacing: { after: 400 },
            })
        );

        // Experience
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'Experience',
                        bold: true,
                        size: 32, // 16pt in half-points
                        underline: {},
                    }),
                ],
                spacing: { before: 400, after: 200 },
            })
        );

        experiences.forEach((exp) => {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: exp.title || 'Job Title',
                            bold: true,
                            size: 24, // 12pt in half-points
                        }),
                    ],
                    spacing: { before: 200, after: 100 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `${exp.company || 'Company'} | ${exp.startDate || 'Start Date'} - ${exp.endDate || 'End Date'}`,
                            size: 20, // 10pt in half-points
                        }),
                    ],
                    spacing: { after: 100 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: exp.description || 'Job description',
                            size: 20, // 10pt in half-points
                        }),
                    ],
                    spacing: { after: 200 },
                })
            );
        });

        // Education
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'Education',
                        bold: true,
                        size: 32, // 16pt in half-points
                        underline: {},
                    }),
                ],
                spacing: { before: 400, after: 200 },
            })
        );

        education.forEach((edu) => {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `${edu.degree || 'Degree'} in ${edu.field || 'Field'}`,
                            bold: true,
                            size: 24, // 12pt in half-points
                        }),
                    ],
                    spacing: { before: 200, after: 100 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `${edu.school || 'School'} | ${edu.startDate || 'Start Date'} - ${edu.endDate || 'End Date'}`,
                            size: 20, // 10pt in half-points
                        }),
                    ],
                    spacing: { after: 200 },
                })
            );
        });

        // Skills
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'Skills',
                        bold: true,
                        size: 32, // 16pt in half-points
                        underline: {},
                    }),
                ],
                spacing: { before: 400, after: 200 },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: skills || 'Skills list',
                        size: 20, // 10pt in half-points
                    }),
                ],
                spacing: { after: 200 },
            })
        );

        // Create the document
        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: children,
                },
            ],
        });

        // Generate buffer
        const buffer = await Packer.toBuffer(doc);
        return buffer;

    } catch (error) {
        console.error('Error generating DOCX:', error);
        throw new Error('Failed to generate DOCX document');
    }
}