/**
 * Reusable email components
 * Pure HTML building blocks
 */

export const emailStyles = `
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background-color: #f9fafb;
    }
    
    .email-wrapper {
      background-color: #f9fafb;
      padding: 40px 20px;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    
    .email-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 24px;
      text-align: center;
      color: #ffffff;
    }
    
    .email-header h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    
    .email-header .subtitle {
      font-size: 16px;
      opacity: 0.9;
    }
    
    .email-content {
      padding: 40px 24px;
    }
    
    .email-content h2 {
      font-size: 24px;
      color: #1f2937;
      margin-bottom: 16px;
      font-weight: 600;
    }
    
    .email-content p {
      font-size: 16px;
      line-height: 1.8;
      color: #4b5563;
      margin-bottom: 20px;
    }
    
    .email-content ul {
      margin-left: 24px;
      margin-bottom: 24px;
    }
    
    .email-content li {
      font-size: 16px;
      color: #4b5563;
      margin-bottom: 12px;
      line-height: 1.8;
    }
    
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      padding: 14px 40px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      margin-top: 20px;
      margin-bottom: 20px;
      transition: transform 0.2s;
    }
    
    .cta-button:hover {
      opacity: 0.9;
    }
    
    .divider {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 32px 0;
    }
    
    .email-footer {
      background-color: #f3f4f6;
      padding: 32px 24px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    
    .email-footer p {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 8px;
    }
    
    .email-footer a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }
    
    .email-footer a:hover {
      text-decoration: underline;
    }
    
    .feature-list {
      background-color: #f9fafb;
      border-left: 4px solid #667eea;
      padding: 20px;
      border-radius: 6px;
      margin: 24px 0;
    }
    
    .feature-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 12px;
    }
    
    .feature-item:last-child {
      margin-bottom: 0;
    }
    
    .feature-icon {
      font-size: 20px;
      margin-right: 12px;
      min-width: 24px;
    }
    
    .feature-text {
      flex: 1;
      font-size: 15px;
      color: #4b5563;
    }
    
    .signature {
      font-size: 14px;
      color: #6b7280;
      margin-top: 20px;
      font-style: italic;
    }
  </style>
`;

export function emailHeader(title: string, subtitle?: string): string {
  return `
    <div class="email-header">
      <h1>${title}</h1>
      ${subtitle ? `<p class="subtitle">${subtitle}</p>` : ''}
    </div>
  `;
}

export function emailGreeting(name: string): string {
  return `
    <h2>Salut ${name}! 👋</h2>
  `;
}

export function emailParagraph(content: string): string {
  return `<p>${content}</p>`;
}

export function emailFeatureList(features: Array<{ icon: string; title: string; description: string }>): string {
  const items = features
    .map(
      (f) => `
    <div class="feature-item">
      <div class="feature-icon">${f.icon}</div>
      <div class="feature-text">
        <strong>${f.title}</strong> — ${f.description}
      </div>
    </div>
  `
    )
    .join('');

  return `<div class="feature-list">${items}</div>`;
}

export function emailCTA(text: string, href: string): string {
  return `<a href="${href}" class="cta-button">${text}</a>`;
}

export function emailDivider(): string {
  return `<hr class="divider">`;
}

export function emailFooter(email: string, company: string = 'Astra'): string {
  return `
    <div class="email-footer">
      <p>Des questions? Contacte-nous à <a href="mailto:${email}">${email}</a></p>
      <p>© 2026 ${company}. Construisons ensemble. ✨</p>
    </div>
  `;
}

export function emailWrapper(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${emailStyles}
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            ${content}
          </div>
        </div>
      </body>
    </html>
  `;
}
