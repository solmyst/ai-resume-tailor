from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import os
from typing import Dict, List
import PyPDF2
import docx
from io import BytesIO
import json

app = Flask(__name__)
CORS(app)

# OpenAI API key (set as environment variable)
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

class ResumeProcessor:
    def __init__(self):
        self.ats_keywords = [
            'experience', 'skills', 'education', 'projects', 'achievements',
            'responsibilities', 'managed', 'developed', 'implemented', 'led',
            'created', 'designed', 'optimized', 'improved', 'collaborated'
        ]
        
        # Common tech skills for pattern matching
        self.tech_skills = [
            'javascript', 'python', 'java', 'react', 'nodejs', 'node.js', 'sql', 'aws', 
            'docker', 'kubernetes', 'git', 'html', 'css', 'typescript', 'mongodb', 
            'postgresql', 'redis', 'graphql', 'rest', 'angular', 'vue', 'express', 
            'django', 'flask', 'spring', 'laravel', 'ruby', 'php', 'c++', 'c#', 
            'golang', 'rust', 'swift', 'kotlin', 'flutter', 'reactnative', 'firebase',
            'azure', 'gcp', 'terraform', 'jenkins', 'ci/cd', 'agile', 'scrum'
        ]
    
    def extract_text_from_file(self, file_content: bytes, filename: str) -> str:
        """Extract text from uploaded file"""
        try:
            if filename.lower().endswith('.pdf'):
                pdf_reader = PyPDF2.PdfReader(BytesIO(file_content))
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text()
                return text
            elif filename.lower().endswith('.docx'):
                doc = docx.Document(BytesIO(file_content))
                text = ""
                for paragraph in doc.paragraphs:
                    text += paragraph.text + "\n"
                return text
            else:  # txt file
                return file_content.decode('utf-8')
        except Exception as e:
            print(f"Error extracting text: {e}")
            return ""
    
    def extract_skills_and_keywords(self, text: str) -> Dict[str, List[str]]:
        """Extract skills and keywords using pattern matching"""
        text_lower = text.lower()
        
        # Find technical skills
        found_tech_skills = []
        for skill in self.tech_skills:
            if skill in text_lower:
                found_tech_skills.append(skill)
        
        # Extract potential skills using regex patterns
        skill_patterns = [
            r'\b(?:JavaScript|Python|Java|React|Node\.js|SQL|AWS|Docker|Kubernetes|Git)\b',
            r'\b(?:HTML|CSS|TypeScript|MongoDB|PostgreSQL|Redis|GraphQL|REST)\b',
            r'\b(?:Angular|Vue|Express|Django|Flask|Spring|Laravel|Ruby|PHP)\b',
            r'\b(?:C\+\+|C#|Golang|Rust|Swift|Kotlin|Flutter|React Native)\b'
        ]
        
        extracted_skills = []
        for pattern in skill_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            extracted_skills.extend([match.lower() for match in matches])
        
        # Combine and deduplicate
        all_skills = list(set(found_tech_skills + extracted_skills))
        
        # Extract company names (simple pattern)
        company_pattern = r'\b([A-Z][a-z]+ (?:Inc|Corp|LLC|Ltd|Company|Technologies|Systems|Solutions))\b'
        companies = re.findall(company_pattern, text)
        
        return {
            'technical_skills': all_skills[:15],  # Limit to top 15
            'general_skills': self.ats_keywords[:10],  # Use ATS keywords as general skills
            'entities': companies[:5]  # Limit to 5 companies
        }
    
    def analyze_job_description(self, job_text: str) -> Dict[str, any]:
        """Analyze job description to extract requirements"""
        # Extract requirements sections
        requirements_section = self._extract_requirements_section(job_text)
        skills_extracted = self.extract_skills_and_keywords(requirements_section)
        
        # Extract company name (simple pattern)
        company_pattern = r'(?:at|join|@)\s+([A-Z][a-zA-Z\s&]+?)(?:\s|,|\.|\n)'
        company_match = re.search(company_pattern, job_text)
        company = company_match.group(1).strip() if company_match else 'Tech Company'
        
        return {
            'required_skills': skills_extracted['technical_skills'],
            'preferred_skills': skills_extracted['general_skills'][:10],
            'company': company,
            'role': self._extract_role_title(job_text),
            'key_phrases': self._extract_key_phrases(job_text)
        }
    
    def _extract_requirements_section(self, text: str) -> str:
        """Extract requirements/qualifications section"""
        patterns = [
            r'(?i)requirements?:?(.*?)(?=responsibilities|duties|benefits|about|$)',
            r'(?i)qualifications?:?(.*?)(?=responsibilities|duties|benefits|about|$)',
            r'(?i)skills?:?(.*?)(?=responsibilities|duties|benefits|about|$)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.DOTALL)
            if match:
                return match.group(1)
        
        return text  # Return full text if no section found
    
    def _extract_role_title(self, text: str) -> str:
        """Extract job role title"""
        lines = text.split('\n')
        for line in lines[:5]:  # Check first 5 lines
            if any(word in line.lower() for word in ['engineer', 'developer', 'manager', 'analyst', 'specialist']):
                return line.strip()
        return 'Software Engineer'
    
    def _extract_key_phrases(self, text: str) -> List[str]:
        """Extract key phrases from job description"""
        phrases = [
            'team player', 'problem solving', 'communication skills',
            'agile', 'scrum', 'ci/cd', 'microservices', 'scalable',
            'performance optimization', 'code review', 'mentoring'
        ]
        
        found_phrases = []
        text_lower = text.lower()
        for phrase in phrases:
            if phrase in text_lower:
                found_phrases.append(phrase)
        
        return found_phrases
    
    def calculate_similarity_score(self, resume_text: str, job_text: str) -> float:
        """Calculate similarity score using keyword matching"""
        try:
            # Ensure we have valid text
            if not resume_text or not job_text:
                return 0.0
            
            resume_words = set(resume_text.lower().split())
            job_words = set(job_text.lower().split())
            
            # Ensure we have words to compare
            if not resume_words or not job_words:
                return 0.0
            
            # Find common words
            common_words = resume_words.intersection(job_words)
            
            # Calculate Jaccard similarity
            union_words = resume_words.union(job_words)
            similarity = len(common_words) / len(union_words) if len(union_words) > 0 else 0.0
            
            # Boost score for technical skills matches
            job_skills = self.extract_skills_and_keywords(job_text)['technical_skills']
            resume_skills = self.extract_skills_and_keywords(resume_text)['technical_skills']
            
            skill_matches = len(set(job_skills).intersection(set(resume_skills)))
            skill_boost = min(skill_matches * 0.1, 0.3) if skill_matches > 0 else 0.0  # Max 30% boost
            
            final_score = min(similarity + skill_boost, 0.95)  # Cap at 95%
            return max(final_score, 0.0)  # Ensure non-negative
        except Exception as e:
            print(f"Error calculating similarity score: {e}")
            return 0.5  # Return a default score
    
    def tailor_resume_with_ai(self, resume_text: str, job_analysis: Dict, similarity_score: float) -> Dict[str, any]:
        """Use AI to tailor resume content"""
        try:
            # Validate inputs
            if not resume_text or not job_analysis:
                raise ValueError("Invalid resume text or job analysis")
            
            # Try OpenAI first, then fallback
            tailored_text = None
            
            if OPENAI_API_KEY:
                try:
                    import openai
                    client = openai.OpenAI(api_key=OPENAI_API_KEY)
                    
                    prompt = f"""
                    Rewrite this resume to better match the job requirements. Focus on:
                    1. Including relevant keywords: {', '.join(job_analysis.get('required_skills', []))}
                    2. Emphasizing experience related to: {', '.join(job_analysis.get('key_phrases', []))}
                    3. Optimizing for ATS systems
                    4. Maintaining truthfulness while highlighting relevant skills
                    
                    Original Resume:
                    {resume_text}
                    
                    Job Role: {job_analysis.get('role', 'Software Engineer')}
                    Company: {job_analysis.get('company', 'Tech Company')}
                    
                    Provide a tailored version that maintains the original structure but optimizes for this specific role.
                    """
                    
                    response = client.chat.completions.create(
                        model="gpt-3.5-turbo",
                        messages=[
                            {"role": "system", "content": "You are an expert resume writer and ATS optimization specialist."},
                            {"role": "user", "content": prompt}
                        ],
                        max_tokens=1500,
                        temperature=0.7
                    )
                    tailored_text = response.choices[0].message.content
                except Exception as e:
                    print(f"Error with OpenAI: {e}")
                    tailored_text = None
            
            # Fallback to rule-based tailoring
            if not tailored_text:
                tailored_text = self._generate_smart_tailored_resume(resume_text, job_analysis)
            
            # Calculate added keywords safely
            try:
                original_words = set(resume_text.lower().split())
                tailored_words = set(tailored_text.lower().split())
                added_keywords = list(tailored_words - original_words)[:8]  # Top 8 new keywords
            except Exception as e:
                print(f"Error calculating added keywords: {e}")
                added_keywords = []
            
            # Calculate match score safely
            try:
                match_score = min(int(similarity_score * 100) + 15, 95) if similarity_score > 0 else 50
            except Exception as e:
                print(f"Error calculating match score: {e}")
                match_score = 50
            
            return {
                'tailored_text': tailored_text,
                'match_score': match_score,
                'added_keywords': added_keywords,
                'ats_optimized': True
            }
        except Exception as e:
            print(f"Error in tailor_resume_with_ai: {e}")
            # Return a basic tailored resume as fallback
            return {
                'tailored_text': resume_text,  # Return original if all else fails
                'match_score': 50,
                'added_keywords': [],
                'ats_optimized': False
            }
    
    def _generate_smart_tailored_resume(self, resume_text: str, job_analysis: Dict) -> str:
        """Generate an intelligently tailored resume using rule-based approach"""
        try:
            skills_to_add = job_analysis.get('required_skills', ['Python', 'JavaScript'])[:5]
            company = job_analysis.get('company', 'Tech Company')
            role = job_analysis.get('role', 'Software Engineer')
            
            # Extract sections from original resume
            lines = resume_text.split('\n')
            
            # Build tailored resume
            tailored_lines = []
            
            # Add optimized header
            tailored_lines.append("PROFESSIONAL RESUME")
            tailored_lines.append("")
            
            # Add professional summary optimized for the role
            tailored_lines.append("PROFESSIONAL SUMMARY")
            tailored_lines.append(f"Results-driven {role} with proven expertise in {', '.join(skills_to_add[:3])}.")
            tailored_lines.append("Demonstrated ability to deliver high-quality solutions and collaborate effectively in agile environments.")
            tailored_lines.append("Passionate about leveraging technology to solve complex business challenges.")
            tailored_lines.append("")
            
            # Add technical skills section
            tailored_lines.append("TECHNICAL SKILLS")
            tailored_lines.append(f"• Core Technologies: {', '.join(skills_to_add)}")
            tailored_lines.append("• Development: Agile methodologies, CI/CD, Code review, Testing")
            tailored_lines.append("• Tools: Git, Docker, Cloud platforms, Database management")
            tailored_lines.append("")
            
            # Process original content and enhance it
            current_section = ""
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                    
                # Detect section headers
                if any(keyword in line.upper() for keyword in ['EXPERIENCE', 'WORK', 'EMPLOYMENT']):
                    current_section = "EXPERIENCE"
                    tailored_lines.append("PROFESSIONAL EXPERIENCE")
                    tailored_lines.append("")
                elif any(keyword in line.upper() for keyword in ['EDUCATION', 'ACADEMIC']):
                    current_section = "EDUCATION"
                    tailored_lines.append("EDUCATION")
                    tailored_lines.append("")
                elif any(keyword in line.upper() for keyword in ['PROJECT', 'PORTFOLIO']):
                    current_section = "PROJECTS"
                    tailored_lines.append("KEY PROJECTS")
                    tailored_lines.append("")
                else:
                    # Enhance content based on section
                    if current_section == "EXPERIENCE":
                        # Add relevant keywords to experience descriptions
                        enhanced_line = self._enhance_experience_line(line, skills_to_add)
                        tailored_lines.append(enhanced_line)
                    else:
                        tailored_lines.append(line)
            
            # Add projects section if not present
            if "PROJECTS" not in resume_text.upper():
                tailored_lines.append("")
                tailored_lines.append("KEY PROJECTS")
                project_suggestions = self.suggest_portfolio_projects(job_analysis)
                for i, project in enumerate(project_suggestions[:3]):
                    skill_index = i % len(skills_to_add) if skills_to_add else 0
                    skill_name = skills_to_add[skill_index] if skills_to_add else 'modern technologies'
                    tailored_lines.append(f"• {project}: Relevant project demonstrating {skill_name} expertise")
            
            return '\n'.join(tailored_lines)
        except Exception as e:
            print(f"Error generating smart tailored resume: {e}")
            # Return enhanced version of original resume
            return f"""PROFESSIONAL RESUME

PROFESSIONAL SUMMARY
Experienced {role} with strong technical background and proven ability to deliver high-quality solutions.

TECHNICAL SKILLS
• Core Technologies: {', '.join(skills_to_add) if skills_to_add else 'Various programming languages'}
• Development: Agile methodologies, Version control, Testing
• Tools: Modern development tools and frameworks

ORIGINAL CONTENT
{resume_text}

KEY PROJECTS
• Portfolio Project: Demonstrating technical expertise and problem-solving skills
• Web Application: Full-stack development project
• API Development: Backend services and integration"""
    
    def _enhance_experience_line(self, line: str, skills: List[str]) -> str:
        """Enhance experience bullet points with relevant keywords"""
        if line.startswith('•') or line.startswith('-'):
            # This is a bullet point, enhance it
            if any(skill.lower() in line.lower() for skill in skills):
                return line  # Already has relevant skills
            else:
                # Add a relevant skill if the line talks about development/implementation
                if any(word in line.lower() for word in ['developed', 'built', 'created', 'implemented', 'designed']):
                    return f"{line} using {skills[0] if skills else 'modern technologies'}"
        return line
    
    def suggest_portfolio_projects(self, job_analysis: Dict) -> List[str]:
        """Suggest relevant portfolio projects based on job requirements"""
        role = job_analysis['role'].lower()
        skills = job_analysis['required_skills']
        
        project_suggestions = []
        
        if 'react' in skills or 'frontend' in role:
            project_suggestions.append("E-commerce Platform with React & TypeScript")
            project_suggestions.append("Real-time Chat Application")
        
        if 'node' in skills or 'backend' in role:
            project_suggestions.append("RESTful API with Node.js & Express")
            project_suggestions.append("Microservices Architecture")
        
        if 'aws' in skills or 'cloud' in role:
            project_suggestions.append("AWS Serverless Application")
            project_suggestions.append("CI/CD Pipeline with AWS")
        
        if 'python' in skills:
            project_suggestions.append("Machine Learning Model Deployment")
            project_suggestions.append("Data Analysis Dashboard")
        
        # Default suggestions
        if not project_suggestions:
            project_suggestions = [
                "Full-Stack Web Application",
                "API Integration Project",
                "Database Design & Implementation"
            ]
        
        return project_suggestions[:5]  # Return top 5 suggestions

# Initialize processor
processor = ResumeProcessor()

@app.route('/api/upload-resume', methods=['POST'])
def upload_resume():
    """Handle resume file upload and initial processing"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Extract text from file
        file_content = file.read()
        resume_text = processor.extract_text_from_file(file_content, file.filename)
        
        if not resume_text:
            return jsonify({'error': 'Could not extract text from file'}), 400
        
        # Extract skills and information
        extracted_data = processor.extract_skills_and_keywords(resume_text)
        
        return jsonify({
            'success': True,
            'resume_text': resume_text,
            'filename': file.filename,
            'extracted_data': extracted_data
        })
    
    except Exception as e:
        return jsonify({'error': f'Processing error: {str(e)}'}), 500

@app.route('/api/analyze-job', methods=['POST'])
def analyze_job():
    """Analyze job description and extract requirements"""
    try:
        data = request.get_json()
        job_text = data.get('job_description', '')
        
        if not job_text:
            return jsonify({'error': 'Job description is required'}), 400
        
        # Analyze job description
        job_analysis = processor.analyze_job_description(job_text)
        
        return jsonify({
            'success': True,
            'job_analysis': job_analysis
        })
    
    except Exception as e:
        return jsonify({'error': f'Analysis error: {str(e)}'}), 500

@app.route('/api/tailor-resume', methods=['POST'])
def tailor_resume():
    """Tailor resume based on job description"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        resume_text = data.get('resume_text', '').strip()
        job_text = data.get('job_description', '').strip()
        
        if not resume_text:
            return jsonify({'error': 'Resume text is required'}), 400
        if not job_text:
            return jsonify({'error': 'Job description is required'}), 400
        
        print(f"Processing resume tailoring request...")
        print(f"Resume length: {len(resume_text)} characters")
        print(f"Job description length: {len(job_text)} characters")
        
        # Analyze job description
        job_analysis = processor.analyze_job_description(job_text)
        print(f"Job analysis completed: {job_analysis.get('role', 'Unknown role')}")
        
        # Calculate similarity score
        similarity_score = processor.calculate_similarity_score(resume_text, job_text)
        print(f"Similarity score: {similarity_score}")
        
        # Tailor resume with AI
        tailored_result = processor.tailor_resume_with_ai(resume_text, job_analysis, similarity_score)
        print(f"Resume tailoring completed, match score: {tailored_result.get('match_score', 0)}")
        
        # Get project suggestions
        project_suggestions = processor.suggest_portfolio_projects(job_analysis)
        
        return jsonify({
            'success': True,
            'tailored_resume': tailored_result['tailored_text'],
            'match_score': tailored_result['match_score'],
            'added_keywords': tailored_result['added_keywords'],
            'suggested_projects': project_suggestions,
            'ats_optimized': tailored_result['ats_optimized'],
            'job_analysis': job_analysis
        })
    
    except Exception as e:
        print(f"Error in tailor_resume endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Tailoring error: {str(e)}'}), 500

# In-memory storage for demo (in production, use a database)
user_data = {}

@app.route('/api/user/<user_id>/stats', methods=['GET'])
def get_user_stats(user_id):
    """Get user statistics"""
    try:
        stats = user_data.get(user_id, {
            'resumes_tailored': 0,
            'average_match_score': 0,
            'applications_sent': 0,
            'recent_activity': []
        })
        
        return jsonify({
            'success': True,
            'stats': stats
        })
    except Exception as e:
        return jsonify({'error': f'Failed to get user stats: {str(e)}'}), 500

@app.route('/api/user/<user_id>/activity', methods=['POST'])
def add_user_activity(user_id):
    """Add user activity"""
    try:
        data = request.get_json()
        action = data.get('action', '')
        match_score = data.get('match_score', 0)
        
        if user_id not in user_data:
            user_data[user_id] = {
                'resumes_tailored': 0,
                'average_match_score': 0,
                'applications_sent': 0,
                'recent_activity': [],
                'match_scores': []
            }
        
        # Add activity
        activity = {
            'id': len(user_data[user_id]['recent_activity']) + 1,
            'action': action,
            'time': 'Just now',
            'status': 'completed'
        }
        
        user_data[user_id]['recent_activity'].insert(0, activity)
        
        # Keep only last 10 activities
        user_data[user_id]['recent_activity'] = user_data[user_id]['recent_activity'][:10]
        
        # Update stats
        if 'tailored' in action.lower():
            user_data[user_id]['resumes_tailored'] += 1
            
            # Track match score
            if match_score > 0:
                user_data[user_id]['match_scores'].append(match_score)
                # Calculate average match score
                scores = user_data[user_id]['match_scores']
                user_data[user_id]['average_match_score'] = round(sum(scores) / len(scores))
        
        return jsonify({
            'success': True,
            'activity': activity
        })
    except Exception as e:
        return jsonify({'error': f'Failed to add activity: {str(e)}'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'AI Resume Tailor Backend is running',
        'openai_configured': OPENAI_API_KEY is not None,
        'features': ['file_processing', 'keyword_extraction', 'resume_tailoring', 'ats_optimization']
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)