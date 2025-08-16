# AI Resume Tailor - Frontend

Modern React + TypeScript frontend for the AI Resume Tailor application.

## Features

- 📄 **File Upload**: Drag & drop resume upload with real-time processing
- 🔍 **Job Analysis**: Intelligent job description parsing and skill extraction
- 🤖 **AI Tailoring**: Real-time resume optimization with comparison view
- 📊 **Analytics**: Match scoring and improvement suggestions
- 📱 **Responsive**: Works on desktop, tablet, and mobile devices
- ⚡ **Fast**: Built with Vite for lightning-fast development

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Modern ES6+** features

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## API Integration

The frontend connects to the FastAPI backend running on `http://localhost:8001`.

### API Endpoints Used:
- `POST /upload-resume` - Upload and parse resume files
- `POST /analyze-job` - Analyze job descriptions
- `POST /tailor-resume` - Generate tailored resumes
- `POST /generate-pdf` - Create ATS-optimized PDFs

## Components

### Core Components
- `FileUpload` - Resume file upload with drag & drop
- `JobDescriptionInput` - Job posting analysis
- `ResumeTailor` - AI-powered resume optimization
- `PortfolioSuggestions` - Project recommendations
- `ExportOptions` - PDF generation and download

### UI Components
- `Header` - Application header with branding
- `ProgressSteps` - Multi-step wizard navigation
- `Analytics` - Match scoring and insights
- `ApiStatus` - Backend connection indicator

## Development

### Project Structure
```
src/
├── components/          # React components
├── services/           # API service layer
├── App.tsx            # Main application
├── main.tsx           # Entry point
└── index.css          # Global styles
```

### Styling
- Uses Tailwind CSS for utility-first styling
- Responsive design with mobile-first approach
- Custom color scheme with blue primary colors
- Smooth animations and transitions

### State Management
- React hooks for local state
- Props drilling for component communication
- API service layer for backend integration

## Features in Detail

### File Upload
- Supports PDF, DOCX, and TXT files
- Real-time file processing feedback
- Error handling with user-friendly messages
- Automatic text extraction and parsing

### Job Analysis
- Paste job descriptions or import from URLs
- Real-time skill extraction preview
- Company and role detection
- Requirements vs preferences categorization

### Resume Tailoring
- Side-by-side comparison view
- Keyword optimization highlighting
- ATS compatibility improvements
- Regeneration with different approaches

### Portfolio Matching
- Relevant project suggestions
- Technology stack alignment
- Relevance scoring
- GitHub integration ready

## Deployment

### Development
```bash
npm run dev
```
Runs on `http://localhost:5173`

### Production
```bash
npm run build
npm run preview
```

### Environment Variables
Create `.env` file:
```
VITE_API_BASE_URL=http://localhost:8001
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details