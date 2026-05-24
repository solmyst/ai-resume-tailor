# AI Resume Tailor - Complete Project Breakdown

## 1. What We Just Accomplished
- **Automated Testing**: Created a comprehensive testing suite using Vitest, React Testing Library, and jsdom. We wrote 86 robust unit tests covering:
  - The core 4-component ATS scoring engine (Keyword match, Layout parsability, Quantifiable metrics, Active verbs).
  - Resume format validations, AI output parsing, App configurations, step navigation workflows, type checking, API integration edge cases, and file upload validation.
- **CI/CD Pipeline**: Set up a fully automated 5-stage GitHub Actions pipeline (`.github/workflows/ci.yml`) that runs on every push and pull request. It lints the code, runs frontend and backend tests, verifies the build, and securely auto-deploys to GitHub Pages upon success.
- **Deployment & Architecture Fixes**: Fixed backend API connection issues by adjusting Render deployment configurations. Handled dynamic port bindings (`0.0.0.0:$PORT`) and configured proper virtual environment installation paths using a custom `render-build` script, ensuring a seamless Full-Stack setup (GitHub Pages for Frontend + Render for Backend).
- **Documentation Updates**: Updated your `README.md` to proudly showcase these new enterprise-grade DevOps and Testing skills.

## 2. How the Frontend Works
- **Stack**: Built with **React 18** and **TypeScript** for strong type safety, using **Vite** for lightning-fast bundling.
- **Styling**: Leverages **Tailwind CSS** combined with custom glassmorphism utilities to create a highly premium, modern, and engaging user interface.
- **Routing & State**: Managed within `App.tsx` and context-based state to transition users smoothly between the Landing Page, Dashboard, and the actual Resume Tailor workshop.
- **Communication**: Uses native `fetch` to connect to the backend (falling back to Render in production via environment variables `VITE_API_URL`).

## 3. How the Backend Works
- **Stack**: A **Python Flask** server handling RESTful routing, augmented with **Flask-CORS** to safely accept cross-origin requests from the frontend.
- **Database**: Uses **SQLite** with **Flask-SQLAlchemy** as an ORM to persistently track users, uploaded resumes, parsed jobs, tailored results, and activity logs locally.
- **Document Processing**: Uses **PyPDF2** and **python-docx** to reliably extract plaintext from various resume document formats, ensuring no critical data is lost before AI processing.
- **PDF Generation**: Dynamically formats tailored Markdown responses into clean, ATS-friendly PDF documents utilizing **ReportLab**, adjusting margins, styles, and spacings mathematically.

## 4. The AI & Vector Database (RAG) Architecture
- **Multi-Provider LLM Engine**: The `ai_service.py` is configured as a flexible AI manager that seamlessly routes generation requests to **OpenAI (GPT-4o-mini)**, **Google Gemini 1.5**, a local **Ollama** instance, or a local mock fallback engine.
- **Intelligent Prompting**: The system leverages highly optimized system prompts (`TAILOR_SYSTEM_PROMPT`) instructing the LLM to rewrite your resume strictly to the job description without hallucinating non-existent skills, returning the output alongside a dynamically calculated match score.
- **Vector Search (ChromaDB)**: 
  - To handle massive amounts of experience without overflowing token limits, the backend chunks resumes into bullet points and indexes them into **ChromaDB**.
  - It uses an offline embedding model (`ONNX MiniLM-L6-v2`) to turn these chunks into semantic vectors.
  - When analyzing a job description, it performs a **similarity search** to pull the most mathematically relevant work experience blocks out of the database to feed strictly relevant context to the LLM.
- **ATS Scoring Math**: Validates the end-product using a 4-pillar grading logic:
  - 40% based on Technical Keyword Match.
  - 30% based on section layout detection (Experience, Education, Skills).
  - 20% on finding actionable quantifiable metrics (%, $, numbers).
  - 10% on detecting strong industry action verbs at the start of bullets.
