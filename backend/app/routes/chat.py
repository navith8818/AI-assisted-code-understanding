"""
Chat endpoint using Google Gemini API.
Provides intelligent responses about the AI-assisted code understanding platform.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.auth import get_current_user
import google.genai as genai
import os
from app.knowledge_base import get_knowledge_base, get_project_features, is_relevant_to_project

router = APIRouter(tags=["Chat"])

# Pydantic models for chat
class ChatMessage(BaseModel):
    content: str

class ChatResponse(BaseModel):
    response: str
    is_relevant: bool

# Get Gemini client (lazy initialization)
_client = None

def get_gemini_client():
    """Get or initialize Gemini client with API key from environment."""
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=500,
                detail="Gemini API key not configured. Set GEMINI_API_KEY environment variable."
            )
        _client = genai.Client(api_key=api_key)
    return _client

# System prompt that contextualizes Gemini with project knowledge
SYSTEM_PROMPT = f"""You are a helpful AI assistant for the "AI-assisted Code Understanding Platform" - a web application that helps developers understand complex codebases through automatic visualization and analysis.

KEY INFORMATION ABOUT THE PLATFORM:

{get_knowledge_base()}

IMPORTANT GUIDELINES:
1. Always provide accurate, helpful information about the platform
2. If asked about FlowGen, explain it as an automatic code flow visualization engine
3. When users ask how to use the platform, provide clear, step-by-step guidance
4. If a question is not related to the platform, politely redirect the conversation back to the platform
5. Be friendly, professional, and concise in your responses
6. Use the knowledge provided above as the source of truth about the platform
7. If you don't have specific information about something, suggest the user check the Help section or contact support

FORMATTING INSTRUCTIONS:
- Use markdown formatting for better readability
- Use **bold** for important terms and key concepts
- Use ## Headers for main topics
- Use bullet points (•) or numbered lists for steps and features
- Add line breaks between sections for spacing
- Use code blocks with triple backticks for any code examples
- Keep paragraphs short and concise
- Use line breaks liberally to improve readability

CONVERSATION STYLE:
- Be conversational and helpful
- Use simple language when possible
- Provide examples when explaining features
- Ask follow-up questions if clarification is needed
- Always stay in character as the platform's AI assistant"""

@router.post("/chat", response_model=ChatResponse)
async def chat(
    message: ChatMessage,
):
    """
    Chat endpoint using Google Gemini API.
    Provides intelligent responses about the platform with context from the knowledge base.
    No authentication required - available to all users.
    """
    try:
        # Check if message is relevant to the project
        is_relevant = is_relevant_to_project(message.content)
        
        # Get Gemini client
        client = get_gemini_client()
        
        # Build the full message with system context
        full_message = f"{SYSTEM_PROMPT}\n\nUser Question: {message.content}"
        
        # Call Gemini API using generate_content
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=full_message,
        )
        
        # Extract response text - handle the response object properly
        if hasattr(response, 'text'):
            bot_response = response.text
        else:
            bot_response = str(response)
        
        if not bot_response:
            bot_response = "Sorry, I couldn't generate a response. Please try again."
        
        return ChatResponse(
            response=bot_response,
            is_relevant=is_relevant
        )
    
    except Exception as e:
        # Log the error and return a user-friendly message
        error_msg = str(e)
        print(f"Gemini API Error: {error_msg}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error processing chat request: {error_msg}"
        )


@router.get("/chat/features")
async def get_features():
    """
    Returns a list of platform features.
    Useful for the chatbot to suggest capabilities.
    No authentication required.
    """
    return {
        "features": get_project_features()
    }
