#!/usr/bin/env node
/*
 * CLI: Portuguese text review & auto-correction
 * Providers: LanguageTool (default) or OpenAI (optional)
 *
 * Usage examples:
 *   node scripts/text-review.js --file docs/exemplo.txt --out docs/exemplo_corrigido.txt
 *   node scripts/text-review.js --file docs/contrato.docx --sections --out docs/contrato_corrigido.txt
 *   node scripts/text-review.js --text "Seu texto aqui" --explain
 *   node scripts/text-review.js --provider openai --file docs/exemplo.txt --out docs/corrigido.txt
 *
 * Options:
 *   --file <path>      : input file (.txt or .docx)
 *   --text <string>    : raw text input (instead of file)
 *   --out <path>       : write corrected output to path (default: print to stdout)
 *   --lang <pt-BR|pt-PT> : language variant (default: pt-BR)
 *   --sections         : process long text in sections (paragraph-based)
 *   --explain          : print explanations of corrections
 *   --provider <languagetool|openai> : choose provider (default: languagetool)
 */
const fs = require('fs');
const path = require('path');
// no unused imports

const argv = require('node:process').argv.slice(2);

function getArg(name) {
  const idx = argv.findIndex((a) => a === name);
  if (idx !== -1) {
    return argv[idx + 1];
  }
  return undefined;
}

const inputFile = getArg('--file');
const inputTextArg = getArg('--text');
const outFile = getArg('--out');
const reportFile = getArg('--report');
const lang = getArg('--lang') || 'pt-BR';
const useSections = argv.includes('--sections');
const explain = argv.includes('--explain');
const provider = getArg('--provider') || 'languagetool';

async function readDocx(filePath) {
  let mammoth;
  try {
    mammoth = require('mammoth');
  } catch (e) {
    throw new Error('Falta dependência mammoth. Instale: npm i mammoth');
  }
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value || '';
}

async function getInputText() {
  if (inputFile) {
    const ext = path.extname(inputFile).toLowerCase();
    if (ext === '.docx') {
      return readDocx(inputFile);
    }
    return fs.promises.readFile(inputFile, 'utf8');
  }
  if (inputTextArg) {
    return inputTextArg;
  }
  // Read from stdin
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => (data += chunk));
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

function splitIntoSections(text) {
  const paragraphs = text.split(/\n\s*\n/); // split on blank lines between paragraphs
  // Group paragraphs into chunks ~ 3000 chars to stay within public LT limits
  const chunks = [];
  let current = '';
  for (const p of paragraphs) {
    if ((current + '\n\n' + p).length > 3000) {
      if (current.trim()) {
        chunks.push(current.trim());
      }
      current = p;
    } else {
      current = current ? current + '\n\n' + p : p;
    }
  }
  if (current.trim()) {
    chunks.push(current.trim());
  }
  return chunks.length ? chunks : [text];
}

async function ltCheck(text, language) {
  const endpoint = 'https://api.languagetool.org/v2/check';
  const params = new URLSearchParams();
  params.set('text', text);
  params.set('language', language);
  params.set('enabledOnly', 'false');
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  if (!res.ok) {
    throw new Error(`LanguageTool error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

async function openaiReview(text, language) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY não definido no ambiente.');
  }
  const endpoint = 'https://api.openai.com/v1/chat/completions';
  const systemPrompt = `Você é um revisor de textos em português (${language}). Corrija gramática, pontuação, concordância e melhore a clareza sem alterar o sentido. Retorne somente o texto corrigido.`;
  const body = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text },
    ],
    temperature: 0.2,
  };
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`OpenAI API error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  const out = data.choices?.[0]?.message?.content || '';
  return { corrected: out, explanations: [] };
}

function applyLtCorrections(text, matches) {
  // Apply replacements from end to start to keep offsets valid
  const sorted = matches
    .filter((m) => Array.isArray(m.replacements) && m.replacements.length)
    .sort((a, b) => b.offset - a.offset);

  let corrected = text;
  const explanations = [];
  for (const m of sorted) {
    const best = m.replacements[0];
    const start = m.offset;
    const end = m.offset + m.length;
    corrected = corrected.slice(0, start) + best.value + corrected.slice(end);
    explanations.push({
      message: m.message,
      short: m.shortMessage,
      rule: m.rule?.id || 'unknown',
      replacement: best.value,
    });
  }
  // Reverse explanations to be chronological
  explanations.reverse();
  return { corrected, explanations };
}

async function reviewChunk(textChunk) {
  if (provider === 'openai') {
    return openaiReview(textChunk, lang);
  }
  const lt = await ltCheck(textChunk, lang);
  return applyLtCorrections(textChunk, lt.matches || []);
}

(async () => {
  const text = await getInputText();
  const chunks = useSections ? splitIntoSections(text) : [text];
  const results = [];
  for (const chunk of chunks) {
    try {
      const r = await reviewChunk(chunk);
      results.push(r);
    } catch (err) {
      console.error('Erro ao revisar seção:', err.message || err);
      // Keep original chunk if provider failed
      results.push({
        corrected: chunk,
        explanations: [{ message: String(err), rule: 'provider_error' }],
      });
    }
  }

  const finalText = results.map((r) => r.corrected).join('\n\n');

  if (outFile) {
    await fs.promises.writeFile(outFile, finalText, 'utf8');
    console.log(`✅ Texto corrigido salvo em: ${outFile}`);
  } else {
    process.stdout.write(finalText + '\n');
  }

  if (explain) {
    console.log('\n📘 Correções:');
    let i = 1;
    for (const r of results) {
      for (const e of r.explanations || []) {
        console.log(
          `${i++}. [${e.rule}] ${e.message}${e.replacement ? ` → ${e.replacement}` : ''}`,
        );
      }
    }
  }

  if (reportFile) {
    const lines = [];
    lines.push('# Text Review Report');
    lines.push('');
    let section = 1;
    for (const r of results) {
      lines.push(`## Section ${section++}`);
      if (r.explanations && r.explanations.length) {
        for (const e of r.explanations) {
          lines.push(`- [${e.rule}] ${e.message}${e.replacement ? ` → ${e.replacement}` : ''}`);
        }
      } else {
        lines.push('- No corrections applied');
      }
      lines.push('');
    }
    await fs.promises.writeFile(reportFile, lines.join('\n'), 'utf8');
    console.log(`📝 Report saved: ${reportFile}`);
  }
})();
