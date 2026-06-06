# AI Resume Analyzer - Backend Implementation

## Overview

This is a production-ready resume analyzer with a multi-layer extraction pipeline, intelligent AI-powered analysis, and comprehensive ATS scoring. It processes resumes in PDF and DOCX formats with automatic fallback mechanisms.

## Architecture

### Multi-Layer Extraction Pipeline

```
┌─────────────────────────────────────┐
│   File Upload (PDF/DOCX/Image)      │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Step 1: Basic Text Extraction      │
│  - PDF: pdf-parse                   │
│  - DOCX: mammoth                    │
│  - Output: Text > 50 chars?         │
└─────────┬─────────────────────┬─────┘
          │                     │
         YES                   NO
          │                     │
          ▼                     ▼
    ┌─────────────┐    ┌──────────────────┐
    │  Proceed    │    │ Step 2: OCR      │
    │   with      │    │ - Tesseract OCR  │
    │   text      │    │ - Text < 50?     │
    └─────┬───────┘    └───────┬──────────┘
          │                    │
          │                   NO
          │                    │
          │                    ▼
          │            ┌──────────────────┐
          │            │ Step 3: Gemini   │
          │            │ - Parse JSON     │
          │            │ - Extract data   │
          │            └────────┬─────────┘
          │                     │
          └─────────┬───────────┘
                    │
                    ▼
      ┌─────────────────────────────┐
      │  Intelligent Data Extraction │
      │  - Personal Info            │
      │  - Skills Detection         │
      │  - Education                │
      │  - Experience               │
      │  - Projects                 │
      └─────────┬───────────────────┘
                │
                ▼
      ┌─────────────────────────────┐
      │   ATS Analysis & Scoring    │
      │  - Calculate ATS Score      │
      │  - Identify Strengths       │
      │  - Identify Weaknesses      │
      │  - Missing Skills           │
      │  - Suggestions              │
      └─────────┬───────────────────┘
                │
                ▼
      ┌─────────────────────────────┐
      │  Save to MongoDB & Return   │
      └─────────────────────────────┘
```

## Key Features

### 1. Multi-Layer Text Extraction
- **Layer 1**: Basic extraction (pdf-parse for PDF, mammoth for DOCX)
- **Layer 2**: OCR fallback (Tesseract.js for image-based resumes)
- **Layer 3**: Gemini API fallback (intelligent parsing for poor extractions)

### 2. Comprehensive Data Extraction
Automatically extracts:
- Full Name
- Email Address
- Phone Number
- LinkedIn URL
- GitHub URL
- Portfolio Website
- Education Details
- Work Experience
- Projects
- Certifications
- Skills & Technologies

### 3. Skill Detection & Categorization
Detects and categorizes skills into:
- **Frontend**: React, Vue, Angular, HTML, CSS, Tailwind, etc.
- **Backend**: Node.js, Express, Django, Flask, Spring Boot, etc.
- **Database**: MongoDB, MySQL, PostgreSQL, Redis, Firebase, etc.
- **Programming**: JavaScript, TypeScript, Java, Python, C++, etc.
- **Cloud**: AWS, Azure, GCP, Docker, Kubernetes, etc.
- **AI/ML**: Machine Learning, TensorFlow, PyTorch, NLP, etc.
- **DevOps**: Jenkins, GitHub Actions, GitLab CI, Terraform, etc.
- **Tools**: Git, GitHub, JIRA, Slack, Figma, VS Code, etc.
- **Soft Skills**: Communication, Leadership, Teamwork, etc.

### 4. Intelligent ATS Scoring (0-100)
Scores based on:
- Contact Information (20 points)
- LinkedIn/GitHub/Portfolio (15 points)
- Content Sections (25 points)
- Technical Keywords (15 points)
- Achievements & Metrics (15 points)
- Resume Length Quality (10 points)

### 5. Comprehensive Analysis
Generates:
- **Strengths**: What the resume does well
- **Weaknesses**: Missing or weak sections
- **Missing Skills**: Important skills not found
- **Suggested Keywords**: SEO-optimized keywords
- **Recommended Technologies**: Technology stack suggestions
- **Suggested Projects**: Portfolio project ideas
- **Improvement Suggestions**: Actionable advice

### 6. Rate Limiting & Security
- 5 requests/minute for resume analysis (resource intensive)
- 30 requests/minute for read operations
- 10 MB file size limit
- Automatic cleanup of uploaded files
- Graceful error handling

## Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Variables

Create `.env` file in the backend directory:

```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/student-os

# Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# JWT
JWT_SECRET=your_jwt_secret_here

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 3. Install Tesseract (for OCR)

**Ubuntu/Debian:**
```bash
sudo apt-get install tesseract-ocr
```

**macOS:**
```bash
brew install tesseract
```

**Windows:**
Download installer from: https://github.com/UB-Mannheim/tesseract/wiki

## API Endpoints

### 1. Analyze Resume
**POST** `/api/resume/analyze`

Upload a resume file for analysis.

**Request:**
```bash
curl -X POST http://localhost:5000/api/resume/analyze \
  -F "resume=@resume.pdf"
```

**Response:**
```json
{
  "success": true,
  "message": "Resume analyzed successfully",
  "analysis": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "linkedin": "https://linkedin.com/in/johndoe",
    "github": "https://github.com/johndoe",
    "portfolio": "https://johndoe.com",
    "education": ["B.Tech Computer Science"],
    "experience": ["Senior Software Engineer at TechCorp"],
    "projects": ["Full-Stack E-Commerce Platform"],
    "certifications": ["AWS Solutions Architect"],
    "skills": ["React", "Node.js", "MongoDB", "AWS"],
    "skillsByCategory": {
      "frontend": ["React"],
      "backend": ["Node.js"],
      "database": ["MongoDB"],
      "cloud": ["AWS"],
      ...
    },
    "atsScore": 85,
    "resumeSummary": "Experienced full-stack developer with...",
    "strengths": [
      "Complete contact information provided",
      "LinkedIn profile included",
      "GitHub portfolio linked",
      "Strong technical skills listed (8)",
      "Relevant work experience documented (3 roles)",
      "Practical projects demonstrated (5 projects)",
      "Educational background clearly stated"
    ],
    "weaknesses": [
      "Limited skills section"
    ],
    "missingSkills": ["Docker", "Kubernetes"],
    "suggestedKeywords": ["React", "Node.js", "MongoDB", ...],
    "recommendedTechnologies": ["TypeScript", "Next.js", "GraphQL"],
    "suggestedProjects": [
      "Full-Stack Web Application",
      "AI/ML Project",
      "Mobile Application",
      "Open Source Contribution"
    ],
    "improvementSuggestions": [
      "Add quantified achievements and metrics",
      "Include specific project technologies",
      "Highlight impact and results",
      "Add relevant certifications"
    ],
    "documentId": "507f1f77bcf86cd799439011"
  }
}
```

### 2. Get Analysis by ID
**GET** `/api/resume/:id`

Retrieve a previously saved analysis.

**Response:**
```json
{
  "success": true,
  "analysis": { ... }
}
```

### 3. Get User's Analyses
**GET** `/api/resume`

Retrieve all analyses for authenticated user.

**Response:**
```json
{
  "success": true,
  "count": 5,
  "analyses": [ ... ]
}
```

### 4. Delete Analysis
**DELETE** `/api/resume/:id`

Delete a resume analysis.

**Response:**
```json
{
  "success": true,
  "message": "Analysis deleted successfully"
}
```

## Error Handling

### Response Format
All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

### Common Error Codes

| Status | Message | Solution |
|--------|---------|----------|
| 400 | No resume uploaded | Upload a file |
| 400 | File too large | Max 10MB |
| 400 | Unsupported file type | Use PDF or DOCX |
| 429 | Too many requests | Wait before retrying |
| 500 | Analysis failed | Try again or check Gemini API |

## Rate Limiting

The API implements intelligent rate limiting:

```
Analysis endpoint: 5 requests/minute
Read endpoints: 30 requests/minute
Delete endpoints: 10 requests/minute
```

Rate limit info is returned in response headers:
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 1623456789
```

When rate limited (429):
```json
{
  "success": false,
  "message": "Too many requests...",
  "retryAfter": 45
}
```

## File Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── resumeController.js         # Main resume analysis logic
│   ├── models/
│   │   └── ResumeAnalysis.js          # MongoDB schema
│   ├── routes/
│   │   └── resumeRoutes.js            # API endpoints
│   ├── middleware/
│   │   ├── upload.js                  # File upload handling
│   │   └── rateLimit.js               # Rate limiting
│   ├── utils/
│   │   ├── resumeExtractionPipeline.js # Multi-layer extraction
│   │   ├── skillDetection.js          # Skill detection & analysis
│   │   ├── resumeDataExtraction.js    # Data parsing
│   │   └── aiClient.js                # Gemini API integration
│   ├── config/
│   │   └── db.js                      # Database connection
│   └── server.js                       # Main server file
├── uploads/                            # Temporary file storage
└── package.json
```

## Database Schema

```javascript
{
  userId: ObjectId,                    // User reference
  resumeFile: String,                  // Uploaded filename
  
  // Personal Information
  name: String,
  email: String,
  phone: String,
  linkedin: String,
  github: String,
  portfolio: String,
  
  // Extracted Content
  education: [String],
  skills: [String],
  experience: [String],
  projects: [String],
  certifications: [String],
  
  // Categorized Skills
  skillsByCategory: {
    frontend: [String],
    backend: [String],
    database: [String],
    programming: [String],
    cloud: [String],
    ai_ml: [String],
    devops: [String],
    tools: [String],
    softSkills: [String]
  },
  
  // Analysis Results
  atsScore: Number,                    // 0-100
  resumeSummary: String,
  strengths: [String],
  weaknesses: [String],
  missingSkills: [String],
  suggestedKeywords: [String],
  recommendedTechnologies: [String],
  suggestedProjects: [String],
  improvementSuggestions: [String],
  
  // Metadata
  extractionMethod: String,            // "basic", "ocr", or "gemini"
  createdAt: Date,
  updatedAt: Date
}
```

## Performance Optimization

### 1. Efficient Text Processing
- Lazy loading of Tesseract worker
- Automatic worker cleanup
- Memory-efficient OCR processing

### 2. Database Optimization
- Indexed userId for quick user queries
- Optional rawText field (not selected by default)
- Proper pagination support

### 3. Rate Limiting
- In-memory caching (use Redis for production)
- Automatic cleanup of old entries
- Per-endpoint customization

### 4. Error Handling
- Graceful degradation through fallbacks
- Proper resource cleanup
- Detailed logging

## Deployment Checklist

- [ ] Set all environment variables
- [ ] Ensure Tesseract is installed
- [ ] Configure MongoDB connection
- [ ] Set Gemini API key
- [ ] Test with sample resumes
- [ ] Monitor logs for errors
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure rate limits based on load
- [ ] Set up automated backups

## Troubleshooting

### "Unable to extract resume text"
- Ensure resume is a clear PDF or DOCX
- Try converting the file to PDF
- Check if Tesseract is properly installed

### "Gemini API Error"
- Verify GEMINI_API_KEY is set
- Check API quota and rate limits
- Ensure request is under character limit

### "Too many requests"
- Wait for rate limit window to reset
- Check X-RateLimit-Reset header
- Implement exponential backoff in frontend

### "File too large"
- Keep resumes under 10MB
- Compress PDF if needed

## Future Enhancements

1. **Redis Caching**: Cache frequent analyses
2. **PDF2Image**: Better PDF to image conversion
3. **Language Support**: Multi-language resume analysis
4. **Batch Processing**: Process multiple resumes
5. **Custom Scoring**: User-defined scoring weights
6. **Benchmark Data**: Compare against industry standards
7. **Resume Templates**: Suggested format improvements
8. **Plagiarism Check**: Detect copied content

## Support

For issues or questions, create an issue in the repository or contact the development team.

## License

MIT
