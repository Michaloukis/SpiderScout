import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

export const maxDuration = 30;

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  headers: {
    'HTTP-Referer': 'http://localhost:3000',
    'X-Title': 'CyberScout AI',
  },
});

interface UrlAnalysis {
  url: string;
  domain: string;
  hasSuspiciousPatterns: boolean;
  riskFactors: string[];
}

function analyzeUrlStructure(urlString: string): UrlAnalysis {
  try {
    const url = new URL(urlString);
    const domain = url.hostname;
    const pathname = url.pathname;
    
    const riskFactors: string[] = [];
    let hasSuspiciousPatterns = false;

    // Check for homograph attacks (lookalike characters)
    if (/[0O][0O]/.test(domain) || /[1l|]/.test(domain)) {
      riskFactors.push('HOMOGRAPH_RISK: Similar-looking characters in domain');
      hasSuspiciousPatterns = true;
    }

    // Check for excessive subdomains (subdomain spoofing)
    const subdomainCount = domain.split('.').length - 2;
    if (subdomainCount > 3) {
      riskFactors.push(`SUBDOMAIN_CHAIN: ${subdomainCount} levels deep (possible spoofing)`);
      hasSuspiciousPatterns = true;
    }

    // Check for IP address instead of domain
    if (/^\d+\.\d+\.\d+\.\d+/.test(domain)) {
      riskFactors.push('IP_DOMAIN: Direct IP address used (avoid SSL cert validation)');
      hasSuspiciousPatterns = true;
    }

    // Check for suspicious TLDs
    const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf'];
    if (suspiciousTLDs.some(tld => domain.endsWith(tld))) {
      riskFactors.push(`SUSPICIOUS_TLD: ${domain.split('.').pop()} is commonly used for phishing`);
      hasSuspiciousPatterns = true;
    }

    // Check for long/obfuscated paths
    if (pathname.length > 100) {
      riskFactors.push('OBFUSCATED_PATH: Unusually long URL path');
      hasSuspiciousPatterns = true;
    }

    // Check for URL encoding or parameters that might hide intent
    if (/%/.test(pathname) || /[?&].*=.*[?&].*=.*[?&]/.test(urlString)) {
      riskFactors.push('URL_OBFUSCATION: Multiple encoded characters or parameters');
      hasSuspiciousPatterns = true;
    }

    // Check HTTPS/HTTP
    if (url.protocol === 'http:') {
      riskFactors.push('NO_ENCRYPTION: HTTP protocol (no SSL/TLS)');
    }

    return {
      url: urlString,
      domain,
      hasSuspiciousPatterns,
      riskFactors,
    };
  } catch (error) {
    return {
      url: urlString,
      domain: 'INVALID',
      hasSuspiciousPatterns: true,
      riskFactors: ['INVALID_URL: Could not parse URL'],
    };
  }
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return new Response('ERROR: No URL provided', { status: 400 });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return new Response('ERROR: MISSING_ENV_KEY inside your .env.local file.', { status: 500 });
    }

    // Analyze URL structure locally first
    const urlAnalysis = analyzeUrlStructure(url);
    const analysisContext = `
[LOCAL_URL_ANALYSIS]:
- Domain: ${urlAnalysis.domain}
- Risk Patterns Detected: ${urlAnalysis.hasSuspiciousPatterns ? 'YES' : 'NO'}
${urlAnalysis.riskFactors.length > 0 ? `- Factors: ${urlAnalysis.riskFactors.join(', ')}` : ''}
`;

    // Use AI for comprehensive threat assessment
    const { text } = await generateText({
      model: openrouter('openrouter/free'),
      messages: [
        {
          role: 'user',
          content: `${analysisContext}\n\nProvide a detailed security assessment of this URL for phishing, malware, and reputation threats. Include scores for: Domain Reputation (1-10), SSL/Certificate Risk (1-10), URL Structure Risk (1-10), Overall Threat Level (1-10). Format as terminal output with threat indicators. URL: ${url}`,
        },
      ],
    });

    return new Response(text, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error: any) {
    console.error('URL_ANALYZER PANIC:', error);
    return new Response(`BACKEND_PANIC: ${error?.message || 'Uplink anomaly'}`, { status: 500 });
  }
}
