# Contributing Guide

> **How to Contribute to Email Outreach Bot**

Thank you for your interest in contributing to Email Outreach Bot! This guide will help you get started with contributing to our project.

## 🤝 How to Contribute

We welcome contributions from developers of all skill levels. Here are the main ways you can contribute:

- **🐛 Bug Reports** - Help us identify and fix issues
- **✨ Feature Requests** - Suggest new features and improvements
- **📝 Documentation** - Improve our docs and guides
- **💻 Code Contributions** - Submit pull requests with code changes
- **🧪 Testing** - Help test new features and bug fixes
- **🔍 Code Review** - Review pull requests from other contributors

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and **npm** 8+
- **Git** for version control
- **MongoDB** (local or Atlas)
- **Redis** (local or cloud)
- Basic knowledge of **TypeScript** and **Express.js**

### Setup Development Environment

1. **Fork the Repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/yourusername/fhg.git
   cd fhg
   ```

2. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/David-patrick-chuks/fhg.git
   ```

3. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Configure your local environment
   # Edit .env.local with your database and Redis credentials
   ```

5. **Database Setup**
   ```bash
   # Start MongoDB (if using local)
   mongod
   
   # Start Redis (if using local)
   redis-server
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📋 Development Workflow

### 1. Create a Feature Branch

```bash
# Always work on a new branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Your Changes

- Write clean, readable code
- Follow our coding standards (see below)
- Add tests for new functionality
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run linting
npm run lint

# Run tests
npm run test

# Run type checking
npm run build
```

### 4. Commit Your Changes

```bash
# Use conventional commit format
git commit -m "feat: add user authentication middleware"
git commit -m "fix: resolve database connection timeout issue"
git commit -m "docs: update API documentation"
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
# Then create a PR on GitHub
```

## 📝 Coding Standards

### TypeScript Guidelines

- Use **strict mode** TypeScript
- Prefer **interfaces** over types for object shapes
- Use **enums** for constants
- Avoid **any** type - use proper typing
- Use **async/await** over Promises

```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

async function createUser(userData: Omit<User, 'id'>): Promise<User> {
  // Implementation
}

// ❌ Avoid
const user: any = { /* ... */ };
function createUser(userData) { /* ... */ }
```

### Express.js Guidelines

- Use **async/await** for route handlers
- Implement proper **error handling**
- Use **middleware** for common functionality
- Follow **RESTful** conventions

```typescript
// ✅ Good
router.post('/users', async (req: Request, res: Response) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// ❌ Avoid
router.post('/users', (req, res) => {
  userService.createUser(req.body)
    .then(user => res.json(user))
    .catch(err => res.status(500).json(err));
});
```

### Error Handling

- Use **custom error classes**
- Implement **global error handler**
- Return **consistent error responses**
- Log errors appropriately

```typescript
// Custom error class
export class ValidationError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Error handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
        details: error.details
      }
    });
  }
  
  // Handle other errors...
});
```

## 🧪 Testing Guidelines

### Unit Tests

- Test **individual functions** and **methods**
- Use **mocking** for external dependencies
- Aim for **90%+ code coverage**
- Test both **success** and **failure** scenarios

```typescript
// Example test
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };
      
      const result = await userService.createUser(userData);
      
      expect(result).toHaveProperty('id');
      expect(result.email).toBe(userData.email);
    });
    
    it('should throw error for invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };
      
      await expect(userService.createUser(userData))
        .rejects
        .toThrow('Invalid email format');
    });
  });
});
```

### Integration Tests

- Test **API endpoints** end-to-end
- Use **test database** for data persistence
- Test **authentication** and **authorization**
- Verify **response formats** and **status codes**

## 📚 Documentation Standards

### Code Documentation

- Use **JSDoc** for functions and classes
- Document **parameters**, **return values**, and **exceptions**
- Provide **usage examples** for complex functions

```typescript
/**
 * Creates a new user account
 * @param userData - User registration data
 * @param userData.email - User's email address
 * @param userData.password - User's password (min 8 chars)
 * @param userData.firstName - User's first name
 * @param userData.lastName - User's last name
 * @returns Promise<User> - Created user object
 * @throws {ValidationError} When user data is invalid
 * @throws {ConflictError} When email already exists
 * 
 * @example
 * ```typescript
 * const user = await createUser({
 *   email: 'john@example.com',
 *   password: 'securePass123',
 *   firstName: 'John',
 *   lastName: 'Doe'
 * });
 * ```
 */
async function createUser(userData: CreateUserData): Promise<User> {
  // Implementation
}
```

### API Documentation

- Document all **endpoints** with examples
- Include **request/response schemas**
- Document **error codes** and **messages**
- Provide **authentication requirements**

## 🔄 Pull Request Process

### Before Submitting

- [ ] Code follows our **coding standards**
- [ ] **Tests pass** and **coverage is maintained**
- [ ] **Documentation is updated**
- [ ] **Linting passes** without errors
- [ ] **Type checking passes**

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] Error handling implemented
```

### Review Process

1. **Automated Checks** - CI/CD pipeline runs tests and linting
2. **Code Review** - Maintainers review your changes
3. **Feedback** - Address any review comments
4. **Merge** - Once approved, your PR will be merged

## 🐛 Bug Reports

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Windows 10, macOS 12]
- Node.js: [e.g., 18.15.0]
- Database: [e.g., MongoDB 6.0]

## Additional Context
Screenshots, logs, or other relevant information
```

## ✨ Feature Requests

### Feature Request Template

```markdown
## Feature Description
Clear description of the feature

## Use Case
Why this feature is needed

## Proposed Solution
How you think it should work

## Alternatives Considered
Other approaches you've considered

## Additional Context
Any other relevant information
```

## 🏷️ Release Process

### Versioning

We use **Semantic Versioning** (SemVer):

- **MAJOR** - Breaking changes
- **MINOR** - New features (backward compatible)
- **PATCH** - Bug fixes (backward compatible)

### Release Notes

- Document **breaking changes**
- List **new features**
- Mention **bug fixes**
- Include **migration guides** if needed

## 🤝 Community Guidelines

### Code of Conduct

- **Be respectful** to all contributors
- **Welcome newcomers** and help them learn
- **Provide constructive feedback**
- **Focus on the code**, not the person

### Communication

- Use **GitHub Issues** for discussions
- Join our **Discord/Slack** for real-time chat
- Be **patient** with responses
- **Ask questions** if you're unsure

## 📞 Getting Help

### Resources

- **GitHub Issues** - For bugs and feature requests
- **GitHub Discussions** - For questions and discussions
- **Documentation** - Check our docs first
- **Code Examples** - Look at existing code

### Contact

- **Maintainers**: @David-patrick-chuks
- **Email**: [your-email@domain.com]
- **Discord**: [your-discord-link]

## 🙏 Recognition

Contributors will be recognized in:

- **README.md** contributors section
- **Release notes**
- **Project documentation**
- **GitHub contributors page**

---

**Thank you for contributing to Email Outreach Bot! 🚀**

*This guide is a living document. Feel free to suggest improvements!*
