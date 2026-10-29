// QR encoding/sizing metrics for the HL7-like QR encoding formats.
//
// Most of this file (compareQRCodeEncodings and its helpers) is manual
// test/comparison tooling - not used by the app's real encode/decode flow
// (see src/data/hl7Like.ts for that) - for anyone who wants to compare the
// old (legacy) and current (optimised) QR encodings on a sample record:
// character/compression sizes, round-trip decode correctness, and
// similarity between the two decoded results.
//
// Usage: import { compareQRCodeEncodings } from '@/src/utils/qr-encoding-metrics'
// and call it with any HL7-like string (the same shape toHL7Like builds
// internally, e.g. "MDH\n...\nEDH\n..."). It returns the metrics as an
// object, including a preformatted `report` table on `.report` for whoever
// wants to display it.
//
// getQRCodeVersion/getQRPrintWidth below ARE used by the real print flow
// (src/components/Session/formToHTML and .../printSectionsToHTML) to size
// the printed QR to the actual QR version its payload needed.

import QRCode from 'qrcode';
import {
  base64ToUint8Array,
  compressDataForQRCode,
  decompressDataFromQRCode,
  decodeOptimisedData,
  encodeOptimised,
  numbersToText,
  textToNumbers,
} from '../data/hl7Like';

// --- QR print sizing ---
// A QR code's version (1-40) determines its module (grid square) count, and
// therefore how much can be printed before it stops being reliably
// scannable at a given physical size. Printing every QR at a fixed size
// wastes page space on payloads that only needed a low version. Versions at
// or above QR_FULL_SIZE_VERSION keep the current full print size; from
// there down, every QR_STEP_VERSIONS versions shed QR_STEP_CM off the print
// width, until QR_MIN_STEP_VERSION, below which it's clamped to the
// existing small-QR print size (see qrSmall in formToHTML/printSectionsToHTML)
// rather than continuing to shrink.
export const QR_FULL_SIZE_PX = 300; // current fixed print size, versions >= QR_FULL_SIZE_VERSION
export const QR_SMALL_SIZE_PX = 100; // current qrSmall print size; floor for versions <= QR_MIN_STEP_VERSION
const QR_FULL_SIZE_VERSION = 26;
const QR_MIN_STEP_VERSION = 3;
const QR_STEP_VERSIONS = 5;
const QR_STEP_CM = 0.5;
const CM_TO_PX = 37.795275591; // 96px/in ÷ 2.54cm/in
const QR_STEP_PX = QR_STEP_CM * CM_TO_PX;

// ISO/IEC 18004 recommends a quiet zone of at least 4 modules on every side
// of the QR matrix - this is the actual scan-reliability margin baked into
// the SVG itself (the `margin` option passed to QRCode.toString), as
// opposed to the page-layout padding below.
export const QR_QUIET_ZONE_MODULES = 4;
// Printed/exported-to-PDF QRs sit flush against adjacent page content on
// their top and left edges (the two-column print grid puts other content
// right next to them there), so beyond the quiet zone baked into the SVG,
// the wrapping container gets extra breathing room on just those two sides.
export const QR_EXTRA_TOP_LEFT_PADDING_PX = 28;

export function getQRCodeVersion(data: string, errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H' = 'H'): number {
  return QRCode.create(data, { errorCorrectionLevel }).version;
}

// --- Adaptive error correction ---
// Versions above QR_FULL_SIZE_VERSION no longer grow the print size (see
// getQRPrintWidth), so a payload that pushes the version up at ECC=H is
// printed at the same physical size but with denser modules - harder to
// scan. Trading error-correction budget for version headroom keeps the
// module density (and therefore scanability) in check.
//
// H's version picks a default target tier (H/Q/M/L, ceilings 25/30/35/40).
// Below that, each level is only adopted over its immediate predecessor if
// it actually shrinks the version - so the running "champion" is carried
// forward tier by tier, only swapping to the weaker level when it truly
// beats what's been picked so far. This only computes as many versions as
// actually needed (2 calls if Q already fits, up to 4 if L is reached) -
// never an exhaustive scan of all four levels.
const ADAPTIVE_ECC_H_MAX_VERSION = 25;
const ADAPTIVE_ECC_Q_MAX_VERSION = 30;
const ADAPTIVE_ECC_M_MAX_VERSION = 35;
type QRErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
type QRErrorCorrectionChoice = { errorCorrectionLevel: QRErrorCorrectionLevel; version: number };

// Prefers the stronger (already-chosen) option when both encode to the same
// version - a weaker ECC only wins by actually shrinking the version.
function strongerIfSameVersion(stronger: QRErrorCorrectionChoice, weaker: QRErrorCorrectionChoice): QRErrorCorrectionChoice {
  return stronger.version === weaker.version ? stronger : weaker;
}

export function getAdaptiveQRErrorCorrection(data: string): QRErrorCorrectionChoice {
  const h: QRErrorCorrectionChoice = { errorCorrectionLevel: 'H', version: getQRCodeVersion(data, 'H') };
  if (h.version <= ADAPTIVE_ECC_H_MAX_VERSION) return h;

  const q: QRErrorCorrectionChoice = { errorCorrectionLevel: 'Q', version: getQRCodeVersion(data, 'Q') };
  const bestUpToQ = strongerIfSameVersion(h, q);
  if (q.version <= ADAPTIVE_ECC_Q_MAX_VERSION) return bestUpToQ;

  const m: QRErrorCorrectionChoice = { errorCorrectionLevel: 'M', version: getQRCodeVersion(data, 'M') };
  const bestUpToM = strongerIfSameVersion(bestUpToQ, m);
  if (m.version <= ADAPTIVE_ECC_M_MAX_VERSION) return bestUpToM;

  const l: QRErrorCorrectionChoice = { errorCorrectionLevel: 'L', version: getQRCodeVersion(data, 'L') };
  return strongerIfSameVersion(bestUpToM, l);
}

export function getQRPrintWidth(version: number): number {
  if (version >= QR_FULL_SIZE_VERSION) return QR_FULL_SIZE_PX;
  if (version <= QR_MIN_STEP_VERSION) return QR_SMALL_SIZE_PX;

  const steps = Math.ceil((QR_FULL_SIZE_VERSION - version) / QR_STEP_VERSIONS);
  return Math.round(QR_FULL_SIZE_PX - steps * QR_STEP_PX);
}

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
// actual table, so we format one ourselves and return it as a plain string.
function formatMetricsTable(title: string, rows: { Metric: string; Value: any; Explanation: string }[]) {
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

  return lines.join('\n');
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

  const decodeFailures: string[] = [];

  try {
    legacyDecoded = legacy ? decodeLegacyEncodedData(legacy) : '';
  } catch (error) {
    decodeFailures.push(`Failed to decode legacy encoding: ${error}`);
  }

  try {
    optimisedDecoded = optimised ? decodeOptimisedData(optimised) : '';
  } catch (error) {
    decodeFailures.push(`Failed to decode optimised encoding: ${error}`);
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

  const report = [...decodeFailures, formatMetricsTable('QR Code Encoding Comparison', [
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
  ])].join('\n');

  return {
    report,
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
