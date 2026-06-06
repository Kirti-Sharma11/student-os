# Environment Configuration

Copy this to `.env` in the backend directory and fill in your values:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/student-os
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student-os

# Gemini API (get from https://ai.google.dev/)
GEMINI_API_KEY=your_gemini_api_key_here

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
# For production: CORS_ORIGIN=https://yourdomain.com

# File Upload
MAX_FILE_SIZE=10485760  # 10MB in bytes
UPLOAD_DIR=./uploads

# Rate Limiting (optional - defaults provided)
RATE_LIMIT_WINDOW_MS=60000  # 1 minute
ANALYSIS_RATE_LIMIT=5       # 5 requests per window
READ_RATE_LIMIT=30          # 30 requests per window
DELETE_RATE_LIMIT=10        # 10 requests per window

# OCR Configuration (optional)
TESSERACT_CACHE_DIR=./.tesseract-cache
TESSERACT_LANG=eng

# API Keys for Other Services (if needed)
SENDGRID_API_KEY=  # For email notifications
SENTRY_DSN=        # For error tracking

# Logging
LOG_LEVEL=info     # debug, info, warn, error
```

## Setup Instructions

### 1. Local Development Setup

```bash
# Clone repository
git clone <repository-url>
cd student-os/backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your configuration
nano .env

# Start MongoDB (if local)
mongod

# Start server
npm run dev
```

### 2. Docker Setup (Optional)

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "src/server.js"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/student-os
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongo
    volumes:
      - ./backend/uploads:/app/uploads

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

Run with Docker:
```bash
docker-compose up
```

### 3. Production Deployment

#### Environment-Specific .env

Create `.env.production`:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/student-os
GEMINI_API_KEY=your_production_key
JWT_SECRET=your_production_secret
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=warn
```

#### Deploy to Heroku

```bash
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set GEMINI_API_KEY=xxx
heroku config:set JWT_SECRET=xxx
heroku config:set MONGODB_URI=xxx

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

#### Deploy to AWS EC2

```bash
# SSH into instance
ssh -i key.pem ec2-user@your-instance

# Install Node.js
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Clone and setup
git clone <repo-url>
cd student-os/backend
npm install
npm run build

# Create systemd service
sudo nano /etc/systemd/system/resume-analyzer.service
```

Service file:
```ini
[Unit]
Description=Resume Analyzer API
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/student-os/backend
EnvironmentFile=/home/ec2-user/.env
ExecStart=/usr/bin/node src/server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Start service:
```bash
sudo systemctl start resume-analyzer
sudo systemctl enable resume-analyzer
```

### 4. Get Gemini API Key

1. Visit https://ai.google.dev/
2. Click "Get API Key"
3. Create new project or select existing
4. Copy the API key
5. Add to `.env`: `GEMINI_API_KEY=your_key`

### 5. MongoDB Setup

#### Local
```bash
# Install MongoDB
# Ubuntu: sudo apt-get install -y mongodb
# macOS: brew install mongodb-community

# Start MongoDB
mongod

# Or with systemd
sudo systemctl start mongod
```

#### MongoDB Atlas (Cloud)
1. Visit https://www.mongodb.com/cloud/atlas
2. Create account
3. Create cluster
4. Get connection string
5. Add to `.env`

#### Verify Connection
```bash
# Test from backend
npm run test:db
```

## Verification

### 1. Test Server Start

```bash
npm run dev
# Should output: Server running on port 5000
```

### 2. Test API Health

```bash
curl http://localhost:5000/
# Response: Backend running...
```

### 3. Test Resume Upload

```bash
curl -X POST http://localhost:5000/api/resume/analyze \
  -F "resume=@sample.pdf"
```

### 4. Test Database Connection

```bash
# Create test script
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('Connected to MongoDB');
  process.exit(0);
}).catch(err => {
  console.error('Connection failed:', err);
  process.exit(1);
});
"
```

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED
```
Solution: Ensure MongoDB is running and URI is correct

### Gemini API Error
```
Error: Invalid API key
```
Solution: Check GEMINI_API_KEY in .env

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
Solution: Change PORT in .env or kill process on port 5000

### Tesseract Not Found
```
Error: spawn tesseract ENOENT
```
Solution: Install Tesseract (see installation guide)

## Monitoring

### Log Files
```bash
# View application logs
tail -f logs/app.log

# View error logs
tail -f logs/error.log
```

### Database Monitoring
```bash
# MongoDB connection status
db.adminCommand("ping")

# Check database size
db.stats()
```

### Performance Metrics
```bash
# Memory usage
ps aux | grep node

# CPU usage
top -p $(pgrep -f "node src/server.js")
```

## Scaling Considerations

### Database
- Add indexes on frequently queried fields
- Consider MongoDB sharding for high volume
- Implement read replicas

### Caching
- Replace in-memory rate limiter with Redis
- Cache skill detection results
- Cache Gemini API responses

### Load Balancing
- Use Nginx or HAProxy
- Deploy multiple backend instances
- Use message queues for heavy processing

## Security Best Practices

1. **Never commit .env files**: Add to .gitignore
2. **Use strong JWT secrets**: Min 32 characters
3. **Validate all inputs**: Check file types and sizes
4. **HTTPS only**: Use SSL in production
5. **Rate limiting**: Prevent abuse
6. **CORS restrictions**: Limit allowed origins
7. **Regular updates**: Keep dependencies current
8. **Error logging**: Don't expose sensitive info

## Support

For configuration issues:
1. Check logs: `npm run dev` output
2. Verify environment variables
3. Ensure external services are accessible
4. Check firewall rules
