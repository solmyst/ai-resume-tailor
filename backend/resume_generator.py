import re
import os
import subprocess
import tempfile
from io import BytesIO
from xml.sax.saxutils import escape as xml_escape
from markdown_it import MarkdownIt
from bs4 import BeautifulSoup

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER


def safe_para(text: str, style) -> Paragraph:
    """Create a Paragraph with XML-escaped text to prevent ReportLab crashes."""
    return Paragraph(xml_escape(str(text)), style)


def parse_tailored_text(tailored_text: str) -> dict:
    """Robustly parse AI markdown output into structured resume sections."""
    sections = {
        'name': '',
        'contact': '',
        'summary': '',
        'skills': [],
        'experience': [],
        'education': [],
        'certifications': [],
        'projects': [],
        'raw_content': []
    }

    # Clean up common AI preambles (e.g. comments, ```markdown, etc.)
    tailored_text = re.sub(r'^```[a-zA-Z]*\n', '', tailored_text)
    tailored_text = re.sub(r'\n```$', '', tailored_text)
    
    # Strip MATCH_SCORE and CHANGES fields if they are still at the end
    tailored_text = re.sub(r'\n*MATCH_SCORE:.*', '', tailored_text, flags=re.IGNORECASE)
    tailored_text = re.sub(r'\n*CHANGES:.*', '', tailored_text, flags=re.IGNORECASE)
    
    lines = tailored_text.strip().split('\n')
    current_section = None
    current_entry = None

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        # Skip horizontal rules/dividers/blockquotes
        if stripped.startswith('>') or stripped.startswith('---') or stripped.startswith('___'):
            continue

        # Name Detection (H1)
        if stripped.startswith('# ') and not stripped.startswith('## '):
            val = stripped.lstrip('# ').strip().replace('**', '').replace('*', '')
            if not sections['name']:
                sections['name'] = val
            continue

        # Section Heading Detection (H2 or Bold heading lines)
        header_match = re.match(r'^(## |### |#### |\*\*)(.*?)(:|\*\*|$)', stripped)
        if header_match:
            header_text = header_match.group(2).strip().lower().replace('*', '').replace(':', '')
            
            # Map header text to a standard section
            new_section = None
            if any(k in header_text for k in ['summary', 'profile', 'objective', 'about']):
                new_section = 'summary'
            elif any(k in header_text for k in ['skills', 'skill', 'technical', 'competenc', 'technologies', 'expertise']):
                new_section = 'skills'
            elif any(k in header_text for k in ['experience', 'work', 'employment', 'history', 'professional']):
                new_section = 'experience'
            elif any(k in header_text for k in ['education', 'academic', 'degree']):
                new_section = 'education'
            elif any(k in header_text for k in ['certif', 'license', 'award']):
                new_section = 'certifications'
            elif any(k in header_text for k in ['project']):
                new_section = 'projects'
            elif any(k in header_text for k in ['analysis', 'keyword', 'match']):
                new_section = 'skip'

            if new_section:
                current_section = new_section
                current_entry = None
                continue

        if current_section == 'skip':
            continue

        # Bullet point detection
        bullet_match = re.match(r'^([-*•]|\d+\.)\s+(.*)', stripped)
        
        # H3 or bold title/entry (Job Title / Company, Degree / University, Project Name)
        is_entry_header = (stripped.startswith('### ') or stripped.startswith('**')) and not bullet_match
        if is_entry_header and current_section in ('experience', 'education', 'projects'):
            entry_text = stripped.lstrip('#* ').strip().replace('**', '').replace('*', '')
            if entry_text:
                current_entry = {'title': entry_text, 'details': '', 'bullets': []}
                sections[current_section].append(current_entry)
                continue

        # Handle bullets
        if bullet_match:
            bullet_text = bullet_match.group(2).strip().replace('**', '').replace('*', '')
            if current_section == 'skills':
                # Split comma-separated skills
                if ',' in bullet_text and len(bullet_text.split(',')) > 1:
                    sections['skills'].extend([s.strip() for s in bullet_text.split(',') if s.strip()])
                else:
                    sections['skills'].append(bullet_text)
            elif current_section in ('experience', 'education', 'projects'):
                if current_entry:
                    current_entry['bullets'].append(bullet_text)
                else:
                    sections[current_section].append(bullet_text)
            elif current_section == 'certifications':
                sections['certifications'].append(bullet_text)
            elif current_section == 'summary':
                sections['summary'] += bullet_text + ' '
            else:
                sections['raw_content'].append(bullet_text)
            continue

        # Handle regular text
        clean_line = stripped.replace('**', '').replace('*', '')
        if current_section == 'summary':
            sections['summary'] += clean_line + ' '
        elif current_section == 'skills':
            if ',' in clean_line:
                sections['skills'].extend([s.strip() for s in clean_line.split(',') if s.strip()])
            else:
                sections['skills'].append(clean_line)
        elif current_section in ('experience', 'education', 'projects'):
            if current_entry:
                if not current_entry['details']:
                    current_entry['details'] = clean_line
                else:
                    current_entry['bullets'].append(clean_line)
            else:
                sections[current_section].append(clean_line)
        elif current_section == 'certifications':
            sections['certifications'].append(clean_line)
        else:
            # Check if contact information
            if not sections['contact'] and any(k in clean_line.lower() for k in ['@', '|', 'phone', 'location', 'linkedin', 'github']):
                sections['contact'] = clean_line
            elif not sections['name'] and not current_section:
                sections['name'] = clean_line
            else:
                sections['raw_content'].append(clean_line)

    sections['summary'] = sections['summary'].strip()
    return sections


def markdown_to_beautiful_html(tailored_text: str) -> str:
    """Render Markdown resume text to HTML and apply custom BS4 styling wrappers."""
    md = MarkdownIt()
    raw_html = md.render(tailored_text)
    
    soup = BeautifulSoup(raw_html, 'html.parser')
    
    # 1. Wrap H3 elements and their adjacent subtitle paragraphs
    for h3 in soup.find_all('h3'):
        sibling = h3.find_next_sibling()
        if sibling and sibling.name in ('p', 'em'):
            sibling_text = sibling.get_text().strip()
            # If it's a date/location detail, not a bullet list or another heading
            if not sibling_text.startswith(('-', '*', '•')):
                wrapper = soup.new_tag('div', attrs={'class': 'entry-header'})
                h3.wrap(wrapper)
                
                sibling_span = soup.new_tag('span', attrs={'class': 'entry-meta'})
                sibling_span.string = sibling_text
                wrapper.append(sibling_span)
                
                # Delete the original sibling paragraph
                sibling.decompose()
                
    # 2. Identify the first paragraph after h1 as contact info
    h1 = soup.find('h1')
    if h1:
        contact_p = h1.find_next_sibling('p')
        if contact_p:
            contact_p['class'] = 'contact-info'
            
    return str(soup)


def generate_pdf_via_chrome(tailored_text: str) -> bytes:
    """Generate a highly professional PDF using Headless Chrome."""
    processed_html_body = markdown_to_beautiful_html(tailored_text)
    
    html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Resume</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        @page {{
            size: letter;
            margin: 0.5in 0.6in;
        }}
        
        body {{
            font-family: 'Inter', sans-serif;
            font-size: 9.5pt;
            line-height: 1.35;
            color: #1e293b;
            margin: 0;
            padding: 0;
        }}
        
        h1 {{
            text-align: center;
            font-size: 20pt;
            font-weight: 800;
            margin-top: 0;
            margin-bottom: 5px;
            color: #0f172a;
            letter-spacing: -0.5px;
        }}
        
        .contact-info {{
            text-align: center;
            font-size: 8.5pt;
            color: #475569;
            margin-top: 0;
            margin-bottom: 15px;
            font-weight: 500;
            line-height: 1.4;
        }}
        
        h2 {{
            font-size: 11pt;
            font-weight: 700;
            text-transform: uppercase;
            color: #1e3a8a;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 2px;
            margin-top: 14px;
            margin-bottom: 8px;
            letter-spacing: 0.5px;
            break-after: avoid;
        }}
        
        .entry-header {{
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-top: 8px;
            margin-bottom: 2px;
            break-after: avoid;
        }}
        
        .entry-header h3 {{
            font-size: 10pt;
            font-weight: 700;
            color: #0f172a;
            margin: 0;
        }}
        
        .entry-meta {{
            font-size: 8.5pt;
            color: #475569;
            font-weight: 500;
            font-style: italic;
        }}
        
        ul {{
            margin-top: 0;
            margin-bottom: 6px;
            padding-left: 15px;
        }}
        
        li {{
            margin-bottom: 2.5px;
            color: #334155;
            break-inside: avoid;
        }}
        
        p {{
            margin-top: 0;
            margin-bottom: 6px;
            color: #334155;
        }}
        
        strong {{
            font-weight: 600;
            color: #0f172a;
        }}
    </style>
</head>
<body>
    {processed_html_body}
</body>
</html>"""

    temp_dir = tempfile.gettempdir()
    html_file = os.path.join(temp_dir, f"resume_{os.urandom(8).hex()}.html")
    pdf_file = os.path.join(temp_dir, f"resume_{os.urandom(8).hex()}.pdf")
    
    try:
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(html_content)
            
        chrome_paths = [
            r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
        ]
        
        chrome_exe = None
        for p in chrome_paths:
            if os.path.exists(p):
                chrome_exe = p
                break
                
        if not chrome_exe:
            chrome_exe = 'chrome'
            
        cmd = [
            chrome_exe,
            "--headless",
            "--disable-gpu",
            "--no-sandbox",
            "--no-pdf-header-footer",
            f"--print-to-pdf={pdf_file}",
            html_file
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
        
        if os.path.exists(pdf_file) and os.path.getsize(pdf_file) > 0:
            with open(pdf_file, 'rb') as f:
                pdf_bytes = f.read()
            return pdf_bytes
        else:
            raise RuntimeError(f"Chrome exit code: {result.returncode}. Stderr: {result.stderr}")
            
    finally:
        try:
            if os.path.exists(html_file):
                os.remove(html_file)
            if os.path.exists(pdf_file):
                os.remove(pdf_file)
        except Exception as e:
            print(f"Error cleaning up PDF temp files: {e}")


def generate_pdf_via_reportlab(tailored_text: str) -> bytes:
    """Fallback ReportLab PDF generator using a robust, clean structure."""
    data = parse_tailored_text(tailored_text)
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        topMargin=0.5 * inch,
        bottomMargin=0.5 * inch,
        leftMargin=0.6 * inch,
        rightMargin=0.6 * inch
    )

    # Styles
    styles = getSampleStyleSheet()
    primary = HexColor('#1e3a5f')
    dark = HexColor('#1a1a2e')
    gray = HexColor('#4a5568')

    name_style = ParagraphStyle('Name', parent=styles['Title'], fontSize=20, leading=24, textColor=dark, spaceAfter=4, alignment=TA_CENTER, fontName='Helvetica-Bold')
    contact_style = ParagraphStyle('Contact', parent=styles['Normal'], fontSize=9, leading=11, textColor=gray, spaceAfter=10, alignment=TA_CENTER, fontName='Helvetica')
    header_style = ParagraphStyle('H', parent=styles['Heading2'], fontSize=11, leading=14, textColor=primary, spaceBefore=12, spaceAfter=4, fontName='Helvetica-Bold')
    title_style = ParagraphStyle('T', parent=styles['Normal'], fontSize=10, leading=12, textColor=dark, spaceBefore=4, spaceAfter=1, fontName='Helvetica-Bold')
    detail_style = ParagraphStyle('D', parent=styles['Normal'], fontSize=8.5, leading=10, textColor=gray, spaceAfter=2, fontName='Helvetica-Oblique')
    body_style = ParagraphStyle('B', parent=styles['Normal'], fontSize=9, leading=12, textColor=dark, spaceAfter=2, fontName='Helvetica')
    bullet_style = ParagraphStyle('Bullet', parent=styles['Normal'], fontSize=9, leading=12, textColor=dark, leftIndent=12, spaceAfter=1.5, fontName='Helvetica')

    elements = []

    # Header
    if data['name']:
        elements.append(safe_para(data['name'], name_style))
    if data['contact']:
        elements.append(safe_para(data['contact'], contact_style))
    
    elements.append(HRFlowable(width="100%", thickness=1, color=primary, spaceBefore=0, spaceAfter=8))

    # Render Summary
    if data['summary']:
        elements.append(Paragraph('PROFESSIONAL SUMMARY', header_style))
        elements.append(HRFlowable(width="100%", thickness=0.2, color=gray, spaceAfter=4))
        elements.append(safe_para(data['summary'], body_style))
        elements.append(Spacer(1, 6))

    # Render Experience
    if data['experience']:
        elements.append(Paragraph('EXPERIENCE', header_style))
        elements.append(HRFlowable(width="100%", thickness=0.2, color=gray, spaceAfter=4))
        for entry in data['experience']:
            if isinstance(entry, dict):
                elements.append(safe_para(entry.get('title', ''), title_style))
                if entry.get('details'):
                    elements.append(safe_para(entry['details'], detail_style))
                for b in entry.get('bullets', []):
                    elements.append(safe_para(f"\u2022 {b}", bullet_style))
                elements.append(Spacer(1, 4))
            else:
                elements.append(safe_para(f"\u2022 {entry}", bullet_style))
                elements.append(Spacer(1, 4))

    # Render Skills
    if data['skills']:
        elements.append(Paragraph('SKILLS', header_style))
        elements.append(HRFlowable(width="100%", thickness=0.2, color=gray, spaceAfter=4))
        skills_text = " \u2022 ".join(data['skills'])
        elements.append(safe_para(skills_text, body_style))
        elements.append(Spacer(1, 6))

    # Render Education/Projects/Certs
    for section in [('EDUCATION', 'education'), ('PROJECTS', 'projects'), ('CERTIFICATIONS', 'certifications')]:
        title, key = section
        if not data[key]: continue
        elements.append(Paragraph(title, header_style))
        elements.append(HRFlowable(width="100%", thickness=0.2, color=gray, spaceAfter=4))
        
        if isinstance(data[key][0], dict):
            for entry in data[key]:
                if isinstance(entry, dict):
                    elements.append(safe_para(entry.get('title', ''), title_style))
                    if entry.get('details'): elements.append(safe_para(entry['details'], detail_style))
                    for b in entry.get('bullets', []): elements.append(safe_para(f"\u2022 {b}", bullet_style))
                    elements.append(Spacer(1, 4))
                else:
                    elements.append(safe_para(f"\u2022 {entry}", bullet_style))
                    elements.append(Spacer(1, 4))
        else:
            for item in data[key]:
                elements.append(safe_para(f"\u2022 {item}", bullet_style))
                elements.append(Spacer(1, 4))

    # Fallback for anything missed
    if data['raw_content']:
        elements.append(Paragraph('ADDITIONAL INFORMATION', header_style))
        elements.append(HRFlowable(width="100%", thickness=0.2, color=gray, spaceAfter=4))
        for line in data['raw_content']:
            elements.append(safe_para(line, body_style))

    doc.build(elements)
    return buffer.getvalue()


def generate_resume_pdf(tailored_text: str) -> bytes:
    """Generate a professional PDF resume from tailored text with robust fallbacks."""
    try:
        pdf_bytes = generate_pdf_via_chrome(tailored_text)
        if pdf_bytes:
            return pdf_bytes
    except Exception as e:
        print(f"[PDF] Headless Chrome rendering failed: {e}. Falling back to ReportLab...")
        
    return generate_pdf_via_reportlab(tailored_text)
