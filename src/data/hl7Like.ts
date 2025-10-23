import pako from 'pako'
import Base64 from 'react-native-base64';
import {formatDate,parseStringToDate} from '../utils/formatDate'
import {getAliasKeyFromAliasAndScript,getAliasFromKeyAndScriptId } from '../data/queries';
import { parse, isValid, format } from 'date-fns';
import { APP_CONFIG } from '@/src/constants';
import * as types from '../types';
import { getLocation } from './queries';

export async function toHL7Like(data: any) {

   const location = await getLocation();
   const country =  location?.country||'';

   if(!data){
    return ''
   }

   if(country && country.length>0 ||  hasNeotreeIdOnly(data)){
    const config = (APP_CONFIG[country] as types.COUNTRY_CONFIG)['local'];
    const hospital = location?.hospital
    const localConfig = config?.filter(c=>c.hospital===hospital?.trim())
    if(localConfig && localConfig?.[0]?.hospital?.length>0){
  
     return textToNumbers(compressDataForQRCode(JSON.stringify({uid:data['uid']})))     
    }

   }

  let metadata = "MDH\n"
 
  let scritpid: any=''

  // METADATA
  Object.keys(data).forEach((k) => {
    if (k !== 'entries' && k !== 'diagnoses' && k !== 'scriptTitle') {
      if (k === 'script' && typeof data[k] === 'object') {
        Object.entries(data[k]).forEach(([ki, value]) => {
          if(ki==='id'){
           scritpid=value
          }
          metadata += `${ki}|${value}\n`;
        });
      } else if (k === 'uid') {
        metadata += `${k}|${data[k]}\n`;
      } else if (k === 'completed_at') {
        metadata += `${k}|${formatDate(data[k])}\n`;
      }
    }
  });
  let entries = 'EDH\n'
  const optimised = await processEntries(data,scritpid)
  let combined = `${metadata}${entries}${optimised}`
  let compressed = textToNumbers(compressDataForQRCode(combined))
  if(compressed && compressed.length > 2800){
    combined = truncateData(combined)
    compressed = textToNumbers(compressDataForQRCode(combined))
  }
 
  while (compressed && compressed.length > 2800) {
    combined = truncateData(combined)
    compressed = textToNumbers(compressDataForQRCode(combined))
  }
  return compressed;
}

async function processEntries(data:any, scriptid:string) {
  let entries = '';

  // Validate input
  if (!data || typeof data !== 'object') {
    return entries;
  }

  await Promise.all(
    Object.keys(data)
      .filter(k => k === 'entries')
      .map(async (k) => {
        const entriesArray = data[k];

        if (!entriesArray || typeof entriesArray !== 'object') {
          return;
        }

        await Promise.all(
          Object.keys(entriesArray).map(async (key: any) => {
            const entryData = entriesArray[key];

            // Validate entry data
            if (!entryData || typeof entryData !== 'object') {
              return;
            }

            const { values, type, prePopulate } = entryData;

            if (key !== 'repeatables' && type !== 'diagnosis' && Array.isArray(prePopulate) && prePopulate.length > 0) {
              const value = values?.value;
              if (value && Array.isArray(value) && value.length > 0 && value[0] != null) {
                const aliasObj = await getAliasFromKeyAndScriptId({ script: scriptid, name: key });
                const formattedKey = aliasObj?.alias ?? key;

                // Sanitize values to remove/replace newlines
                const sanitizedValues = value.map(v =>
                  typeof v === 'string' ? v.replace(/[\r\n]+/g, ' ').trim() : v
                );

                entries += `${formattedKey}|${sanitizedValues.join('^')}|${formatPrepopulate(prePopulate)}\n`;
              }
            } else if (key === 'repeatables') {
              const repeatableTypes = entriesArray[key];

              if (!repeatableTypes || typeof repeatableTypes !== 'object') {
                return;
              }

              await Promise.all(
                Object.keys(repeatableTypes).map(async (repeatKey) => {
                  const repeatList = repeatableTypes[repeatKey];
                  if (!Array.isArray(repeatList) || repeatList.length === 0) {
                    return;
                  }

                  const firstItem = repeatList[0];
                  if (!firstItem || typeof firstItem !== 'object') {
                    return;
                  }

                  const fieldKeys = Object.keys(firstItem);

                  const aliasPromises = await Promise.all(
                    fieldKeys.map((fk) => getAliasFromKeyAndScriptId({ script: scriptid, name: fk }))
                  );
                  const aliasKeys = aliasPromises.map((res, i) => res?.alias ?? fieldKeys[i]);

                  entries += `RR|${repeatKey}|${aliasKeys.join('|')}|PP\n`;

                  repeatList.forEach((item) => {
                    if (!item || typeof item !== 'object') {
                      return;
                    }

                    const rowValues = fieldKeys.filter(f=>f!='requiredComplete').map((field) => {
                      const val = field === 'createdAt' ? formatDate(item[field]) : item[field];

                      let processedVal: string;
                      if (val && typeof val === 'object' && 'value' in val) {
                        processedVal = Array.isArray(val.value) ? val.value.join('^') : String(val.value ?? '');
                      } else {
                        processedVal = Array.isArray(val) ? val.join('^') : String(val ?? '');
                      }

                      // Sanitize to remove/replace newlines and trim
                      return processedVal.replace(/[\r\n]+/g, ' ').trim();
                    });

                    // Collect and format prePopulate for the row
                    let rowPrePopulates: string[] = [];
                    fieldKeys.forEach((field) => {
                      const val = item[field];
                      if (val && typeof val === 'object' && Array.isArray(val.prePopulate)) {
                        rowPrePopulates.push(...[formatPrepopulate(val.prePopulate)]);
                      }
                    });

                    const uniquePrePop = [...new Set(rowPrePopulates)].filter(p => p && p.length > 0);
                    const prePopStr = uniquePrePop.join('^');

                    entries += `|  |${rowValues.join('|')}|${prePopStr}\n`;
                  });
                })
              );
            }
          })
        );
      })
  );

  return entries;
}
function hasNeotreeIdOnly(data: any): boolean {
  if (!data || typeof data !== 'object') return false;

  const entries = data['entries'];
  if (!entries || typeof entries !== 'object') return false;

  // Find all keys with a non-empty prePopulate array
  const keysWithPrePopulate = Object.keys(entries).filter(key => {
    const entry = entries[key];
    return Array.isArray(entry?.prePopulate) && entry.prePopulate.length > 0;
  });
  if (keysWithPrePopulate.length === 1) {
    const onlyKey = keysWithPrePopulate[0];
    return onlyKey.toLowerCase().includes('uid');
  }

  return false;
}


function truncateData(data: any): string {
  const lines = data.split('\n');

  const excludedPrefixes = ['RR', '|', 'MDH', 'EDH'];

  while (lines.length > 0) {
    const lastLine = lines[lines.length - 1].trim();
    const shouldRemove = excludedPrefixes.some(prefix => lastLine.startsWith(prefix));
    
    if (shouldRemove) {
      lines.pop();
    } else {
      break;
    }
  }

  return lines.join('\n');
}

function compressDataForQRCode(data: any) {
  try {
    // Validate input
    if (!data) {
      console.error('Compression error: data is empty');
      return null;
    }

    const compressed = pako.deflate(data, { level: 9 });

    if (!compressed || compressed.length === 0) {
      console.error('Compression error: result is empty');
      return null;
    }

    const base64String = uint8ArrayToBase64(compressed);
    return base64String;
  } catch (error) {
    console.error('Compression error:', error);
    return null;
  }
}

function decompressDataFromQRCode(compressedData: Uint8Array): string {
  try {
    // Validate input
    if (!compressedData || compressedData.length === 0) {
      console.error('Decompression error: input is empty');
      return '';
    }

    const decompressed = pako.inflate(compressedData, { to: 'string' });

    if (typeof decompressed !== 'string') {
      console.error('Decompression error: result is not a string');
      return '';
    }

    return decompressed;
  } catch (error) {
    console.error('Decompression error:', error);
    return '';
  }
}

const uint8ArrayToBase64 = (uint8Array: any) => {
  let binary = '';
  const length = uint8Array.length;
  for (let i = 0; i < length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return Base64.encodeFromByteArray(uint8Array);
}


export async function fromHL7Like(data: string) {
  try {
    // Validate input
    if (!data || typeof data !== 'string' || data.trim().length === 0) {
      console.log("Invalid input: data is empty or not a string");
      return [];
    }

    // Attempt the first decoding method (optimized format)
    try {
      const newUncompressed = decodeOptimisedData(data);
      if (newUncompressed && newUncompressed.length > 0) {
        return await convertToJSON(newUncompressed);
      }
    } catch (e) {
      console.log("Optimized decode failed:", e);
      // Continue to next method
    }

    // Attempt the second decoding method (base64/compressed format)
    try {
      const backToBase64 = numbersToText(data);
      if (backToBase64 && backToBase64.length > 0) {
        const uint8Array = base64ToUint8Array(backToBase64);
        if (uint8Array && uint8Array.length > 0) {
          try {
            const decompressed = decompressDataFromQRCode(uint8Array);
            if (decompressed && decompressed.length > 0) {
              return await convertToJSON(decompressed);
            }
          } catch (e) {
            console.log("Decompression failed:", e);
          }
        } else {
          console.log("Base64 to Uint8Array conversion returned null or empty");
        }
      }
    } catch (e) {
      console.log("Numbers to text conversion failed:", e);
    }

    return [];
  } catch (e: any) {
    console.log("Unexpected error in fromHL7Like:", e);
    return [];
  }
}

export function textToNumbers(data: any) {
    const aft = data.split('').map((char: any) => char.charCodeAt(0)).join('');
  return aft
}

function numbersToText(data: string): string {
  // Validate input
  if (!data || typeof data !== 'string') {
    return '';
  }

  let result = '';
  let currentNumber = '';

  // Iterate through each character of the numeric string
  for (let i = 0; i < data.length; i++) {
    const char = data[i];

    // Skip non-numeric characters
    if (char < '0' || char > '9') {
      continue;
    }

    currentNumber += char;

    // Check if current number forms a valid char code
    const charCode = parseInt(currentNumber, 10);

    // ASCII printable range (32-126)
    if (charCode >= 32 && charCode <= 126) {
      result += String.fromCharCode(charCode);
      currentNumber = '';
    }

    // If number gets too large (>126), reset to try again from this digit
    if (charCode > 126) {
      currentNumber = char;
    }
  }

  return result;
}
const base64ToUint8Array = (base64: string): Uint8Array | null => {
  try {
    // Validate input
    if (!base64 || typeof base64 !== 'string') {
      console.error('Invalid base64 input');
      return null;
    }

    const binaryString = atob(base64); // Decode Base64 to a binary string
    const length = binaryString.length;

    if (length === 0) {
      console.error('Decoded base64 is empty');
      return null;
    }

    const uint8Array = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i); // Convert binary string to Uint8Array
    }

    return uint8Array;
  } catch (error) {
    console.error('Base64 decode error:', error);
    return null;
  }
};

function getScriptId(data: string): string | null {
  if (!data || typeof data !== 'string') {
    return null;
  }

  const line = data
    .split('\n')
    .map(l => l.trim())
    .find(line => line.startsWith('id|'));

  if (!line) {
    return null;
  }

  const parts = line.split('|');
  return parts.length > 1 && parts[1] ? parts[1].trim() : null;
}

function isJsonString(str:string) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Normalizes HL7-like input by merging lines that were broken due to embedded newlines
 * in data fields, especially within repeatable data rows.
 */
function normalizeHL7Input(input: string): string {
  const lines = input.split("\n");
  const normalizedLines: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const currentLine = lines[i];
    const trimmedLine = currentLine.trim();

    // Check if this is a line that should stand alone
    const isHeaderLine = /^(MDH|EDH|DDH|RR)/.test(trimmedLine);
    const isRegularEntry = /^[A-Za-z0-9_]+\|/.test(trimmedLine) && !trimmedLine.startsWith('|');
    const isRepeatableDataStart = /^\|\s+\|/.test(trimmedLine);

    if (isHeaderLine || isRegularEntry) {
      // These lines should stand alone
      normalizedLines.push(currentLine);
      i++;
      continue;
    }

    if (isRepeatableDataStart) {
      // This is a repeatable data row that might be broken across multiple lines
      // We need to keep collecting lines until we find a complete row
      let mergedLine = currentLine;
      let j = i + 1;

      // Count expected pipe separators based on the last RR header
      // Find the last RR header to know how many fields to expect
      let expectedFieldCount = -1;
      for (let k = normalizedLines.length - 1; k >= 0; k--) {
        if (normalizedLines[k].trim().startsWith('RR|')) {
          // Count fields in RR header: RR|name|field1|field2|...|PP
          // The data row should have: |  |value1|value2|...|prepopulate
          const headerParts = normalizedLines[k].trim().split('|');
          expectedFieldCount = headerParts.length - 2; // Subtract RR and PP
          break;
        }
      }

      // Keep merging lines until we have enough pipe separators
      while (j < lines.length) {
        const nextLine = lines[j].trim();

        // Check if next line is a new valid HL7 line
        const isNewValidLine = /^(MDH|EDH|DDH|RR|\|\s+\||[A-Za-z0-9_]+\|)/.test(nextLine);

        if (isNewValidLine) {
          break;
        }

        // Check if we have enough fields
        const currentPipeCount = (mergedLine.match(/\|/g) || []).length;
        if (expectedFieldCount > 0 && currentPipeCount >= expectedFieldCount) {
          break;
        }

        // Merge the broken line, replacing newline with space
        mergedLine += ' ' + nextLine;
        j++;
      }

      normalizedLines.push(mergedLine);
      i = j;
      continue;
    }

    // For any other line, just add it
    normalizedLines.push(currentLine);
    i++;
  }

  return normalizedLines.join("\n");
}

async function convertToJSON(input: string) {
  if(!input.includes('MDH') &&!input.includes('EDH') ){
    if(isJsonString(input)){
      return JSON.parse(input)
    } else{
      return {}
    }

  }

  // Normalize input to handle embedded newlines and unexpected characters
  const normalizedInput = normalizeHL7Input(input);
  console.log("---TRES:::",normalizedInput)

  const lines = normalizedInput.trim().split("\n");
  const result: any = {};
  let currentSection: any = result;

  // Repeatables state
  let repeatables: Record<string, any[]> = {};
  let currentRepeatKey: string | null = null;
  let currentRepeatFields: string[] = [];

  const scriptId = getScriptId(normalizedInput) || '';

  for (const line of lines) {
    // Trim the line and skip empty lines
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const parts = trimmedLine.split("|");

    if (parts[0] === "MDH" || parts[0] === "EDH" || parts[0] === "DDH") {
      if (parts[0] === "EDH") {
        result.entries = {};
        currentSection = result.entries;
      }
      continue;
    }

    // RR Header
    if (parts[0] === "RR") {
      currentRepeatKey = parts[1]?.trim() || parts[1];
      currentRepeatFields = parts.slice(2, -1).map(f => f.trim());
      repeatables[currentRepeatKey] = [];
      continue;
    }

    // Repeatable Data Row
    if (currentRepeatKey && currentRepeatFields.length > 0 && trimmedLine.startsWith("|")) {
      const rowParts = parts.slice(2); // skip empty repeatable and key col
      const prePopulateStr = rowParts.pop() || "";
      const prePopulate = reverseFormatPrepopulate(prePopulateStr);
      const values = rowParts;

      const repeatableItem: any = {};
      for (let i = 0; i < currentRepeatFields.length; i++) {
        const field = currentRepeatFields[i];
        const value = (values[i] ?? "").trim();

        if (field === "id") {
          repeatableItem[field] = value;

        } else if (field === "createdAt") {
          repeatableItem[field] = parseStringToDate(value);

        } else if (field === "requiredComplete") {
          // do nothing

        } else {
          const aliasResult = await getAliasKeyFromAliasAndScript({
            script: scriptId,
            alias: field,
          });
          const formattedField = aliasResult?.name || field;


          repeatableItem[formattedField] = {
            value: value.includes("^") ? value.split("^").map(v => v.trim()) : formatReturnValue(value),
            prePopulate,
          };
        }
      }

      repeatables[currentRepeatKey].push(repeatableItem);
      continue;
    }

    // Regular EDH entry
    if (currentSection === result.entries) {
      if (parts.length < 2) continue; // Skip malformed entries

      const [key, value, prePopulate] = parts;
      const trimmedKey = key?.trim();
      const trimmedValue = value?.trim() || "";

      if (!trimmedKey) continue; // Skip if no key

      const formatted = formatReturnValue(trimmedValue).split("^").map(v => v.trim());
      const aliasResult = await getAliasKeyFromAliasAndScript({
        script: scriptId,
        alias: trimmedKey,
      });


      const formattedField = aliasResult?.name || trimmedKey;

      currentSection[formattedField] = {
        values: {
          value: formatted,
          prePopulate: reverseFormatPrepopulate(prePopulate || ""),
        },
      };

      continue;
    }

    // MDH top-level fields
    if (parts.length < 2) continue; // Skip malformed entries

    const [key, value] = parts;
    const trimmedKey = key?.trim();
    const trimmedValue = value?.trim();

    if (!trimmedKey) continue;

    if (trimmedKey === 'completed_at') {
      result[trimmedKey] = parseStringToDate(trimmedValue);
    } else {
      result[trimmedKey] = trimmedValue;
    }
  }

  // Attach repeatables to entries
  if (!result.entries) result.entries = {};
  result.entries.repeatables = repeatables;

  // Final transformed output
  const transformed = {
    ...result,
    data: result,
  };

  delete transformed.repeatables;
  delete transformed.diagnoses;

  return transformed;
}
function formatReturnValue(value: any): string {
 if (typeof value !== 'string') return value;

  // Try parsing with time
  let parsed = parse(value, 'd MMM, yyyy HH:mm', new Date());
  if (isValid(parsed)) {
    // Format using local time (not UTC)
    return format(parsed, "yyyy-MM-dd'T'HH:mm:ss.SSS");
  }

  // Try parsing with just the date
  parsed = parse(value, 'd MMM, yyyy', new Date());
  if (isValid(parsed)) {
    return format(parsed, 'yyyy-MM-dd');
  }

  return value; // Not a valid date string
}

function reverseFormatPrepopulate(formattedString: string): string[] {
  // Handle null, undefined, or empty strings
  if (!formattedString || typeof formattedString !== 'string') {
    return [];
  }

  // Trim the string and handle empty results
  const trimmed = formattedString.trim();
  if (!trimmed) {
    return [];
  }

  // Split the formatted string by '^' to get the array of aliases
  const aliases = trimmed.split('^').map(a => a.trim()).filter(a => a.length > 0);

  // Create a lookup map for quick access to values based on aliases
  const valueMap = new Map(searchTypes.map(({ value, alias }) => [alias, value]));

  // Map each alias to its corresponding value or keep the alias if no match is found
  const values = aliases.map(alias => {
    return valueMap.get(alias) || ''; // Use value or keep the alias as-is
  }).filter(v => v.length > 0); // Remove empty values

  return values;
}

function formatPrepopulate(prePopulate: any): string {
  // Ensure the input is an array
  if (!Array.isArray(prePopulate)) {
    return ''
  }
  // Create a lookup map for quick access to aliases
  const aliasMap = new Map(searchTypes.map(({ value, alias }) => [value, alias]));

  // Map each item to its corresponding alias or default to the first 2 characters
  const formattedArray = prePopulate.map(item => {
    const str = String(item); // Convert to string
    return aliasMap.get(str) || ''
  });

  // Join the array with '^' separator
  return formattedArray.join('^');
}

export const searchTypes = [
  { value: 'admissionSearches', alias: 'AS', },
  { value: 'twinSearches', alias: 'TS', },
  { value: 'allSearches', alias: 'OS', },
];


function decodeOptimisedData(encodedStr: string): string {
  try {

    if (!encodedStr || typeof encodedStr !== 'string' || encodedStr.trim().length === 0) {
      throw new Error('Invalid input: encoded string is empty');
    }
    const base10Str = undoRLE(encodedStr);

    if (!base10Str || base10Str.length === 0) {
      throw new Error('RLE decode resulted in empty string');
    }

    const bigInt = BigInt(base10Str);
    const byteArray = [];
    let tempBigInt = bigInt;

    while (tempBigInt > BigInt(0)) {
      // Extract the last 8 bits (1 byte)
      const byte = Number(tempBigInt & BigInt(0xFF));
      byteArray.unshift(byte); // Insert at start to maintain order
      tempBigInt = tempBigInt >> BigInt(8); // Right-shift by 8 bits
    }

    if (byteArray.length === 0) {
      throw new Error('Byte extraction resulted in empty array');
    }

    // ===== 3. Decompress with pako.inflate =====
    const compressedData = new Uint8Array(byteArray);
    const decompressed = pako.inflate(compressedData, { to: 'string' });

    if (!decompressed || typeof decompressed !== 'string') {
      throw new Error('Decompression failed or returned invalid data');
    }

    return decompressed;
  } catch (error) {
    console.log('Error in decodeOptimisedData:', error);
    throw error; // Re-throw to be caught by calling function
  }
}

// Helper: Reverse RLE (e.g., "4:1,2:0" → "111100")
function undoRLE(str: string): string {
  try {
    // Validate input
    if (!str || typeof str !== 'string') {
      return '';
    }

    // If no RLE patterns exist, return as-is
    if (!str.includes(':')) {
      return str;
    }

    let result = '';
    const segments = str.split(',');

    for (const segment of segments) {
      if (!segment) continue; // Skip empty segments

      if (segment.includes(':')) {
        const parts = segment.split(':');
        if (parts.length !== 2) {
          console.warn(`Invalid RLE segment: ${segment}`);
          continue;
        }

        const [countStr, digit] = parts;
        const count = parseInt(countStr, 10);

        if (isNaN(count) || count < 0) {
          console.warn(`Invalid count in RLE segment: ${countStr}`);
          continue;
        }

        if (!digit) {
          console.warn(`Invalid digit in RLE segment: ${segment}`);
          continue;
        }

        result += digit.repeat(count);
      } else {
        result += segment;
      }
    }

    return result;
  } catch (error) {
    console.error('Error in undoRLE:', error);
    return '';
  }
}