#!/usr/bin/env python3
"""
SkillSync Automator - AI-Powered Job Search Automation
Main automation script for GitHub Actions workflow.
"""

import os
import json
import base64
import logging
import requests
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import PyPDF2
import docx
from io import BytesIO

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('automation.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class SkillSyncAutomator:
    def __init__(self):
        """Initialize the SkillSync automation system."""
        self.github_token = os.getenv('GITHUB_TOKEN')
        self.hf_api_key = os.getenv('HUGGINGFACE_API_KEY')
        self.email_api_key = os.getenv('EMAIL_API_KEY')
        self.user_email = os.getenv('USER_EMAIL')
        self.github_repo = os.getenv('GITHUB_REPOSITORY')
        self.webhook_url = os.getenv('WEBHOOK_URL')
        
        # Create necessary directories
        self.ensure_directories()
        
        # Hugging Face models
        self.resume_analyzer_model = "microsoft/DialoGPT-medium"
        self.resume_generator_model = "microsoft/DialoGPT-medium" 
        self.audit_model = "sentence-transformers/all-MiniLM-L6-v2"
        
        logger.info("SkillSync Automator initialized")
    
    def ensure_directories(self):
        """Create necessary directories if they don't exist."""
        directories = ['resumes', 'jobs', 'generated_resumes', 'reports']
        for directory in directories:
            Path(directory).mkdir(exist_ok=True)
    
    def get_master_resume(self) -> Optional[str]:
        """Extract text from the master resume file."""
        resume_dir = Path('resumes')
        
        if not resume_dir.exists() or not list(resume_dir.glob('*')):
            logger.warning("No master resume found in resumes/ directory")
            return None
            
        # Get the most recent resume file
        resume_files = list(resume_dir.glob('*'))
        latest_resume = max(resume_files, key=os.path.getctime)
        
        logger.info(f"Processing master resume: {latest_resume.name}")
        
        try:
            if latest_resume.suffix.lower() == '.pdf':
                return self.extract_pdf_text(latest_resume)
            elif latest_resume.suffix.lower() == '.docx':
                return self.extract_docx_text(latest_resume)
            else:
                logger.error(f"Unsupported file format: {latest_resume.suffix}")
                return None
        except Exception as e:
            logger.error(f"Error extracting resume text: {str(e)}")
            return None
    
    def extract_pdf_text(self, file_path: Path) -> str:
        """Extract text from PDF file."""
        text = ""
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\\n"
        return text.strip()
    
    def extract_docx_text(self, file_path: Path) -> str:
        """Extract text from DOCX file."""
        doc = docx.Document(file_path)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\\n"
        return text.strip()
    
    def analyze_resume_with_llm(self, resume_text: str) -> Dict:
        """Analyze resume using Hugging Face LLM to extract skills and suitable job titles."""
        logger.info("Analyzing resume with AI...")
        
        prompt = f"""
        Analyze this resume and extract:
        1. Key technical skills and technologies
        2. Years of experience
        3. Suitable job titles/roles
        4. Industry/domain expertise
        
        Resume:
        {resume_text[:2000]}  # Limit input length
        
        Return response as structured data focusing on job search keywords.
        """
        
        try:
            response = requests.post(
                f"https://api-inference.huggingface.co/models/{self.resume_analyzer_model}",
                headers={"Authorization": f"Bearer {self.hf_api_key}"},
                json={"inputs": prompt, "parameters": {"max_new_tokens": 500}},
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                # Parse the LLM response to extract structured data
                analysis = self.parse_llm_analysis(result)
                logger.info(f"Resume analysis completed: {len(analysis.get('skills', []))} skills found")
                return analysis
            else:
                logger.error(f"LLM API error: {response.status_code} - {response.text}")
                return self.fallback_resume_analysis(resume_text)
                
        except Exception as e:
            logger.error(f"Error calling LLM API: {str(e)}")
            return self.fallback_resume_analysis(resume_text)
    
    def parse_llm_analysis(self, llm_response: Dict) -> Dict:
        """Parse LLM response to extract structured resume analysis."""
        # This is a simplified parser - in production, use more sophisticated NLP
        response_text = ""
        if isinstance(llm_response, list) and llm_response:
            response_text = llm_response[0].get('generated_text', '')
        elif isinstance(llm_response, dict):
            response_text = llm_response.get('generated_text', '')
        
        # Extract information using simple keyword matching
        # In production, use more advanced NLP techniques
        analysis = {
            'skills': self.extract_skills_from_text(response_text),
            'job_titles': self.extract_job_titles_from_text(response_text), 
            'experience_years': self.extract_experience_years(response_text),
            'industries': ['Technology', 'Software Development']  # Default
        }
        
        return analysis
    
    def fallback_resume_analysis(self, resume_text: str) -> Dict:
        """Fallback analysis using keyword matching when LLM fails."""
        logger.info("Using fallback resume analysis...")
        
        # Common tech skills
        tech_skills = [
            'Python', 'JavaScript', 'React', 'Node.js', 'AWS', 'Docker', 
            'Kubernetes', 'SQL', 'PostgreSQL', 'MongoDB', 'Git', 'TypeScript',
            'Java', 'C++', 'HTML', 'CSS', 'Vue.js', 'Angular', 'Django', 'Flask'
        ]
        
        # Find skills mentioned in resume
        found_skills = [skill for skill in tech_skills if skill.lower() in resume_text.lower()]
        
        # Common job titles
        job_titles = [
            'Software Engineer', 'Full Stack Developer', 'Frontend Developer',
            'Backend Developer', 'DevOps Engineer', 'Data Scientist', 
            'Product Manager', 'Technical Lead'
        ]
        
        return {
            'skills': found_skills[:10],  # Limit to top 10
            'job_titles': job_titles[:5], # Top 5 job titles
            'experience_years': 3,  # Default
            'industries': ['Technology', 'Software Development']
        }
    
    def extract_skills_from_text(self, text: str) -> List[str]:
        """Extract technical skills from text."""
        # Simplified skill extraction - in production, use NER models
        common_skills = [
            'Python', 'JavaScript', 'React', 'Node.js', 'AWS', 'Docker',
            'Kubernetes', 'SQL', 'TypeScript', 'Git', 'PostgreSQL', 'MongoDB'
        ]
        return [skill for skill in common_skills if skill.lower() in text.lower()]
    
    def extract_job_titles_from_text(self, text: str) -> List[str]:
        """Extract suitable job titles from text."""
        job_titles = [
            'Software Engineer', 'Full Stack Developer', 'Frontend Developer',
            'Backend Developer', 'DevOps Engineer', 'Senior Software Engineer'
        ]
        return job_titles[:5]  # Return top 5
    
    def extract_experience_years(self, text: str) -> int:
        """Extract years of experience from text."""
        # Simplified extraction - look for number patterns
        import re
        years_pattern = r'(\\d+)\\s*year[s]?'
        matches = re.findall(years_pattern, text.lower())
        if matches:
            return int(matches[0])
        return 3  # Default
    
    def search_jobs(self, job_titles: List[str], skills: List[str]) -> List[Dict]:
        """Search for job listings using job titles and skills."""
        logger.info(f"Searching for jobs with titles: {job_titles}")
        
        # Mock job data - in production, integrate with real job APIs
        mock_jobs = [
            {
                'id': f'job_{datetime.now().strftime("%Y%m%d")}_001',
                'title': 'Senior Software Engineer',
                'company': 'TechCorp Inc.',
                'location': 'San Francisco, CA',
                'salary': '$150,000 - $200,000',
                'description': 'We are looking for a senior software engineer with experience in React, Node.js, and AWS. You will work on scalable web applications and mentor junior developers.',
                'requirements': ['5+ years experience', 'React', 'Node.js', 'AWS', 'TypeScript'],
                'posted_date': datetime.now().isoformat(),
                'url': 'https://example-jobs.com/senior-swe-001'
            },
            {
                'id': f'job_{datetime.now().strftime("%Y%m%d")}_002',
                'title': 'Full Stack Developer',
                'company': 'StartupXYZ',
                'location': 'Remote',
                'salary': '$120,000 - $160,000',
                'description': 'Join our fast-growing startup as a full stack developer. Work with modern technologies including React, Python, and PostgreSQL.',
                'requirements': ['3+ years experience', 'JavaScript', 'Python', 'PostgreSQL', 'Docker'],
                'posted_date': datetime.now().isoformat(),
                'url': 'https://example-jobs.com/fullstack-002'
            },
            {
                'id': f'job_{datetime.now().strftime("%Y%m%d")}_003', 
                'title': 'DevOps Engineer',
                'company': 'CloudTech Solutions',
                'location': 'Austin, TX',
                'salary': '$140,000 - $180,000',
                'description': 'We need a DevOps engineer to manage our cloud infrastructure using AWS, Kubernetes, and CI/CD pipelines.',
                'requirements': ['Docker', 'Kubernetes', 'AWS', 'CI/CD', '4+ years experience'],
                'posted_date': datetime.now().isoformat(),
                'url': 'https://example-jobs.com/devops-003'
            }
        ]
        
        # Save job listings
        for job in mock_jobs:
            job_file = Path(f"jobs/job_{job['id']}.json")
            with open(job_file, 'w') as f:
                json.dump(job, f, indent=2)
        
        logger.info(f"Found and saved {len(mock_jobs)} job listings")
        return mock_jobs
    
    def generate_tailored_resume(self, job: Dict, master_resume: str, analysis: Dict) -> Tuple[str, float]:
        """Generate ATS-optimized resume tailored for specific job."""
        logger.info(f"Generating tailored resume for: {job['title']} at {job['company']}")
        
        prompt = f"""
        Create an ATS-optimized resume tailored for this job position.
        
        Job Title: {job['title']}
        Company: {job['company']}
        Requirements: {', '.join(job.get('requirements', []))}
        Job Description: {job['description'][:500]}
        
        Original Resume: {master_resume[:1500]}
        
        Instructions:
        1. Optimize for ATS by including relevant keywords from job description
        2. Highlight matching skills and experiences
        3. Maintain accuracy - do NOT fabricate information
        4. Adjust emphasis to match job requirements
        5. Keep the same factual content but optimize presentation
        
        Generate the tailored resume:
        """
        
        try:
            response = requests.post(
                f"https://api-inference.huggingface.co/models/{self.resume_generator_model}",
                headers={"Authorization": f"Bearer {self.hf_api_key}"},
                json={"inputs": prompt, "parameters": {"max_new_tokens": 1000}},
                timeout=45
            )
            
            if response.status_code == 200:
                result = response.json()
                generated_text = ""
                if isinstance(result, list) and result:
                    generated_text = result[0].get('generated_text', '')
                elif isinstance(result, dict):
                    generated_text = result.get('generated_text', '')
                
                # Extract the generated resume portion
                resume_content = self.extract_resume_from_response(generated_text, prompt)
                
                # Calculate match score based on keyword overlap
                match_score = self.calculate_match_score(resume_content, job)
                
                return resume_content, match_score
            else:
                logger.error(f"Resume generation failed: {response.status_code}")
                return self.create_fallback_resume(job, master_resume, analysis)
                
        except Exception as e:
            logger.error(f"Error generating resume: {str(e)}")
            return self.create_fallback_resume(job, master_resume, analysis)
    
    def extract_resume_from_response(self, response: str, prompt: str) -> str:
        """Extract the resume content from LLM response."""
        # Remove the prompt from the response
        if prompt in response:
            resume_part = response.replace(prompt, '').strip()
        else:
            resume_part = response
            
        # Clean up the response
        lines = resume_part.split('\\n')
        cleaned_lines = [line.strip() for line in lines if line.strip()]
        
        return '\\n'.join(cleaned_lines)
    
    def create_fallback_resume(self, job: Dict, master_resume: str, analysis: Dict) -> Tuple[str, float]:
        """Create a simple tailored resume when LLM fails."""
        logger.info("Creating fallback tailored resume...")
        
        # Simple template-based approach
        tailored_resume = f"""
        TAILORED RESUME FOR {job['title'].upper()}
        
        PROFESSIONAL SUMMARY
        Experienced software professional with expertise in {', '.join(analysis['skills'][:5])}.
        Strong background in software development and technology solutions.
        
        TECHNICAL SKILLS
        {', '.join(analysis['skills'])}
        
        {master_resume}
        
        ADDITIONAL NOTES
        - Resume optimized for {job['company']} {job['title']} position
        - Relevant experience in required technologies
        """
        
        match_score = self.calculate_match_score(tailored_resume, job)
        return tailored_resume, match_score
    
    def calculate_match_score(self, resume: str, job: Dict) -> float:
        """Calculate how well the resume matches the job requirements."""
        job_requirements = job.get('requirements', [])
        job_text = f"{job['title']} {job['description']} {' '.join(job_requirements)}"
        
        # Count matching keywords (simplified approach)
        resume_lower = resume.lower()
        job_lower = job_text.lower()
        
        # Extract important keywords
        job_words = set(job_lower.split())
        resume_words = set(resume_lower.split())
        
        # Remove common words
        common_words = {'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
        job_words = job_words - common_words
        resume_words = resume_words - common_words
        
        if not job_words:
            return 50.0  # Default score
            
        # Calculate overlap
        overlap = len(job_words.intersection(resume_words))
        total_job_words = len(job_words)
        
        match_percentage = (overlap / total_job_words) * 100
        return min(max(match_percentage, 30), 95)  # Keep between 30-95%
    
    def audit_resume(self, generated_resume: str, master_resume: str, job: Dict) -> Dict:
        """Audit generated resume for hallucinations and accuracy."""
        logger.info("Auditing generated resume for accuracy...")
        
        # Simple audit checks
        issues = []
        hallucination_score = 0.0
        
        # Check for basic consistency
        master_lines = set(master_resume.lower().split('\\n'))
        generated_lines = set(generated_resume.lower().split('\\n'))
        
        # Look for completely new lines that might be hallucinations
        new_lines = generated_lines - master_lines
        concerning_additions = []
        
        for line in new_lines:
            line = line.strip()
            if len(line) > 20:  # Only check substantial additions
                # Check if it contains specific claims that could be fabricated
                if any(keyword in line for keyword in ['worked at', 'employed by', 'certified in', 'degree from']):
                    concerning_additions.append(line)
                    hallucination_score += 0.5
        
        # Create issues for concerning additions
        for addition in concerning_additions:
            issues.append({
                'type': 'potential_hallucination',
                'severity': 'medium',
                'description': f'Potentially fabricated content: {addition[:100]}...',
                'suggestion': 'Verify this information exists in the master resume'
            })
        
        # Keep hallucination score reasonable
        hallucination_score = min(hallucination_score, 5.0)
        
        overall_score = max(95 - (hallucination_score * 5), 70)
        
        audit_result = {
            'overall_score': overall_score,
            'hallucination_score': hallucination_score,
            'issues': issues,
            'status': 'passed' if hallucination_score <= 1.0 else ('warning' if hallucination_score <= 3.0 else 'failed'),
            'recommendations': [
                'Verify all claims match the master resume',
                'Ensure no fabricated work experience or skills',
                'Check that dates and company names are accurate'
            ]
        }
        
        return audit_result
    
    def save_resume_and_report(self, job: Dict, resume_content: str, audit_result: Dict, match_score: float):
        """Save generated resume and audit report."""
        job_id = job['id']
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Save resume (as text for now - in production, convert to PDF)
        resume_filename = f"resume_{job['company'].replace(' ', '').lower()}_{job_id}.txt"
        resume_path = Path(f"generated_resumes/{resume_filename}")
        
        with open(resume_path, 'w', encoding='utf-8') as f:
            f.write(f"RESUME FOR: {job['title']} at {job['company']}\\n")
            f.write(f"Generated: {datetime.now().isoformat()}\\n")
            f.write(f"Match Score: {match_score:.1f}%\\n")
            f.write("=" * 50 + "\\n\\n")
            f.write(resume_content)
        
        # Save audit report
        report_filename = f"audit_report_{job_id}_{timestamp}.txt"
        report_path = Path(f"reports/{report_filename}")
        
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(f"AUDIT REPORT\\n")
            f.write(f"Job: {job['title']} at {job['company']}\\n")
            f.write(f"Generated: {datetime.now().isoformat()}\\n")
            f.write("=" * 50 + "\\n\\n")
            f.write(f"Overall Score: {audit_result['overall_score']:.1f}%\\n")
            f.write(f"Hallucination Score: {audit_result['hallucination_score']:.1f}%\\n")
            f.write(f"Status: {audit_result['status'].upper()}\\n\\n")
            
            if audit_result['issues']:
                f.write("ISSUES FOUND:\\n")
                for i, issue in enumerate(audit_result['issues'], 1):
                    f.write(f"{i}. {issue['description']}\\n")
                    f.write(f"   Suggestion: {issue['suggestion']}\\n\\n")
            else:
                f.write("No issues found.\\n")
        
        logger.info(f"Saved resume: {resume_filename}")
        logger.info(f"Saved audit report: {report_filename}")
        
        return resume_path, report_path
    
    def send_notification_email(self, job: Dict, audit_result: Dict, resume_path: Path):
        """Send email notification about generated resume."""
        if not self.email_api_key or not self.user_email:
            logger.warning("Email not configured, skipping notification")
            return
            
        subject = f"Resume Generated: {job['title']} at {job['company']}"
        
        status_emoji = "✅" if audit_result['status'] == 'passed' else ("⚠️" if audit_result['status'] == 'warning' else "❌")
        
        body = f"""
        {status_emoji} Resume Generated Successfully!
        
        Job Details:
        - Position: {job['title']}
        - Company: {job['company']}  
        - Location: {job['location']}
        - Salary: {job.get('salary', 'Not specified')}
        
        Quality Scores:
        - Overall Score: {audit_result['overall_score']:.1f}%
        - Hallucination Score: {audit_result['hallucination_score']:.1f}%
        - Status: {audit_result['status'].title()}
        
        Next Steps:
        1. Review the generated resume in your GitHub repository
        2. Reply to this email with "APPROVE" to apply automatically
        3. Reply with specific changes if modifications are needed
        
        Resume Location: {resume_path}
        Job URL: {job.get('url', 'Not available')}
        
        --
        SkillSync Automator
        """
        
        # Send email using SendGrid (simplified)
        try:
            # This is a mock implementation - replace with actual email service
            logger.info(f"Email notification sent to {self.user_email}")
            logger.info(f"Subject: {subject}")
            
        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
    
    def run_automation(self):
        """Main automation workflow."""
        logger.info("Starting SkillSync job search automation...")
        
        try:
            # Step 1: Get master resume
            master_resume = self.get_master_resume()
            if not master_resume:
                logger.error("No master resume found. Please upload a resume first.")
                return
            
            # Step 2: Analyze resume with AI
            analysis = self.analyze_resume_with_llm(master_resume)
            
            # Step 3: Search for jobs
            jobs = self.search_jobs(analysis['job_titles'], analysis['skills'])
            
            if not jobs:
                logger.info("No new jobs found.")
                return
            
            # Step 4: Process each job
            processed_count = 0
            for job in jobs:
                try:
                    # Generate tailored resume
                    resume_content, match_score = self.generate_tailored_resume(
                        job, master_resume, analysis
                    )
                    
                    # Audit the generated resume
                    audit_result = self.audit_resume(resume_content, master_resume, job)
                    
                    # Check if hallucination score is acceptable
                    if audit_result['hallucination_score'] > 1.0:
                        logger.warning(f"High hallucination score for {job['title']}: {audit_result['hallucination_score']:.1f}%")
                        
                        # Attempt correction (simplified - just regenerate once)
                        if audit_result['hallucination_score'] > 3.0:
                            logger.info("Attempting to regenerate resume with stricter guidelines...")
                            resume_content, match_score = self.create_fallback_resume(job, master_resume, analysis)
                            audit_result = self.audit_resume(resume_content, master_resume, job)
                    
                    # Save resume and audit report
                    resume_path, report_path = self.save_resume_and_report(
                        job, resume_content, audit_result, match_score
                    )
                    
                    # Send notification if audit passed
                    if audit_result['status'] in ['passed', 'warning']:
                        self.send_notification_email(job, audit_result, resume_path)
                    
                    processed_count += 1
                    
                except Exception as e:
                    logger.error(f"Error processing job {job['id']}: {str(e)}")
                    continue
            
            logger.info(f"Automation completed. Processed {processed_count} jobs.")
            
        except Exception as e:
            logger.error(f"Automation failed: {str(e)}")
            raise

def main():
    """Main entry point."""
    logger.info("=" * 60)
    logger.info("SkillSync Automator Starting")
    logger.info("=" * 60)
    
    automator = SkillSyncAutomator()
    automator.run_automation()
    
    logger.info("=" * 60)
    logger.info("SkillSync Automator Completed")
    logger.info("=" * 60)

if __name__ == "__main__":
    main()