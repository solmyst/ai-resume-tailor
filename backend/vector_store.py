import os
import re
import json
from typing import List, Dict
import chromadb

class VectorStore:
    def __init__(self, persist_directory=None):
        if not persist_directory:
            # Persistent directory in instance/chroma_db
            base_dir = os.path.dirname(os.path.abspath(__file__))
            persist_directory = os.path.join(base_dir, 'instance', 'chroma_db')
        
        os.makedirs(persist_directory, exist_ok=True)
        
        # Initialize Persistent Client
        self.client = chromadb.PersistentClient(path=persist_directory)
        
        # Get or create collections
        self.resumes_collection = self.client.get_or_create_collection(
            name="resume_bullets",
            metadata={"hnsw:space": "cosine"}
        )
        self.projects_collection = self.client.get_or_create_collection(
            name="portfolio_projects",
            metadata={"hnsw:space": "cosine"}
        )
        
        # Seed default project recommendations if collection is empty
        self._init_default_projects()
        print("Vector Store successfully initialized.")

    def _init_default_projects(self):
        """Seed the projects collection with high-quality reference projects."""
        try:
            if self.projects_collection.count() > 0:
                return

            default_projects = [
                {
                    "name": "E-Commerce Microservices Platform",
                    "description": "A cloud-native e-commerce system built using microservices architecture. Designed with React frontend, Node.js gateway, and independent Python services. Features real-time inventory management with Redis, PostgreSQL database persistence, Docker containerization, and AWS ECS deployment with automated CI/CD pipelines.",
                    "technologies": ["React", "Node.js", "Python", "Docker", "Kubernetes", "AWS", "Redis", "PostgreSQL"]
                },
                {
                    "name": "AI-Powered Customer Support Agent",
                    "description": "An enterprise chatbot agent utilizing Retrieval-Augmented Generation (RAG) to resolve customer inquiries. Powered by OpenAI API and LangChain framework. Uses ChromaDB to index help center documentation, achieving a 45% reduction in support response times. Frontend built in React and TypeScript.",
                    "technologies": ["React", "TypeScript", "Python", "OpenAI", "LangChain", "ChromaDB", "Vector Database", "FastAPI"]
                },
                {
                    "name": "DevOps Infrastructure as Code (IaC) Pipeline",
                    "description": "An automated infrastructure provision pipeline deploying secure multi-tier web applications. Created reusable Terraform templates for AWS VPC, RDS, and ECS resources. Set up automated continuous deployment using GitHub Actions, Docker Hub, and AWS CloudWatch monitoring.",
                    "technologies": ["AWS", "Terraform", "Docker", "GitHub Actions", "Shell Scripting", "YAML", "CI/CD"]
                },
                {
                    "name": "Real-time Financial Portfolio Tracker",
                    "description": "A high-performance dashboard displaying real-time financial market analytics and stock values. Integrates WebSocket feeds for live updates. Designed with React, TypeScript, Tailwind CSS, D3.js charts, and a Node.js/Express backend caching data via Redis.",
                    "technologies": ["React", "TypeScript", "Tailwind CSS", "Node.js", "WebSockets", "Redis", "D3.js"]
                },
                {
                    "name": "Automated Medical Image Classifier",
                    "description": "A deep learning service classifying medical chest X-ray scans to detect anomalies. Implemented a Convolutional Neural Network (CNN) in PyTorch. Deployed the model in a Docker container behind a FastAPI backend, utilizing NumPy and Pandas for data preprocessing.",
                    "technologies": ["Python", "PyTorch", "Deep Learning", "FastAPI", "Docker", "NumPy", "Pandas"]
                }
            ]

            documents = [p["description"] for p in default_projects]
            ids = [f"project_{i}" for i in range(len(default_projects))]
            metadatas = [
                {
                    "name": p["name"],
                    "technologies": json.dumps(p["technologies"]),
                    "githubUrl": f"https://github.com/developer/{p['name'].lower().replace(' ', '-')}",
                    "liveUrl": f"https://{p['name'].lower().replace(' ', '-')}.demo.dev"
                }
                for p in default_projects
            ]

            self.projects_collection.add(
                documents=documents,
                ids=ids,
                metadatas=metadatas
            )
            print(f"Seeded {len(default_projects)} default projects into ChromaDB.")
        except Exception as e:
            print(f"Error seeding projects: {e}")

    def _chunk_resume(self, resume_text: str) -> List[Dict]:
        """Segment raw resume text into semantic chunks (experience bullets, skills lines)."""
        chunks = []
        lines = resume_text.strip().split('\n')
        current_section = "general"
        buffer = []

        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue

            # Detect section changes
            lower_line = stripped.lower()
            if any(h in lower_line for h in ['summary', 'profile', 'objective', 'about me']):
                current_section = 'summary'
                if buffer:
                    chunks.append({"text": "\n".join(buffer), "type": "general"})
                    buffer = []
                continue
            elif any(h in lower_line for h in ['skill', 'technologies', 'expertise', 'tools']):
                current_section = 'skills'
                if buffer:
                    chunks.append({"text": "\n".join(buffer), "type": "general"})
                    buffer = []
                continue
            elif any(h in lower_line for h in ['experience', 'work history', 'employment', 'projects']):
                current_section = 'experience'
                if buffer:
                    chunks.append({"text": "\n".join(buffer), "type": "general"})
                    buffer = []
                continue

            # Detect bullets
            bullet_match = re.match(r'^([-*•]|\d+\.)\s+(.*)', stripped)
            if bullet_match:
                bullet_text = bullet_match.group(2).strip()
                if len(bullet_text) > 10:
                    chunks.append({"text": bullet_text, "type": current_section})
            else:
                # Group text blocks into paragraph chunks
                if len(stripped) > 20:
                    buffer.append(stripped)
                    if len(buffer) >= 3:
                        chunks.append({"text": " ".join(buffer), "type": current_section})
                        buffer = []

        if buffer:
            chunks.append({"text": " ".join(buffer), "type": current_section})

        # Process and clean chunks
        processed_chunks = []
        for chunk in chunks:
            text = chunk['text'].replace('**', '').strip()
            if len(text) > 10:
                processed_chunks.append({"text": text, "type": chunk['type']})

        # Fallback if parsing yielded nothing
        if not processed_chunks:
            paragraphs = [p.strip() for p in resume_text.split('\n\n') if len(p.strip()) > 15]
            for p in paragraphs:
                processed_chunks.append({"text": p, "type": "general"})

        return processed_chunks

    def add_resume(self, user_id: str, resume_id: str, resume_text: str, filename: str) -> bool:
        """Parse and index a candidate resume in ChromaDB."""
        try:
            chunks = self._chunk_resume(resume_text)
            if not chunks:
                return False

            # Clear existing data for this specific resume first to avoid duplicates
            self.clear_resume_data(user_id, resume_id)

            documents = [c["text"] for c in chunks]
            ids = [f"{user_id}_{resume_id}_{i}" for i in range(len(chunks))]
            metadatas = [
                {
                    "user_id": user_id,
                    "resume_id": str(resume_id),
                    "filename": filename,
                    "type": c["type"]
                }
                for c in chunks
            ]

            self.resumes_collection.add(
                documents=documents,
                ids=ids,
                metadatas=metadatas
            )
            print(f"Successfully indexed {len(chunks)} chunks for resume {resume_id} (User: {user_id}).")
            return True
        except Exception as e:
            print(f"Error adding resume to ChromaDB: {e}")
            return False

    def query_relevant_resume_elements(self, user_id: str, query_text: str, limit: int = 5) -> List[Dict]:
        """Query ChromaDB for candidate resume chunks matching a job description."""
        try:
            count = self.resumes_collection.count()
            if count == 0:
                return []

            results = self.resumes_collection.query(
                query_texts=[query_text],
                n_results=min(limit, count),
                where={"user_id": user_id}
            )

            retrieved = []
            if results and results['documents'] and len(results['documents'][0]) > 0:
                for idx in range(len(results['documents'][0])):
                    doc = results['documents'][0][idx]
                    meta = results['metadatas'][0][idx]
                    
                    # Cosine distance represents structural alignment. Convert to percentage.
                    distance = results['distances'][0][idx] if 'distances' in results and results['distances'] else 0.5
                    similarity = int((1.0 - distance) * 100)
                    similarity = max(10, min(99, similarity))

                    retrieved.append({
                        "text": doc,
                        "type": meta.get("type"),
                        "similarity": similarity
                    })
            
            # Sort retrieved by similarity descending
            retrieved.sort(key=lambda x: x["similarity"], reverse=True)
            return retrieved
        except Exception as e:
            print(f"Error querying resume from ChromaDB: {e}")
            return []

    def query_relevant_projects(self, query_text: str, limit: int = 3) -> List[Dict]:
        """Query ChromaDB for high-matching reference projects based on the job description."""
        try:
            count = self.projects_collection.count()
            if count == 0:
                return []

            results = self.projects_collection.query(
                query_texts=[query_text],
                n_results=min(limit, count)
            )

            retrieved = []
            if results and results['documents'] and len(results['documents'][0]) > 0:
                for idx in range(len(results['documents'][0])):
                    doc = results['documents'][0][idx]
                    meta = results['metadatas'][0][idx]
                    distance = results['distances'][0][idx] if 'distances' in results and results['distances'] else 0.5
                    
                    # Compute realistic project similarity
                    similarity = int((1.0 - distance) * 100)
                    similarity = max(55, min(98, similarity))

                    retrieved.append({
                        "name": meta.get("name"),
                        "description": doc,
                        "technologies": json.loads(meta.get("technologies", "[]")),
                        "githubUrl": meta.get("githubUrl", ""),
                        "liveUrl": meta.get("liveUrl", ""),
                        "relevanceScore": similarity
                    })
            
            retrieved.sort(key=lambda x: x["relevanceScore"], reverse=True)
            return retrieved
        except Exception as e:
            print(f"Error querying projects from ChromaDB: {e}")
            return []

    def clear_resume_data(self, user_id: str, resume_id: str):
        """Remove specific resume indices from ChromaDB."""
        try:
            self.resumes_collection.delete(
                where={"$and": [{"user_id": user_id}, {"resume_id": str(resume_id)}]}
            )
        except Exception as e:
            # Fallback if compound filter is not fully supported in local version
            try:
                self.resumes_collection.delete(
                    where={"resume_id": str(resume_id)}
                )
            except Exception as ex:
                print(f"Error clearing resume data: {ex}")

    def clear_user_data(self, user_id: str):
        """Remove all data associated with a user."""
        try:
            self.resumes_collection.delete(where={"user_id": user_id})
            print(f"Cleared all ChromaDB entries for user {user_id}.")
        except Exception as e:
            print(f"Error clearing user data: {e}")
