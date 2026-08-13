// Manual test/comparison tooling for the HL7-like QR encoding formats.
// Not used by the app's real encode/decode flow (see src/data/hl7Like.ts for
// that) - this is for anyone who wants to compare the old (legacy) and
// current (optimised) QR encodings on a sample record: character/compression
// sizes, round-trip decode correctness, and similarity between the two
// decoded results.
//
// Usage: import { compareQRCodeEncodings } from '@/src/utils/qr-encoding-metrics'
// and call it with any HL7-like string (the same shape toHL7Like builds
// internally, e.g. "MDH\n...\nEDH\n..."). It logs a metrics table and
// returns the same data as an object.

import {
  base64ToUint8Array,
  compressDataForQRCode,
  decompressDataFromQRCode,
  decodeOptimisedData,
  encodeOptimised,
  numbersToText,
  textToNumbers,
} from '../data/hl7Like';

function decodeLegacyEncodedData(encodedStr: string): string {
  if (!encodedStr || typeof encodedStr !== 'string' || encodedStr.trim().length === 0) {
    throw new Error('Invalid input: encoded string is empty');
  }

  const backToBase64 = numbersToText(encodedStr);
  const uint8Array = base64ToUint8Array(backToBase64);

  if (!uint8Array || uint8Array.length === 0) {
    throw new Error('Base64 to Uint8Array conversion returned null or empty');
  }

  const decompressed = decompressDataFromQRCode(uint8Array);

  if (!decompressed || decompressed.length === 0) {
    throw new Error('Decompression failed or returned invalid data');
  }

  return decompressed;
}

// Levenshtein edit distance, used to score how similar the two decoded
// HL7-like strings are (they should be identical if both encodings round-trip
// correctly; this also surfaces subtle regressions if they don't).
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prevRow = new Array(n + 1);
  let currRow = new Array(n + 1);

  for (let j = 0; j <= n; j++) prevRow[j] = j;

  for (let i = 1; i <= m; i++) {
    currRow[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      currRow[j] = Math.min(
        prevRow[j] + 1,
        currRow[j - 1] + 1,
        prevRow[j - 1] + cost
      );
    }
    [prevRow, currRow] = [currRow, prevRow];
  }

  return prevRow[n];
}

function calculateSimilarity(a: string, b: string): number {
  if (a === b) return 100;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 100;
  const distance = levenshteinDistance(a, b);
  return ((maxLen - distance) / maxLen) * 100;
}

// Hermes (React Native's JS engine) doesn't render console.table as an
// actual table, so we format one ourselves and print it as a plain string.
function logMetricsTable(title: string, rows: Array<{ Metric: string; Value: any; Explanation: string }>) {
  const metricWidth = Math.max(...rows.map(r => r.Metric.length), 'Metric'.length);
  const valueWidth = Math.max(...rows.map(r => String(r.Value).length), 'Value'.length);
  const explanationWidth = Math.max(...rows.map(r => r.Explanation.length), 'Explanation'.length);

  const pad = (s: string, w: number) => s + ' '.repeat(Math.max(0, w - s.length));
  const border = `+${'-'.repeat(metricWidth + 2)}+${'-'.repeat(valueWidth + 2)}+${'-'.repeat(explanationWidth + 2)}+`;

  const lines = [
    title,
    border,
    `| ${pad('Metric', metricWidth)} | ${pad('Value', valueWidth)} | ${pad('Explanation', explanationWidth)} |`,
    border,
    ...rows.map(r => `| ${pad(r.Metric, metricWidth)} | ${pad(String(r.Value), valueWidth)} | ${pad(r.Explanation, explanationWidth)} |`),
    border,
  ];

  console.log(lines.join('\n'));
}

export function compareQRCodeEncodings(data: any) {
  const originalLength = typeof data === 'string' ? data.length : 0;

  const legacy = textToNumbers(compressDataForQRCode(data));
  const optimised = encodeOptimised(data);

  const legacyLength = legacy ? legacy.length : 0;
  const optimisedLength = optimised ? optimised.length : 0;
  const reductionPct = legacyLength > 0 ? ((legacyLength - optimisedLength) / legacyLength) * 100 : 0;

  const legacyCompressionRatio = originalLength > 0 ? legacyLength / originalLength : 0;
  const optimisedCompressionRatio = originalLength > 0 ? optimisedLength / originalLength : 0;

  let legacyDecoded = '';
  let optimisedDecoded = '';

  try {
    legacyDecoded = legacy ? decodeLegacyEncodedData(legacy) : '';
  } catch (error) {
    console.log('Failed to decode legacy encoding:', error);
  }

  try {
    optimisedDecoded = optimised ? decodeOptimisedData(optimised) : '';
  } catch (error) {
    console.log('Failed to decode optimised encoding:', error);
  }

  const legacyDecodedLength = legacyDecoded.length;
  const optimisedDecodedLength = optimisedDecoded.length;
  const decodedLengthDiff = Math.abs(legacyDecodedLength - optimisedDecodedLength);

  let editDistance = 0;
  let similarityPct = 0;
  let exactMatch = false;

  if (legacyDecoded && optimisedDecoded) {
    exactMatch = legacyDecoded === optimisedDecoded;
    editDistance = exactMatch ? 0 : levenshteinDistance(legacyDecoded, optimisedDecoded);
    similarityPct = exactMatch ? 100 : calculateSimilarity(legacyDecoded, optimisedDecoded);
  }

  logMetricsTable('QR Code Encoding Comparison', [
    {
      Metric: 'Original length (chars)',
      Value: originalLength,
      Explanation: 'Text size before compression',
    },
    {
      Metric: 'Legacy encoded length (chars)',
      Value: legacyLength,
      Explanation: "OLD method's QR size",
    },
    {
      Metric: 'Optimised encoded length (chars)',
      Value: optimisedLength,
      Explanation: "NEW method's QR size",
    },
    {
      Metric: 'Encoded size reduction (%)',
      Value: reductionPct.toFixed(2),
      Explanation: 'Higher is better',
    },
    {
      Metric: 'Legacy compression ratio (encoded/original)',
      Value: legacyCompressionRatio.toFixed(3),
      Explanation: 'OLD space per character',
    },
    {
      Metric: 'Optimised compression ratio (encoded/original)',
      Value: optimisedCompressionRatio.toFixed(3),
      Explanation: 'NEW space per character',
    },
    {
      Metric: 'Legacy decoded length (chars)',
      Value: legacyDecodedLength,
      Explanation: 'Should match original size',
    },
    {
      Metric: 'Optimised decoded length (chars)',
      Value: optimisedDecodedLength,
      Explanation: 'Should match original size',
    },
    {
      Metric: 'Decoded length diff (chars)',
      Value: decodedLengthDiff,
      Explanation: 'Should always be zero',
    },
    {
      Metric: 'Decoded edit distance (chars)',
      Value: editDistance,
      Explanation: 'Should always be zero',
    },
    {
      Metric: 'Decoded similarity (%)',
      Value: similarityPct.toFixed(2),
      Explanation: 'Should always be 100%',
    },
    {
      Metric: 'Decoded exact match',
      Value: exactMatch,
      Explanation: 'Should always be true',
    },
  ]);

  return {
    legacy,
    optimised,
    legacyLength,
    optimisedLength,
    reductionPct,
    legacyCompressionRatio,
    optimisedCompressionRatio,
    legacyDecoded,
    optimisedDecoded,
    legacyDecodedLength,
    optimisedDecodedLength,
    decodedLengthDiff,
    editDistance,
    similarityPct,
    exactMatch,
  };
}
