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

interface HeaderAnalysis {
  from: string;
  returnPath: string;
  receivedChain: string[];
  spfResult: string;
  dkimResult: string;
  dmarcResult: string;
  suspiciousFlags: string[];
  isSpoofed: boolean;
}

function parseEmailHeaders(headersText: string): HeaderAnalysis {
  const headers = headersText.split('\n').reduce((acc: Record<string, string>, line: string) => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      const trimmedKey = key.trim().toLowerCase();
      const value = valueParts.join(':').trim();
      if (!acc[trimmedKey]) acc[trimmedKey] = value;
    }
    return acc;
  }, {});

  const suspiciousFlags: string[] = [];
  let isSpoofed = false;

  const from = headers['from'] || 'UNKNOWN';
  const returnPath = headers['return-path'] || 'UNKNOWN';
  
  // Extract domain from From and Return-Path
  const fromDomain = from.match(/@([^\s>]+)/)?.[1] || '';
  const returnPathDomain = returnPath.match(/@([^\s>]+)/)?.[1] || '';

  // Check From/Return-Path mismatch
  if (fromDomain && returnPathDomain && fromDomain !== returnPathDomain) {
    suspiciousFlags.push(`FROM_MISMATCH: From domain (${fromDomain}) differs from Return-Path (${returnPathDomain})`);
    isSpoofed = true;
  }

  // Check SPF result
  const spfResult = headers['received-spf'] || headers['spf'] || 'NO_SPF_HEADER';
  if (spfResult.toLowerCase().includes('fail') || spfResult.toLowerCase().includes('softfail')) {
    suspiciousFlags.push(`SPF_FAILURE: ${spfResult}`);
    isSpoofed = true;
  }

  // Check DKIM result
  const dkimResult = headers['dkim-signature'] ? 'SIGNED' : 'NO_DKIM_SIGNATURE';
  const authResults = headers['authentication-results'] || '';
  if (authResults.includes('dkim=fail')) {
    suspiciousFlags.push('DKIM_FAILURE: DKIM verification failed');
    isSpoofed = true;
  }

  // Check DMARC result
  const dmarcResult = headers['dmarc'] || 'NO_DMARC_RECORD';
  if (authResults.includes('dmarc=fail')) {
    suspiciousFlags.push('DMARC_FAILURE: DMARC policy failed');
    isSpoofed = true;
  }

  // Check for multiple Sender headers
  const senderCount = headersText.match(/^Sender:/gim)?.length || 0;
  if (senderCount > 1) {
    suspiciousFlags.push(`MULTIPLE_SENDERS: Found ${senderCount} Sender headers (potential spoofing)`);
    isSpoofed = true;
  }

  // Check for suspicious X-Originating-IP or X-Mailer
  const originatingIp = headers['x-originating-ip'];
  if (originatingIp && originatingIp.includes('[')) {
    suspiciousFlags.push(`ORIGINATING_IP_EXPOSED: ${originatingIp}`);
  }

  // Extract Received chain
  const receivedChain = headersText
    .split('\n')
    .filter(line => line.toLowerCase().startsWith('received:'))
    .slice(0, 3)
    .map(line => line.substring(9).trim());

  return {
    from,
    returnPath,
    receivedChain,
    spfResult,
    dkimResult,
    dmarcResult,
    suspiciousFlags,
    isSpoofed,
  };
}

export async function POST(req: Request) {
  try {
    const { headers } = await req.json();

    if (!headers || typeof headers !== 'string') {
      return new Response('ERROR: No email headers provided', { status: 400 });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return new Response('ERROR: MISSING_ENV_KEY inside your .env.local file.', { status: 500 });
    }

    // Analyze headers structure locally first
    const headerAnalysis = parseEmailHeaders(headers);
    const analysisContext = `
[LOCAL_HEADER_ANALYSIS]:
- From: ${headerAnalysis.from}
- Return-Path: ${headerAnalysis.returnPath}
- SPF Result: ${headerAnalysis.spfResult}
- DKIM Status: ${headerAnalysis.dkimResult}
- DMARC Status: ${headerAnalysis.dmarcResult}
- Spoofing Risk: ${headerAnalysis.isSpoofed ? 'CRITICAL' : 'LOW'}
${
  headerAnalysis.suspiciousFlags.length > 0
    ? `- Suspicious Indicators:\n${headerAnalysis.suspiciousFlags.map(f => `  • ${f}`).join('\n')}`
    : ''
}
${headerAnalysis.receivedChain.length > 0 ? `- Received Chain (First 3): ${headerAnalysis.receivedChain.slice(0, 3).join(' → ')}` : ''}
`;

    // Use AI for comprehensive authentication & spoofing assessment
    const { text } = await generateText({
      model: openrouter('openrouter/free'),
      messages: [
        {
          role: 'user',
          content: `${analysisContext}\n\nProvide forensic email authentication analysis. Assess: SPF/DKIM/DMARC effectiveness (1-10 each), sender verification confidence (1-10), spoofing probability (1-10), and tactical recommendations. Flag any header anomalies that indicate impersonation. Keep output as terminal-styled security report. Raw headers: ${headers.substring(0, 500)}...`,
        },
      ],
    });

    return new Response(text, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error: any) {
    console.error('EMAIL_ANALYZER PANIC:', error);
    return new Response(`BACKEND_PANIC: ${error?.message || 'Uplink anomaly'}`, { status: 500 });
  }
}
