from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.all_models import User, Conversation, ChatMessage
from app.schemas.schemas import ChatQueryRequest, ChatMessageResponse, ConversationResponse
from app.api.dependencies import get_current_active_user
from app.core.permissions import verify_resource_ownership
from app.services.rag_service import rag_service

router = APIRouter(prefix="/ai", tags=["AI Health Copilot & RAG"])

@router.post("/chat", response_model=ChatMessageResponse)
def chat_with_copilot(
    data: ChatQueryRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # 1. Manage Conversation
    conversation = None
    if data.conversation_id:
        conversation = db.query(Conversation).filter(Conversation.id == data.conversation_id).first()
        if not conversation:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
        verify_resource_ownership(conversation.user_id, current_user.id, "Conversation")
    else:
        title = data.message[:40] + ("..." if len(data.message) > 40 else "")
        conversation = Conversation(
            user_id=current_user.id,
            title=title or "Health Consultation",
        )
        db.add(conversation)
        db.flush()

    # 2. Record User Message
    user_msg = ChatMessage(
        conversation_id=conversation.id,
        user_id=current_user.id,
        sender="user",
        content=data.message,
    )
    db.add(user_msg)

    # 3. RAG Retrieval & Clinical Grounding
    citations = []
    is_grounded = False

    if data.use_rag:
        # Strictly query current user's document chunks
        retrieved_chunks = rag_service.retrieve_relevant_chunks(
            db=db,
            user_id=current_user.id,
            query=data.message,
            top_k=4,
        )

        rag_result = rag_service.generate_grounded_answer(
            query=data.message,
            retrieved_chunks=retrieved_chunks,
        )
        assistant_content = rag_result["answer"]
        citations = rag_result["citations"]
        is_grounded = rag_result["is_grounded"]
    else:
        # General Medical Education
        assistant_content = (
            f"Here is general medical educational guidance regarding '{data.message}':\n\n"
            f"• General Physiology: Maintaining balanced nutrition, regular hydration, and adequate sleep "
            f"are essential for cardiovascular and metabolic equilibrium.\n\n"
            f"• Clinical Precaution: This response is for general health education only. "
            f"For personalized medical evaluation or changes to your prescription regimen, please consult your physician."
        )

    # 4. Record Assistant Message
    assistant_msg = ChatMessage(
        conversation_id=conversation.id,
        user_id=current_user.id,
        sender="assistant",
        content=assistant_content,
        citations=citations,
        is_grounded=is_grounded,
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    return assistant_msg

@router.get("/conversations", response_model=List[ConversationResponse])
def list_conversations(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    convs = db.query(Conversation).filter(
        Conversation.user_id == current_user.id
    ).order_by(Conversation.updated_at.desc()).all()
    return convs

@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
def get_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    verify_resource_ownership(conv.user_id, current_user.id, "Conversation")
    return conv
