# Contributing to AI Resume Tailor

Thank you for your interest in contributing to AI Resume Tailor! This document provides guidelines and information for contributors.

## 🚀 Quick Start for Contributors

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-resume-tailor.git
   cd ai-resume-tailor
   ```
3. **Test the system**:
   ```bash
   python test_system.py
   ```
4. **Run the demo**:
   ```bash
   python run.py
   ```

## 🛠️ Development Setup

### Backend Development
```bash
# Install dependencies
pip install -r backend/requirements.txt

# Install development dependencies
pip install pytest black flake8 mypy

# Run tests
python test_system.py

# Start development server
python backend/main.py
```

### Frontend Development
```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

## 📋 How to Contribute

### 1. Bug Reports
- Use the GitHub issue tracker
- Include system information (OS, Python version)
- Provide steps to reproduce
- Include error messages and logs

### 2. Feature Requests
- Check existing issues first
- Describe the use case clearly
- Explain why it would be valuable
- Consider implementation complexity

### 3. Code Contributions

#### Areas for Contribution
- **Resume Parsing**: Support for new file formats
- **NLP Enhancement**: Better skill extraction algorithms
- **UI/UX**: Frontend improvements and new features
- **API**: New endpoints and functionality
- **Documentation**: Tutorials, examples, API docs
- **Testing**: Unit tests, integration tests
- **Performance**: Optimization and caching
- **Deployment**: Docker, cloud deployment guides

#### Development Process
1. **Create an issue** or comment on existing one
2. **Fork and create branch**: `git checkout -b feature/your-feature-name`
3. **Make changes** following code style guidelines
4. **Test thoroughly**: Run `python test_system.py`
5. **Update documentation** if needed
6. **Commit with clear messages**
7. **Push and create pull request**

## 🎨 Code Style Guidelines

### Python (Backend)
- Follow PEP 8
- Use type hints where possible
- Write docstrings for functions and classes
- Use meaningful variable names
- Keep functions focused and small

```python
def extract_skills(text: str) -> List[str]:
    """Extract technical skills from resume text.
    
    Args:
        text: Resume text content
        
    Returns:
        List of identified skills
    """
    # Implementation here
```

### TypeScript/React (Frontend)
- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Keep components small and focused
- Use meaningful prop names

```typescript
interface ResumeUploadProps {
  onResumeUploaded: (resume: ParsedResume) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onResumeUploaded }) => {
  // Component implementation
};
```

## 🧪 Testing Guidelines

### Backend Tests
- Test all service functions
- Mock external dependencies
- Test error conditions
- Verify API responses

### Frontend Tests
- Test component rendering
- Test user interactions
- Test API integration
- Test error states

### Running Tests
```bash
# Backend tests
python test_system.py

# Frontend tests
cd frontend && npm test

# API tests
python demo.py
```

## 📚 Documentation

### Code Documentation
- Write clear docstrings
- Include type hints
- Add inline comments for complex logic
- Update API documentation

### User Documentation
- Update README.md for new features
- Add examples and tutorials
- Keep setup instructions current
- Document configuration options

## 🔄 Pull Request Process

1. **Ensure tests pass**: `python test_system.py`
2. **Update documentation** as needed
3. **Write clear PR description**:
   - What changes were made
   - Why they were made
   - How to test them
4. **Link related issues**
5. **Request review** from maintainers

### PR Checklist
- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
- [ ] Commit messages are clear
- [ ] PR description is complete

## 🐛 Debugging Tips

### Common Issues
- **Import errors**: Check Python path and dependencies
- **API errors**: Verify server is running on correct port
- **File parsing errors**: Test with different file formats
- **PDF generation errors**: Check ReportLab installation

### Debugging Tools
- Use `python test_system.py` to isolate issues
- Check API logs in terminal
- Use browser dev tools for frontend issues
- Test API endpoints with `curl` or Postman

## 🌟 Recognition

Contributors will be:
- Listed in the project README
- Mentioned in release notes
- Given credit in documentation

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and ideas
- **Email**: For security issues or private matters

## 🎯 Roadmap

### Short Term
- [ ] Support for more file formats (RTF, ODT)
- [ ] Better error handling and user feedback
- [ ] Performance optimizations
- [ ] More comprehensive tests

### Medium Term
- [ ] LinkedIn profile integration
- [ ] Portfolio project recommendations
- [ ] Batch processing capabilities
- [ ] User accounts and history

### Long Term
- [ ] Job board integrations
- [ ] A/B testing for resume versions
- [ ] Mobile app
- [ ] Enterprise features

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to AI Resume Tailor! 🚀**