import re
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER


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

    # Clean up common AI preambles
    tailored_text = re.sub(r'^.*?(?=# )', '', tailored_text, flags=re.DOTALL)
    
    lines = tailored_text.strip().split('\n')
    current_section = None
    current_entry = None

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        # Skip blockquotes / dividers
        if stripped.startswith('>') or stripped.startswith('---'):
            continue

        # H1 = Name (usually)
        if stripped.startswith('# ') and not stripped.startswith('## '):
            val = stripped.lstrip('# ').strip().replace('**', '')
            if not sections['name']:
                sections['name'] = val
            else:
                # If we already have a name, this might be a section header
                sections['raw_content'].append(val)
            continue

        # H2 or bold line that looks like a header
        header_match = re.match(r'^(## |### |#### |\*\*)(.*?)(:|\*\*|$)', stripped)
        if header_match:
            header_text = header_match.group(2).strip().lower().replace('*', '')
            
            # Identify section
            new_section = None
            if any(k in header_text for k in ['summary', 'profile', 'objective', 'about']):
                new_section = 'summary'
            elif any(k in header_text for k in ['skill', 'technical', 'competenc', 'technologies', 'expertise']):
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

        # H3 or bold entry (Job Title / Company)
        if (stripped.startswith('### ') or stripped.startswith('**')) and current_section in ('experience', 'education', 'projects'):
            entry_text = stripped.lstrip('#* ').strip().replace('**', '')
            if entry_text:
                current_entry = {'title': entry_text, 'details': '', 'bullets': []}
                sections[current_section].append(current_entry)
                continue

        # Bullet points (flexible detection)
        bullet_match = re.match(r'^([-*•]|\d+\.)\s+(.*)', stripped)
        if bullet_match:
            bullet_text = bullet_match.group(2).strip().replace('**', '')
            if current_section == 'skills':
                # Split comma-separated skills
                if ',' in bullet_text and len(bullet_text.split(',')) > 1:
                    sections['skills'].extend([s.strip() for s in bullet_text.split(',') if s.strip()])
                else:
                    sections['skills'].append(bullet_text)
            elif current_section in ('experience', 'education', 'projects') and current_entry:
                current_entry['bullets'].append(bullet_text)
            elif current_section == 'certifications':
                sections['certifications'].append(bullet_text)
            elif current_section == 'summary':
                sections['summary'] += bullet_text + ' '
            else:
                sections['raw_content'].append(bullet_text)
            continue

        # Regular text - handle based on section
        clean_line = stripped.replace('**', '')
        if current_section == 'summary':
            sections['summary'] += clean_line + ' '
        elif current_section == 'skills':
            if ',' in clean_line:
                sections['skills'].extend([s.strip() for s in clean_line.split(',') if s.strip()])
            else:
                sections['skills'].append(clean_line)
        elif current_section in ('experience', 'education', 'projects') and current_entry:
            if not current_entry['details']:
                current_entry['details'] = clean_line
            else:
                current_entry['bullets'].append(clean_line)
        elif current_section == 'certifications':
            sections['certifications'].append(clean_line)
        else:
            # Detect contact info
            if not sections['contact'] and any(k in clean_line.lower() for k in ['@', '|', 'phone', 'location', 'linkedin', 'github']):
                sections['contact'] = clean_line
            elif not sections['name'] and not current_section:
                sections['name'] = clean_line
            else:
                sections['raw_content'].append(clean_line)

    sections['summary'] = sections['summary'].strip()
    return sections


def generate_resume_pdf(tailored_text: str) -> bytes:
    """Generate a professional PDF resume from tailored text with robust fallbacks."""
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
        elements.append(Paragraph(data['name'], name_style))
    if data['contact']:
        elements.append(Paragraph(data['contact'], contact_style))
    
    elements.append(HRFlowable(width="100%", thickness=1, color=primary, spaceBefore=0, spaceAfter=8))

    # Sections helper
    def add_section(title, content_list, is_bulleted=False):
        if not content_list: return
        elements.append(Paragraph(title.upper(), header_style))
        elements.append(HRFlowable(width="100%", thickness=0.2, color=gray, spaceAfter=4))
        if is_bulleted:
            for item in content_list:
                elements.append(Paragraph(f"• {item}", bullet_style))
        else:
            for item in content_list:
                elements.append(Paragraph(item, body_style))
        elements.append(Spacer(1, 4))

    # Render Summary
    if data['summary']:
        elements.append(Paragraph('PROFESSIONAL SUMMARY', header_style))
        elements.append(HRFlowable(width="100%", thickness=0.2, color=gray, spaceAfter=4))
        elements.append(Paragraph(data['summary'], body_style))
        elements.append(Spacer(1, 6))

    # Render Experience
    if data['experience']:
        elements.append(Paragraph('EXPERIENCE', header_style))
        elements.append(HRFlowable(width="100%", thickness=0.2, color=gray, spaceAfter=4))
        for entry in data['experience']:
            elements.append(Paragraph(entry['title'], title_style))
            if entry['details']:
                elements.append(Paragraph(entry['details'], detail_style))
            for b in entry['bullets']:
                elements.append(Paragraph(f"• {b}", bullet_style))
            elements.append(Spacer(1, 4))

    # Render Skills
    if data['skills']:
        elements.append(Paragraph('SKILLS', header_style))
        elements.append(HRFlowable(width="100%", thickness=0.2, color=gray, spaceAfter=4))
        skills_text = " • ".join(data['skills'])
        elements.append(Paragraph(skills_text, body_style))
        elements.append(Spacer(1, 6))

    # Render Education/Projects/Certs
    for section in [('EDUCATION', 'education'), ('PROJECTS', 'projects'), ('CERTIFICATIONS', 'certifications')]:
        title, key = section
        if not data[key]: continue
        elements.append(Paragraph(title, header_style))
        elements.append(HRFlowable(width="100%", thickness=0.2, color=gray, spaceAfter=4))
        if isinstance(data[key][0], dict):
            for entry in data[key]:
                elements.append(Paragraph(entry['title'], title_style))
                if entry['details']: elements.append(Paragraph(entry['details'], detail_style))
                for b in entry['bullets']: elements.append(Paragraph(f"• {b}", bullet_style))
                elements.append(Spacer(1, 4))
        else:
            for item in data[key]:
                elements.append(Paragraph(f"• {item}", bullet_style))
            elements.append(Spacer(1, 4))

    # Fallback for anything missed
    if data['raw_content']:
        elements.append(Paragraph('ADDITIONAL INFORMATION', header_style))
        elements.append(HRFlowable(width="100%", thickness=0.2, color=gray, spaceAfter=4))
        for line in data['raw_content']:
            elements.append(Paragraph(line, body_style))

    doc.build(elements)
    return buffer.getvalue()
