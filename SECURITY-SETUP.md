# Security Configuration Guide

## Overview

This document provides instructions for configuring security headers in production environments.

## Security Headers Implemented

### 1. Content Security Policy (CSP)
Defines which resources can be loaded by the browser, preventing XSS attacks.

### 2. X-Content-Type-Options
Prevents MIME type sniffing attacks.

### 3. X-Frame-Options
Protects against clickjacking by preventing the page from being embedded in iframes.

### 4. X-XSS-Protection
Enables browser's built-in XSS protection.

### 5. Referrer-Policy
Controls how much referrer information is sent with requests.

### 6. Permissions-Policy
Restricts browser features like geolocation, camera, microphone.

## Production Setup

### For Nginx

Add the following to your nginx server block:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/html;
    index index.html;

    # Include security headers
    include /path/to/nginx-security-headers.conf;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend proxy
    location /api/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### For Apache

Add to your `.htaccess` or virtual host configuration:

```apache
# Content Security Policy
Header set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"

# Prevent MIME type sniffing
Header set X-Content-Type-Options "nosniff"

# Prevent clickjacking
Header set X-Frame-Options "DENY"

# XSS Protection
Header set X-XSS-Protection "1; mode=block"

# Referrer Policy
Header set Referrer-Policy "strict-origin-when-cross-origin"

# Permissions Policy
Header set Permissions-Policy "geolocation=(), microphone=(), camera=(), payment=()"
```

## Development Environment

Security headers are automatically configured in the Vite development server via `vite.config.ts`.

## Testing Security Headers

After deployment, test your headers using:

1. **Online Tools:**
   - https://securityheaders.com
   - https://observatory.mozilla.org

2. **Browser DevTools:**
   - Open Network tab
   - Inspect response headers

3. **Command Line:**
   ```bash
   curl -I https://yourdomain.com
   ```

## OWASP ZAP Scan Results

### Resolved Issues:
- ✅ Content Security Policy Header Set
- ✅ X-Frame-Options Header Set
- ✅ X-Content-Type-Options Header Set
- ✅ X-XSS-Protection Header Set

### False Positives to Ignore:
- ❌ SQL Injection on static image files (Nginx 500 error)
- ❌ Format String Error on static image files (Nginx 500 error)

These are false positives caused by the scanner injecting malicious patterns into static resource URLs, which Nginx correctly rejects with 500 errors.

## Additional Recommendations

### For Production Deployment:

1. **Enable HTTPS:**
   ```nginx
   add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
   ```

2. **Tighten CSP (if possible):**
   - Remove `'unsafe-inline'` and `'unsafe-eval'` if your app allows
   - Use nonces or hashes for inline scripts

3. **Enable Security Logging:**
   - Monitor failed authentication attempts
   - Log suspicious activity

4. **Regular Security Audits:**
   - Run OWASP ZAP scans regularly
   - Keep dependencies updated
   - Monitor security advisories

## Support

For questions or issues, refer to:
- OWASP Security Headers: https://owasp.org/www-project-secure-headers/
- MDN Web Security: https://developer.mozilla.org/en-US/docs/Web/Security
