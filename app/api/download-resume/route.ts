// File: app/api/download-resume/route.ts
import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
declare module 'officegen' {
    const officegen: (type: string) => any;
    export default officegen;
}
import officegen from 'officegen';
import { Readable } from 'stream';
export async function POST(request) {
    try {
        const data = await request.json();
        const { personalInfo, experiences, education, skills, format } = data;

        let buffer;

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
async function generatePDF(personalInfo, experiences, education, skills) {
    return new Promise((resolve, reject) => {
        // Create a buffer to store PDF data
        const buffers = [];
        const doc = new PDFDocument({ margin: 50 });

        // Direct output to buffers
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const buffer = Buffer.concat(buffers);
            resolve(buffer);
        });

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

// Function to generate DOCX
async function generateDOCX(personalInfo, experiences, education, skills) {
    return new Promise((resolve, reject) => {
        // Create a new docx document
        const docx = officegen('docx');
        const buffers = [];

        // Setup error handling
        docx.on('error', (err) => {
            reject(err);
        });

        // When document is created
        const stream = new Readable();
        stream._read = () => { };

        docx.on('finalize', () => {
            const buffer = Buffer.concat(buffers);
            resolve(buffer);
        });

        stream.on('data', (chunk) => {
            buffers.push(chunk);
        });

        // Add header with name and title
        let header = docx.createP();
        header.addText(personalInfo.name || 'John Doe', { font_size: 24, align: 'center', bold: true });
        header.addLineBreak();
        header.addText(personalInfo.title || 'Professional Title', { font_size: 14, align: 'center' });
        header.addLineBreak();

        // Add contact information
        let contact = docx.createP({ align: 'center' });
        contact.addText([
            personalInfo.email || 'email@example.com',
            personalInfo.phone || '(123) 456-7890',
            personalInfo.location || 'City, State'
        ].join(' | '), { font_size: 10 });

        // Professional Summary
        let summaryHeader = docx.createP();
        summaryHeader.addText('Professional Summary', { font_size: 16, bold: true });
        summaryHeader.addHorizontalLine();

        let summary = docx.createP();
        summary.addText(personalInfo.summary || 'Professional with experience in the industry.', { font_size: 10 });

        // Experience
        let expHeader = docx.createP();
        expHeader.addText('Experience', { font_size: 16, bold: true });
        expHeader.addHorizontalLine();

        experiences.forEach((exp) => {
            let expTitle = docx.createP();
            expTitle.addText(exp.title || 'Job Title', { font_size: 12, bold: true });

            let expDetails = docx.createP();
            expDetails.addText(`${exp.company || 'Company'} | ${exp.startDate || 'Start Date'} - ${exp.endDate || 'End Date'}`, { font_size: 10 });

            let expDesc = docx.createP();
            expDesc.addText(exp.description || 'Job description', { font_size: 10 });
        });

        // Education
        let eduHeader = docx.createP();
        eduHeader.addText('Education', { font_size: 16, bold: true });
        eduHeader.addHorizontalLine();

        education.forEach((edu) => {
            let eduTitle = docx.createP();
            eduTitle.addText(`${edu.degree || 'Degree'} in ${edu.field || 'Field'}`, { font_size: 12, bold: true });

            let eduDetails = docx.createP();
            eduDetails.addText(`${edu.school || 'School'} | ${edu.startDate || 'Start Date'} - ${edu.endDate || 'End Date'}`, { font_size: 10 });
        });

        // Skills
        let skillsHeader = docx.createP();
        skillsHeader.addText('Skills', { font_size: 16, bold: true });
        skillsHeader.addHorizontalLine();

        let skillsList = docx.createP();
        skillsList.addText(skills || 'Skills list', { font_size: 10 });

        // Generate the document
        docx.generate(stream);
    });
}