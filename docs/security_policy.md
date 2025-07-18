# Security Policy

## Overview

This document outlines the security policies and procedures for the Razgazdayson AI Dream Interpretation Service. Security is a critical aspect of our application given the sensitive nature of dream content and user personal data.

## Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Architecture

### Authentication & Authorization

- **JWT Tokens**: Stateless authentication with short-lived access tokens
- **Telegram OAuth**: Secure authentication through Telegram's OAuth flow
- **Token Refresh**: Automatic token refresh for seamless user experience
- **Role-Based Access**: User roles and permissions system

### Data Protection

- **Encryption at Rest**: All sensitive data encrypted in PostgreSQL
- **Encryption in Transit**: TLS/SSL for all communications
- **Database Security**: Row-level security policies
- **API Security**: Input validation and sanitization

### Infrastructure Security

- **Container Security**: Docker containers with minimal attack surface
- **Network Security**: Firewalls and network segmentation
- **Secrets Management**: Environment variables for sensitive configuration
- **Monitoring**: Real-time security monitoring and alerting

## Security Measures

### Input Validation

- **Dream Text**: 20-4000 character limit with content filtering
- **File Uploads**: Voice files validated and scanned
- **API Parameters**: Strict validation on all API endpoints
- **SQL Injection**: Parameterized queries with SQLAlchemy ORM

### Rate Limiting

- **Per-User Limits**: Based on subscription tier
- **Global Limits**: Protection against abuse
- **API Rate Limits**: Configurable per-endpoint limits
- **Telegram API**: Respect Telegram's rate limits

### Data Privacy

- **GDPR Compliance**: Right to access, modify, and delete user data
- **Data Minimization**: Collect only necessary information
- **Retention Policies**: Automatic data cleanup after defined periods
- **Anonymization**: Personal data anonymization for analytics

### AI Security

- **Prompt Injection**: Protection against malicious prompts
- **Content Filtering**: Inappropriate content detection
- **Model Security**: Secure API key management for OpenAI
- **Response Validation**: AI response sanitization

## Incident Response

### Reporting Security Issues

**DO NOT** report security vulnerabilities through public GitHub issues.

Instead, please email security issues to:
- Email: security@razgazdayson.ru
- Response time: 48 hours maximum

### Incident Response Process

1. **Detection**: Automated monitoring and manual reporting
2. **Assessment**: Risk evaluation and impact analysis
3. **Containment**: Immediate steps to limit damage
4. **Investigation**: Root cause analysis
5. **Recovery**: System restoration and fixes
6. **Lessons Learned**: Process improvements

## Security Configuration

### Environment Variables

Sensitive configuration should never be hardcoded:

```bash
# Backend
OPENAI_API_KEY=sk-...
TELEGRAM_BOT_TOKEN=...
JWT_SECRET_KEY=...
DATABASE_URL=postgresql://...

# Security settings
ALLOWED_ORIGINS=https://razgazdayson.ru
CORS_ORIGINS=https://razgazdayson.ru
WEBHOOK_SECRET=...
```

### Database Security

```sql
-- Enable row-level security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE dreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE dream_interpretations ENABLE ROW LEVEL SECURITY;

-- Create security policies
CREATE POLICY user_dreams_policy ON dreams
    FOR ALL TO authenticated_user
    USING (user_id = current_user_id());
```

### API Security Headers

```python
# Security headers in FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://razgazdayson.ru"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["razgazdayson.ru", "*.razgazdayson.ru"]
)
```

## Security Testing

### Regular Security Audits

- **Code Review**: Security-focused code reviews
- **Dependency Scanning**: Automated vulnerability scanning
- **Penetration Testing**: Regular security assessments
- **Static Analysis**: SAST tools for code analysis

### Security Testing Commands

```bash
# Run security tests
make security-test

# Check for vulnerabilities
make security-scan

# Update dependencies
make security-update
```

## Compliance

### GDPR Compliance

- **Data Subject Rights**: Access, rectification, erasure, portability
- **Privacy by Design**: Security built into system architecture
- **Data Protection Officer**: Designated contact for privacy issues
- **Impact Assessments**: Regular privacy impact assessments

### Security Standards

- **OWASP Top 10**: Protection against common web vulnerabilities
- **ISO 27001**: Information security management
- **SOC 2**: Security controls and monitoring
- **NIST Framework**: Cybersecurity framework compliance

## Monitoring & Alerting

### Security Monitoring

- **Failed Authentication**: Monitor login attempts
- **Suspicious Activity**: Unusual API usage patterns
- **Data Access**: Audit logs for sensitive data access
- **System Changes**: Configuration and code changes

### Alerting Rules

```yaml
# Prometheus alerting rules
groups:
  - name: security
    rules:
      - alert: HighFailedLogins
        expr: rate(failed_logins_total[5m]) > 10
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "High failed login rate detected"
          
      - alert: SuspiciousAPIUsage
        expr: rate(api_requests_total[5m]) > 100
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Suspicious API usage detected"
```

## Security Best Practices

### For Developers

1. **Never commit secrets** to version control
2. **Use environment variables** for configuration
3. **Validate all inputs** before processing
4. **Keep dependencies updated** regularly
5. **Follow secure coding practices**
6. **Review security implications** of changes

### For Operations

1. **Regular security updates** for all systems
2. **Monitor logs** for suspicious activity
3. **Backup encryption keys** securely
4. **Network segmentation** for services
5. **Regular security assessments**
6. **Incident response planning**

## Contact Information

### Security Team

- **Security Email**: security@razgazdayson.ru
- **Emergency Contact**: +7 (xxx) xxx-xxxx
- **Security Officer**: security-officer@razgazdayson.ru

### External Resources

- **OWASP**: https://owasp.org/
- **NIST Cybersecurity Framework**: https://www.nist.gov/cyberframework
- **Telegram Security**: https://core.telegram.org/security

## Updates

This security policy is reviewed and updated:
- **Monthly**: Security posture assessment
- **Quarterly**: Policy review and updates
- **Annually**: Comprehensive security audit
- **As needed**: In response to incidents or threats

---

**Last Updated**: January 2024
**Version**: 1.0
**Next Review**: April 2024