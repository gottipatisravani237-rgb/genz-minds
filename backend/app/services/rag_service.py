from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.all_models import DocumentChunk, MedicalDocument
from app.services.embedding_service import embedding_service
from app.services.ocr_service import ocr_service

class RAGService:
    @staticmethod
    def ingest_document(db: Session, document: MedicalDocument, text: str) -> int:
        """
        Chunks the document text, calculates vector embeddings, and persists
        the chunks tagged with document_id and user_id for strict owner-level filtering.
        """
        # Delete prior chunks if re-indexing
        db.query(DocumentChunk).filter(DocumentChunk.document_id == document.id).delete()

        chunks_data = ocr_service.chunk_document(text, chunk_size=350, overlap=60)
        chunks_created = 0

        for item in chunks_data:
            chunk_vec = embedding_service.get_embedding(item["text"])
            doc_chunk = DocumentChunk(
                document_id=document.id,
                user_id=document.user_id,
                chunk_text=item["text"],
                chunk_index=item["chunk_index"],
                page_number=item.get("page_number", 1),
                source_metadata={
                    "filename": document.original_filename,
                    "document_type": document.document_type,
                },
                embedding_json=chunk_vec,
            )
            db.add(doc_chunk)
            chunks_created += 1

        db.commit()
        return chunks_created

    @staticmethod
    def retrieve_relevant_chunks(
        db: Session,
        user_id: str,
        query: str,
        top_k: int = 4,
        similarity_threshold: float = 0.25
    ) -> List[Dict[str, Any]]:
        """
        Strictly retrieves top-k chunks belonging ONLY to user_id.
        Prevents cross-tenant data leakage by enforcing DB-level ownership filter.
        """
        # Strictly filter by user_id
        user_chunks = db.query(DocumentChunk).filter(
            DocumentChunk.user_id == user_id
        ).all()

        if not user_chunks:
            return []

        query_vec = embedding_service.get_embedding(query)
        query_words = set(w.lower() for w in query.split() if len(w) > 3)
        scored_chunks = []

        for chunk in user_chunks:
            chunk_vec = chunk.embedding_json or []
            sim = embedding_service.cosine_similarity(query_vec, chunk_vec) if chunk_vec else 0.0
            
            # Hybrid keyword matching boost for medical accuracy
            chunk_words = set(w.lower() for w in chunk.chunk_text.split() if len(w) > 3)
            overlap = query_words.intersection(chunk_words)
            if overlap:
                sim += 0.4 * (len(overlap) / max(len(query_words), 1))

            if sim >= 0.10:
                doc_title = chunk.source_metadata.get("filename", "Medical Document")
                scored_chunks.append({
                    "chunk_id": chunk.id,
                    "document_id": chunk.document_id,
                    "document_name": doc_title,
                    "page_number": chunk.page_number,
                    "excerpt": chunk.chunk_text,
                    "relevance_score": round(sim, 3),
                })

        # Sort descending by relevance score
        scored_chunks.sort(key=lambda x: x["relevance_score"], reverse=True)
        return scored_chunks[:top_k]

    @staticmethod
    def generate_grounded_answer(
        query: str,
        retrieved_chunks: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Constructs a clinically grounded response and attaches accurate citations.
        Explicitly warns when context is insufficient.
        """
        if not retrieved_chunks:
            return {
                "answer": (
                    "Based on your uploaded medical records, there is insufficient specific information "
                    "to answer this question. Please ensure your relevant laboratory reports or prescriptions "
                    "are uploaded and processed, or consult your healthcare provider directly."
                ),
                "citations": [],
                "is_grounded": False,
                "insufficient_information": True,
            }

        # Context assembly
        context_snippets = "\n".join([f"[{c['document_name']} Page {c['page_number']}]: {c['excerpt']}" for c in retrieved_chunks])
        citations = [
            {
                "document_id": c["document_id"],
                "document_name": c["document_name"],
                "page_number": c["page_number"],
                "excerpt": c["excerpt"][:200] + ("..." if len(c["excerpt"]) > 200 else ""),
                "relevance_score": c["relevance_score"],
            }
            for c in retrieved_chunks
        ]

        # Clinical grounded answer generation
        answer = (
            f"According to your uploaded medical records ({', '.join(set(c['document_name'] for c in retrieved_chunks))}):\n\n"
            f"• Findings Summary: Relevant data retrieved shows:\n"
            f"  \"{retrieved_chunks[0]['excerpt'][:280]}...\"\n\n"
            f"• Clinical Guidance: The documented parameters reflect your recorded test results. "
            f"Please share these specific findings with your physician before adjusting any routine or medication."
        )

        return {
            "answer": answer,
            "citations": citations,
            "is_grounded": True,
            "insufficient_information": False,
        }

rag_service = RAGService()
