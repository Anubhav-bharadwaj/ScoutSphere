import chromadb
from sentence_transformers import SentenceTransformer

from backend.core.config import settings

class VectorStore:
    def __init__(self):
        self.client = chromadb.HttpClient(host=settings.CHROMA_HOST, port=settings.CHROMA_PORT)
        # Using a small, fast local model for embeddings
        self.encoder = SentenceTransformer('all-MiniLM-L6-v2')
        self.user_collection_name = "user_profiles"
        self.opp_collection_name = "opportunities"

    def _get_or_create_user_collection(self):
        return self.client.get_or_create_collection(name=self.user_collection_name)

    def _get_or_create_opp_collection(self):
        return self.client.get_or_create_collection(name=self.opp_collection_name)

    def vectorize_and_store_profile(self, user_id: str, skills: list[str]):
        """Vectorizes skills and stores them in ChromaDB"""
        if not skills:
            return
            
        collection = self._get_or_create_user_collection()
        
        # We join skills into a single string for simplicity in MVP
        text = " ".join(skills)
        embedding = self.encoder.encode(text).tolist()
        
        collection.upsert( # type: ignore
            documents=[text],
            embeddings=[embedding], # type: ignore
            metadatas=[{"user_id": user_id}],
            ids=[user_id]
        )

    def vectorize_and_store_opportunity(self, opp_id: str, title: str, description: str, requirements: dict):
        """Vectorizes opportunity text and stores it in ChromaDB"""
        collection = self._get_or_create_opp_collection()
        
        # Combine text for embedding
        req_text = " ".join([f"{k}: {v}" for k, v in requirements.items()]) if requirements else ""
        text = f"{title}. {description or ''}. {req_text}"
        
        embedding = self.encoder.encode(text).tolist()
        
        collection.upsert( # type: ignore
            documents=[text],
            embeddings=[embedding], # type: ignore
            metadatas=[{"opportunity_id": str(opp_id)}], # type: ignore
            ids=[str(opp_id)] # type: ignore
        )

    def query_similarity(self, source_text: str, n_results: int = 10) -> dict[str, float]:
        """Queries the opportunity collection for similarity against a source string. Returns dict of opp_id -> score (0 to 1)"""
        collection = self._get_or_create_opp_collection()
        embedding = self.encoder.encode(source_text).tolist()
        
        results = collection.query(
            query_embeddings=[embedding], # type: ignore
            n_results=n_results,
            include=['distances', 'metadatas'] # type: ignore
        )
        
        scores = {}
        if results['distances'] and results['distances'][0] and results['metadatas'] and results['metadatas'][0]:
            for i, distance in enumerate(results['distances'][0]):
                meta = results['metadatas'][0][i]
                if meta and "opportunity_id" in meta:
                    opp_id = meta["opportunity_id"]
                    # Convert distance to similarity score
                    score = max(0.0, min(1.0, 1.0 - (float(distance) / 2.0))) # type: ignore
                    scores[str(opp_id)] = score
        return scores

vector_store = VectorStore()
