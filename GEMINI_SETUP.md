# Gemini API Integration Setup Guide

## Update: Using Latest Gemini API

This setup now uses the **official `google-genai` package** which is the current, actively-maintained Gemini API client. The previous `google-generativeai` package has been deprecated.
The chatbot is now integrated with Google's Gemini AI API. It automatically answers questions about the AI-assisted Code Understanding platform, including detailed information about FlowGen visualization features.

## Prerequisites
- Python 3.8+
- Google Account with Gemini API access
- API Key from Google AI Studio

## Setup Instructions

### 1. Get Your Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Click "Create API Key"
3. Create a new API key in your Google Cloud project

### 2. Configure Environment Variable
Create a `.env` file in the `backend/` directory:

```bash
# backend/.env
GEMINI_API_KEY=your_api_key_here
```

### 3. Install Dependencies
```bash
# Install/update requirements
pip install -r requirements.txt
```

This installs:
- `google-genai>=0.3.0` - Official Gemini API client (latest, recommended)

### 4. Backend Setup
The backend is already configured with:
- **Chat Endpoint**: `POST /chat` - Accepts user messages and returns Gemini AI responses
- **Knowledge Base**: Comprehensive information about the platform and FlowGen
- **Authentication**: JWT-based auth required for chat

### 5. Frontend Setup
The ChatBot component is now updated to:
- Call the backend `/chat` endpoint via HTTP
- Show loading states while waiting for AI responses
- Display errors if API calls fail
- Require user authentication (JWT token in localStorage)

## Features

### Knowledge Base Includes:
- **Project Overview**: What the AI-assisted code understanding platform does
- **FlowGen Details**: Comprehensive description of the flow visualization engine
  - Automatic flow generation from code
  - Call graph visualization
  - Dependency graph visualization
  - Multi-language support
  - Symbol table analysis
  - Interactive dashboard
- **Core Features**: Code upload, structure analysis, visualization, annotations
- **Use Cases**: Onboarding, refactoring, bug tracking, documentation, code review
- **Technical Architecture**: Backend stack, API endpoints, frontend components

### Chatbot Capabilities:
- Answers questions about the platform
- Explains FlowGen features in detail
- Provides guidance on using the system
- Automatically contextualizes responses with platform knowledge
- Handles authentication errors gracefully
- Shows loading indicators during processing

## API Response Format

###Request:
```json
{
  "content": "What is FlowGen?"
}
```

### Response:
```json
{
  "response": "FlowGen is the automatic code flow visualization engine...",
  "is_relevant": true
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | Yes |

## Customizing the Knowledge Base

Edit `backend/app/knowledge_base.py` to:
- Add more information about the platform
- Update FlowGen description
- Add new FAQ items
- Modify system prompts

## Troubleshooting

### "Gemini API key not configured"
- Check that `.env` file exists in `backend/` directory
- Verify `GEMINI_API_KEY` is set correctly
- Restart the FastAPI server

### "Not authenticated. Please log in"
- Ensure user is logged in and JWT token is stored in localStorage
- Check browser dev tools to see if `access_token` is present

### Chat responses are slow
- Gemini API may take 2-5 seconds for complex questions
- Network latency can affect response times
- Consider rate limiting if deploying to production

### API Error responses
- Check backend logs for detailed error messages
- Verify Gemini API key is valid and has quota remaining
- Check internet connection

## Production Considerations

1. **API Key Security**
   - Never commit `.env` file to version control
   - Use environment variables in production
   - Rotate keys regularly

2. **Rate Limiting**
   - Implement rate limiting to protect against abuse
   - Monitor API usage and costs

3. **Error Handling**
   - Add more specific error messages
   - Implement retry logic with exponential backoff
   - Log all chat interactions

4. **Caching**
   - Cache common questions and answers
   - Reduce API calls and costs

## Testing

### Local Testing:
```bash
# Terminal 1: Start backend
cd backend
uvicorn API.server:app --reload

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### Test the chat:
1. Navigate to frontend (http://localhost:5173)
2. Register/Login
3. Click chat button
4. Ask a question about FlowGen or the platform

## API Documentation

### Chat Endpoint
- **URL**: `/chat`
- **Method**: POST
- **Auth**: Required (Bearer token)
- **Request Body**: `{ "content": "string" }`
- **Response**: `{ "response": "string", "is_relevant": bool }`

### Features Endpoint
- **URL**: `/chat/features`
- **Method**: GET
- **Auth**: Required (Bearer token)
- **Response**: `{ "features": ["string", ...] }`

## Future Enhancements

- [ ] Add conversation history storage
- [ ] Implement multi-turn conversations with context
- [ ] Add sentiment analysis
- [ ] Create custom response templates
- [ ] Add analytics for common questions
- [ ] Integrate with help documentation links
- [ ] Add language support beyond English
