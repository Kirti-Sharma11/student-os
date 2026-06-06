# API Testing Guide

## Test Cases

### 1. Basic Resume Upload Test

**Scenario**: Upload a valid PDF resume

```bash
curl -X POST http://localhost:5000/api/resume/analyze \
  -F "resume=@sample_resume.pdf" \
  -H "Accept: application/json"
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Resume analyzed successfully",
  "analysis": {
    "name": "John Doe",
    "email": "john@example.com",
    "atsScore": 78,
    ...
  }
}
```

### 2. Missing File Test

**Scenario**: Send request without file

```bash
curl -X POST http://localhost:5000/api/resume/analyze \
  -H "Accept: application/json"
```

**Expected Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "No resume uploaded"
}
```

### 3. Unsupported File Type Test

**Scenario**: Upload a .txt file

```bash
curl -X POST http://localhost:5000/api/resume/analyze \
  -F "resume=@resume.txt" \
  -H "Accept: application/json"
```

**Expected Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "Unsupported file type..."
}
```

### 4. File Size Limit Test

**Scenario**: Upload file > 10MB

```bash
# Create 11MB file
dd if=/dev/zero bs=1M count=11 of=large.pdf

curl -X POST http://localhost:5000/api/resume/analyze \
  -F "resume=@large.pdf"
```

**Expected Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "File too large. Max size: 10MB"
}
```

### 5. Rate Limiting Test

**Scenario**: Make 6 requests in < 1 minute (limit is 5)

```bash
for i in {1..6}; do
  echo "Request $i..."
  curl -X POST http://localhost:5000/api/resume/analyze \
    -F "resume=@resume.pdf" \
    -w "Status: %{http_code}\n"
  sleep 1
done
```

**Expected**: First 5 return 200, 6th returns 429

```json
{
  "success": false,
  "message": "Too many resume analyses...",
  "retryAfter": 45
}
```

### 6. Get Analysis Test

**Scenario**: Retrieve a saved analysis

```bash
# First, upload a resume to get document ID
RESPONSE=$(curl -s -X POST http://localhost:5000/api/resume/analyze \
  -F "resume=@resume.pdf")

DOC_ID=$(echo $RESPONSE | jq -r '.analysis.documentId')

# Then retrieve it
curl http://localhost:5000/api/resume/$DOC_ID
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "analysis": { ... }
}
```

### 7. Invalid Analysis ID Test

**Scenario**: Try to get non-existent analysis

```bash
curl http://localhost:5000/api/resume/507f1f77bcf86cd799439999
```

**Expected Response** (404 Not Found):
```json
{
  "success": false,
  "message": "Analysis not found"
}
```

### 8. Malformed ID Test

**Scenario**: Pass invalid MongoDB ID format

```bash
curl http://localhost:5000/api/resume/invalid-id
```

**Expected Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "Invalid analysis ID"
}
```

## Integration Tests

### Test with Postman

Import this collection:

```json
{
  "info": {
    "name": "Resume Analyzer API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Analyze Resume",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/resume/analyze",
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "resume",
              "type": "file",
              "src": "sample.pdf"
            }
          ]
        }
      }
    },
    {
      "name": "Get Analysis",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/api/resume/{{doc_id}}"
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:5000"
    },
    {
      "key": "doc_id",
      "value": ""
    }
  ]
}
```

### Test with Jest

Create `tests/resume.test.js`:

```javascript
const request = require('supertest');
const app = require('../src/server');
const fs = require('fs');
const path = require('path');

describe('Resume API', () => {
  describe('POST /api/resume/analyze', () => {
    it('should analyze a valid resume', async () => {
      const filePath = path.join(__dirname, 'fixtures', 'sample.pdf');

      const response = await request(app)
        .post('/api/resume/analyze')
        .attach('resume', filePath);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.analysis).toHaveProperty('atsScore');
      expect(response.body.analysis).toHaveProperty('email');
    });

    it('should reject missing file', async () => {
      const response = await request(app)
        .post('/api/resume/analyze');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No resume');
    });

    it('should reject unsupported file type', async () => {
      const response = await request(app)
        .post('/api/resume/analyze')
        .attach('resume', Buffer.from('text'), 'resume.txt');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/resume/:id', () => {
    it('should get analysis by ID', async () => {
      // First create an analysis
      const uploadResponse = await request(app)
        .post('/api/resume/analyze')
        .attach('resume', 'fixtures/sample.pdf');

      const docId = uploadResponse.body.analysis.documentId;

      // Then retrieve it
      const response = await request(app)
        .get(`/api/resume/${docId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.analysis._id).toBe(docId);
    });

    it('should return 404 for non-existent ID', async () => {
      const response = await request(app)
        .get('/api/resume/507f1f77bcf86cd799439999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
```

Run tests:
```bash
npm test
```

## Performance Testing

### Load Test with Apache Bench

```bash
# Single resume, 10 concurrent requests, 100 total
ab -n 100 -c 10 -p sample.pdf \
  -T application/pdf \
  http://localhost:5000/api/resume/analyze
```

### Load Test with wrk

```bash
# Generate test script
cat > resume_test.lua << 'EOF'
wrk.method = "POST"
wrk.path = "/api/resume/analyze"
wrk.headers["Content-Type"] = "multipart/form-data"

-- Note: This is simplified; actual file upload requires custom setup
EOF

# Run test: 4 threads, 10 connections, 30 second duration
wrk -t4 -c10 -d30s -s resume_test.lua http://localhost:5000
```

### Monitor Performance

```bash
# Memory usage during test
watch -n 1 'ps aux | grep node | grep -v grep | awk "{print \$6, \$7}"'

# CPU usage
top -p $(pgrep -f "node src/server.js") -b -n 1

# Disk I/O
iostat -x 1 10
```

## Sample Test Data

### Sample Resume 1 (Basic)

```text
JOHN DOE
john.doe@email.com | (555) 123-4567 | linkedin.com/in/johndoe | github.com/johndoe

SUMMARY
Experienced Full-Stack Developer with 5 years of experience in web application development.

EXPERIENCE
Senior Software Engineer | TechCorp | Jan 2021 - Present
- Led team of 5 engineers
- Increased performance by 40%
- Implemented microservices architecture

SKILLS
Languages: JavaScript, TypeScript, Python
Frontend: React, Vue.js, HTML, CSS
Backend: Node.js, Express, Django
Databases: MongoDB, PostgreSQL, Redis
Tools: Git, Docker, AWS

EDUCATION
B.S. Computer Science | State University | 2018

PROJECTS
E-Commerce Platform: Built full-stack platform using React, Node.js, MongoDB
AI Chatbot: Created chatbot using Python, TensorFlow, NLP
```

### Sample Resume 2 (Advanced)

```text
SARAH SMITH
sarah.smith@email.com | +1(555) 987-6543
linkedin.com/in/sarahsmith | github.com/sarahsmith | portfolio.sarahsmith.dev

PROFESSIONAL SUMMARY
Full Stack Engineer with expertise in cloud-native architecture and AI/ML integration. 
5+ years building scalable applications serving millions of users.

WORK EXPERIENCE
Principal Software Engineer | CloudTech | Sep 2022 - Present
- Architected microservices serving 10M+ daily active users
- Mentored team of 8 engineers
- Reduced infrastructure costs by 35% with Kubernetes optimization
- Led migration from monolith to serverless (AWS Lambda)

Senior Software Engineer | DataFlow | Mar 2020 - Aug 2022
- Implemented real-time data pipeline processing 1M+ events/day
- Achieved 99.99% uptime SLA
- Optimized database queries, reducing latency by 60%

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, Go, Java
Frontend: React, Next.js, Angular, Vue.js, Tailwind CSS, Material-UI
Backend: Node.js, Express, FastAPI, Spring Boot, Django
Databases: PostgreSQL, MongoDB, Redis, Elasticsearch, DynamoDB
Cloud: AWS (EC2, RDS, Lambda, S3), Google Cloud, Azure
DevOps: Docker, Kubernetes, GitHub Actions, Jenkins, Terraform
AI/ML: TensorFlow, PyTorch, scikit-learn, Pandas, NLP

CERTIFICATIONS
AWS Solutions Architect Professional | 2023
Kubernetes Application Developer (CKAD) | 2022
Google Cloud Associate Cloud Engineer | 2021

PROJECTS
Real-Time Analytics Dashboard
- Built with React, Node.js, WebSocket, and PostgreSQL
- Processes and visualizes 1M+ data points
- github.com/sarahsmith/analytics-dashboard

ML-Powered Recommendation Engine
- Implemented collaborative filtering using TensorFlow
- Improved recommendation accuracy by 45%
- Deployed on AWS using containerized microservices

EDUCATION
M.S. Computer Science (ML specialization) | Tech University | 2019
B.S. Computer Science | Tech University | 2017

LANGUAGES
English (Native), Spanish (Fluent), Mandarin (Basic)
```

## Stress Testing Results

### Expected Performance Metrics

```
Single Resume Analysis:
- Average Time: 2-5 seconds (depends on extraction method)
- Memory Usage: 50-150 MB peak
- CPU Usage: 30-60%

Rate Limiting (5/min):
- 200 OK: First 5 requests
- 429 Too Many Requests: 6th+ requests
- Reset Time: 60 seconds

Concurrent Load (10 users):
- Response Time: 5-15 seconds
- Error Rate: < 1%
- Throughput: 2-3 resumes/second
```

## Debugging

### Enable Debug Logs

```bash
# Add to .env
DEBUG=*
LOG_LEVEL=debug

# Or via environment
DEBUG=* npm run dev
```

### Check Request/Response

```bash
# Verbose curl output
curl -v -X POST http://localhost:5000/api/resume/analyze \
  -F "resume=@resume.pdf"

# Pretty print response
curl -s http://localhost:5000/api/resume/123 | jq '.'
```

### Monitor MongoDB

```bash
# Connect to MongoDB
mongosh

# Check database
use student-os
db.resumeanalyses.find().pretty()
db.resumeanalyses.countDocuments()

# View recent analyses
db.resumeanalyses.find().sort({createdAt: -1}).limit(5).pretty()
```

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/test.yml`:

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:6
        options: >-
          --health-cmd mongosh
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 27017:27017

    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: cd backend && npm ci

      - name: Run tests
        env:
          MONGODB_URI: mongodb://localhost:27017/test-db
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          JWT_SECRET: test-secret
        run: cd backend && npm test

      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

## Conclusion

This testing guide covers:
- ✅ Unit test cases
- ✅ Integration tests
- ✅ Performance testing
- ✅ Load testing
- ✅ Error scenarios
- ✅ Rate limiting verification
- ✅ CI/CD integration

For more tests or issues, refer to the IMPLEMENTATION.md documentation.
