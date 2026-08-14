import chromadb
from chromadb.config import Settings as ChromaSettings
from sentence_transformers import SentenceTransformer

from backend.core.config import settings

class VectorStore:
    def __init__(self):
        self.client = chromadb.HttpClient(host=settings.CHROMA_HOST, port=settings.CHROMA_PORT)
        # Using a small, fast local model for embeddings
        self.encoder = SentenceTransformer('all-MiniLM-L6-v2')
        self.collection_name = "user_profiles"

    def _get_or_create_collection(self):
        return self.client.get_or_create_collection(name=self.collection_name)

    def vectorize_and_store_profile(self, user_id: str, skills: list[str]):
        """Vectorizes skills and stores them in ChromaDB"""
        if not skills:
            return
            
        collection = self._get_or_create_collection()
        
        # We join skills into a single string for simplicity in MVP
        text = " ".join(skills)
        embedding = self.encoder.encode(text).tolist()
        
        collection.upsert( # type: ignore
            documents=[text],
            embeddings=[embedding], # type: ignore
            metadatas=[{"user_id": user_id}],
            ids=[user_id]
        )

vector_store = VectorStore()
