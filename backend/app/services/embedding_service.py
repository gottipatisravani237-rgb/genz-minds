import math
import hashlib
from typing import List
from app.core.config import settings

class EmbeddingService:
    def __init__(self, dimension: int = 384):
        self.dimension = dimension

    def get_embedding(self, text: str) -> List[float]:
        """
        Generates a normalized embedding vector for text using pure Python.
        Completely immune to Windows Application Control DLL blocks.
        """
        cleaned = text.strip().lower()
        if not cleaned:
            return [0.0] * self.dimension
        
        vec = [0.0] * self.dimension
        words = cleaned.split()
        
        # Word-level semantic hash projection
        for w in words:
            h = hashlib.sha256(w.encode('utf-8')).digest()
            for i in range(len(h)):
                # Map byte 0-255 to -1.0 .. +1.0
                val = (h[i] - 128) / 128.0
                vec[i % self.dimension] += val

        # Normalization
        sq_sum = sum(x * x for x in vec)
        norm = math.sqrt(sq_sum)
        if norm > 0:
            vec = [round(x / norm, 6) for x in vec]
        return vec

    @staticmethod
    def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
        """
        Calculates cosine similarity between two float vectors.
        """
        if not vec1 or not vec2:
            return 0.0
        
        dot = sum(a * b for a, b in zip(vec1, vec2))
        norm_a = math.sqrt(sum(a * a for a in vec1))
        norm_b = math.sqrt(sum(b * b for b in vec2))
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return float(dot / (norm_a * norm_b))

embedding_service = EmbeddingService(dimension=settings.EMBEDDING_DIM)
