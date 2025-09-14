# Contributing to Personal Finance Management System

Thank you for your interest in contributing to the Personal Finance Management System! This guide will help you get started with contributing to the project.

## 🎯 Ways to Contribute

### Code Contributions
- **Bug fixes**: Fix issues and improve stability
- **New features**: Add functionality to enhance the system
- **Performance improvements**: Optimize code and database queries
- **Security enhancements**: Strengthen security measures
- **Test coverage**: Add unit tests and integration tests

### Documentation Contributions
- **API documentation**: Improve endpoint descriptions and examples
- **User guides**: Enhance user experience documentation
- **Developer guides**: Add setup and development instructions
- **Architecture documentation**: Clarify system design and patterns

### Community Contributions
- **Issue reporting**: Report bugs and suggest improvements
- **Feature requests**: Propose new functionality
- **Code reviews**: Review pull requests from other contributors
- **Community support**: Help other users in discussions

## 🚀 Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/personal-finance-management.git
cd personal-finance-management

# Add upstream remote
git remote add upstream https://github.com/quocdaijr/personal-finance-management.git
```

### 2. Set Up Development Environment

Follow the [Setup Instructions](docs/SETUP.md) to configure your development environment:

```bash
# Install dependencies and start services
./scripts/test-docker-setup.sh

# Start development environment
docker-compose -f docker-compose.dev.yml up

# Or manual setup
cd backend && go run cmd/api/main.go
cd analytics && python main.py
```

### 3. Validate Your Setup

```bash
# Run integration tests
./scripts/test-api-integration.sh

# Run unit tests
cd backend && go test ./...
cd analytics && python -m pytest
```

## 📝 Development Workflow

### 1. Create a Feature Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- **Follow coding standards**: Use existing code style and conventions
- **Write tests**: Add unit tests for new functionality
- **Update documentation**: Keep documentation current with changes
- **Commit frequently**: Make small, logical commits with clear messages

### 3. Test Your Changes

```bash
# Run all tests
./scripts/test-api-integration.sh
./scripts/test-docker-setup.sh

# Test specific components
cd backend && go test ./...
cd analytics && python -m pytest
cd frontend && npm test
```

### 4. Submit a Pull Request

```bash
# Push your changes
git push origin feature/your-feature-name

# Create a pull request on GitHub
# Include a clear description of your changes
```

## 🔧 Development Guidelines

### Code Style

#### Go (Backend)
- Follow Go conventions and use `gofmt`
- Use meaningful variable and function names
- Add comments for exported functions and types
- Handle errors appropriately
- Use dependency injection for testability

```go
// Good: Clear function name and error handling
func (s *UserService) CreateUser(req CreateUserRequest) (*User, error) {
    if err := s.validateUserRequest(req); err != nil {
        return nil, fmt.Errorf("validation failed: %w", err)
    }
    // Implementation...
}
```

#### Python (Analytics)
- Follow PEP 8 style guidelines
- Use type hints for function parameters and return values
- Write docstrings for functions and classes
- Use meaningful variable names
- Handle exceptions appropriately

```python
def calculate_spending_trends(
    user_id: int, 
    start_date: datetime, 
    end_date: datetime
) -> List[TrendData]:
    """Calculate spending trends for a user within a date range.
    
    Args:
        user_id: The user's unique identifier
        start_date: Start of the analysis period
        end_date: End of the analysis period
        
    Returns:
        List of trend data points
    """
    # Implementation...
```

#### TypeScript (Frontend)
- Use TypeScript for type safety
- Follow React best practices
- Use meaningful component and variable names
- Write JSDoc comments for complex functions
- Use proper error boundaries

```typescript
interface TransactionFormProps {
  onSubmit: (transaction: TransactionRequest) => Promise<void>;
  initialData?: Transaction;
  isLoading?: boolean;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false
}) => {
  // Implementation...
};
```

### Testing Guidelines

#### Unit Tests
- Write tests for all new functionality
- Test both success and error cases
- Use descriptive test names
- Mock external dependencies
- Aim for high test coverage

#### Integration Tests
- Test API endpoints end-to-end
- Verify database operations
- Test authentication and authorization
- Validate error responses

#### Example Test Structure

```go
func TestUserService_CreateUser(t *testing.T) {
    tests := []struct {
        name    string
        request CreateUserRequest
        want    *User
        wantErr bool
    }{
        {
            name: "valid user creation",
            request: CreateUserRequest{
                Username: "testuser",
                Email:    "test@example.com",
                Password: "password123",
            },
            want: &User{
                Username: "testuser",
                Email:    "test@example.com",
            },
            wantErr: false,
        },
        // More test cases...
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            // Test implementation...
        })
    }
}
```

### Database Changes

#### Migrations
- Create migration files for database schema changes
- Include both up and down migrations
- Test migrations on sample data
- Document breaking changes

```sql
-- migrations/001_add_user_preferences.up.sql
ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{}';
CREATE INDEX idx_users_preferences ON users USING GIN (preferences);

-- migrations/001_add_user_preferences.down.sql
DROP INDEX IF EXISTS idx_users_preferences;
ALTER TABLE users DROP COLUMN IF EXISTS preferences;
```

### API Changes

#### Backward Compatibility
- Maintain backward compatibility when possible
- Version APIs for breaking changes
- Document API changes in pull requests
- Update API documentation

#### New Endpoints
- Follow RESTful conventions
- Use appropriate HTTP methods and status codes
- Implement proper authentication and authorization
- Add comprehensive error handling

## 📋 Pull Request Guidelines

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] Tests pass locally
- [ ] New functionality includes tests
- [ ] Documentation is updated
- [ ] Commit messages are clear and descriptive
- [ ] No merge conflicts with main branch

### Pull Request Template

```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added for new functionality
```

### Review Process

1. **Automated checks**: CI/CD pipeline runs tests and checks
2. **Code review**: Maintainers review code quality and design
3. **Testing**: Reviewers test functionality manually if needed
4. **Approval**: At least one maintainer approval required
5. **Merge**: Squash and merge to main branch

## 🐛 Reporting Issues

### Bug Reports

Use the bug report template and include:

- **Description**: Clear description of the issue
- **Steps to reproduce**: Detailed steps to recreate the bug
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Environment**: OS, browser, versions, etc.
- **Screenshots**: If applicable

### Feature Requests

Use the feature request template and include:

- **Problem description**: What problem does this solve?
- **Proposed solution**: How should it work?
- **Alternatives considered**: Other approaches considered
- **Additional context**: Any other relevant information

## 🏷️ Commit Message Guidelines

### Format

```
type(scope): subject

body

footer
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```bash
feat(auth): add two-factor authentication support

Implement TOTP-based 2FA for enhanced security.
Includes setup, verification, and backup codes.

Closes #123
```

```bash
fix(api): resolve transaction date parsing issue

Fix date format parsing in analytics service that was
causing trends endpoint to fail with certain date formats.

Fixes #456
```

## 🎉 Recognition

Contributors will be recognized in:

- **README.md**: Contributors section
- **Release notes**: Major contributions highlighted
- **GitHub**: Contributor graphs and statistics
- **Community**: Shoutouts in discussions and social media

## 📞 Getting Help

### Communication Channels

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Pull Request Comments**: For code-specific discussions

### Maintainer Contact

- Create an issue for general questions
- Tag maintainers in pull requests for reviews
- Use GitHub discussions for community questions

## 📚 Additional Resources

- [Setup Instructions](docs/SETUP.md)
- [API Documentation](docs/API.md)
- [Architecture Guide](docs/ARCHITECTURE.md)
- [User Guide](docs/USER_GUIDE.md)
- [Database Schema](docs/DATABASE.md)

Thank you for contributing to the Personal Finance Management System! 🚀
