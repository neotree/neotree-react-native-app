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
  await Promise.all(
    Object.keys(data)
      .filter(k => k === 'entries')
      .map(async (k) => {
        const entriesArray = data[k];

        await Promise.all(
          Object.keys(entriesArray).map(async (key: any) => {
            const { values, type, prePopulate } = entriesArray[key];

            if (key !== 'repeatables' && type !== 'diagnosis' && Array.isArray(prePopulate) && prePopulate.length > 0) {
              const value = values?.value;
              if (value && Array.isArray(value) && value.length > 0 && value[0] != null) {
                const aliasObj = await getAliasFromKeyAndScriptId({ script: scriptid, name: key });
                const formattedKey = aliasObj?.alias ?? key;
                entries += `${formattedKey}|${value.join('^')}|${formatPrepopulate(prePopulate)}\n`;
              }
            } else if (key === 'repeatables') {
              const repeatableTypes = entriesArray[key];

              await Promise.all(
                Object.keys(repeatableTypes).map(async (repeatKey) => {
                  const repeatList = repeatableTypes[repeatKey];
                  if (Array.isArray(repeatList) && repeatList.length > 0) {
                    const firstItem = repeatList[0];
                    const fieldKeys = Object.keys(firstItem);

                    const aliasPromises = await Promise.all(
                      fieldKeys.map((fk) => getAliasFromKeyAndScriptId({ script: scriptid, name: fk }))
                    );
                    const aliasKeys = aliasPromises.map((res, i) => res?.alias ?? fieldKeys[i]);

                    entries += `RR|${repeatKey}|${aliasKeys.join('|')}|PP\n`;

                    repeatList.forEach((item) => {
                      const rowValues = fieldKeys.filter(f=>f!='requiredComplete').map((field) => {
                        const val = field === 'createdAt' ? formatDate(item[field]) : item[field];
                        if (val && typeof val === 'object' && 'value' in val) {
                          return Array.isArray(val.value) ? val.value.join('^') : val.value;
                        } else {
                          return Array.isArray(val) ? val.join('^') : val ?? '';
                        }
                      });

                      // Collect and format prePopulate for the row
                      let rowPrePopulates: string[] = [];
                      fieldKeys.forEach((field) => {
                        const val = item[field];
                        if (val && typeof val === 'object' && Array.isArray(val.prePopulate)) {
                          rowPrePopulates.push(...[formatPrepopulate(val.prePopulate)]);
                        }
                      });

                      const uniquePrePop = [...new Set(rowPrePopulates)];
                      const prePopStr = uniquePrePop.join('^');

                      entries += `|  |${rowValues.join('|')}|${prePopStr}\n`;
                    });
                  }
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

    const compressed = pako.deflate(data, { level: 9 });
    const base64String = uint8ArrayToBase64(compressed);
    return base64String
  } catch (error) {
    console.error('Compression error:', error);
    return null;
  }
};

function decompressDataFromQRCode(compressedData: Uint8Array): string {
  try {
    const decompressed = pako.inflate(compressedData, { to: 'string' });
    return decompressed;
  } catch (error) {
    console.error('Decompression error:', error);
    return '';
  }
};

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
  // Attempt the first decoding method
  try {
    const newUncompressed = decodeOptimisedData(data);
    if (newUncompressed) {
      return await convertToJSON(newUncompressed);
    }
  } catch (e) {
  }

  try {
    const backToBase64 = numbersToText(data);
    if (backToBase64) {
      try {
        const uint8Array = base64ToUint8Array(backToBase64);
        if (uint8Array) {
          try {
            const decompressed = decompressDataFromQRCode(uint8Array);
            if (decompressed) {
      
              return await convertToJSON(decompressed);
            }
          } catch (e) {
    
          }
        }
      } catch (e) {
    
      }
    }
  } catch (e) {

  }

  return [];
} catch (e: any) {
  return [];
}

}

export

  function textToNumbers(data: any) {
    const aft = data.split('').map((char: any) => char.charCodeAt(0)).join('');
  return aft
}

function numbersToText(data: string): string {
  let result = '';
  let currentNumber = '';
  // Iterate through each character of the numeric string
  for (let char of data) {
    currentNumber += char; // Add character to the current number string

    // Check if current number forms a valid char code
    const charCode = parseInt(currentNumber, 10);
    if (charCode >= 32 && charCode <= 126) { // ASCII printable range
      result += String.fromCharCode(charCode);
      currentNumber = ''; // Reset current number for next character
    }
  }

  return result;
}
const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64); // Decode Base64 to a binary string
  const length = binaryString.length;
  const uint8Array = new Uint8Array(length);

  for (let i = 0; i < length; i++) {
    uint8Array[i] = binaryString.charCodeAt(i); // Convert binary string to Uint8Array
  }

  return uint8Array;
};

function getScriptId(data: string): string | null {
  const line = data
    .split('\n')
    .find(line => line.startsWith('id|'));

  return line ? line.split('|')[1] || null : null;
}

function isJsonString(str:string) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

async function convertToJSON(input: string) {
  if(!input.includes('MDH') &&!input.includes('EDH') ){
    if(isJsonString(input)){
      return JSON.parse(input)
    } else{
      return {}
    }
   
  }
  const lines = input.trim().split("\n");
  const result: any = {};
  let currentSection: any = result;

  // Repeatables state
  let repeatables: Record<string, any[]> = {};
  let currentRepeatKey: string | null = null;
  let currentRepeatFields: string[] = [];

  const scriptId = getScriptId(input) || '';

  for (const line of lines) {
    const parts = line.trim().split("|");

    if (parts[0] === "MDH" || parts[0] === "EDH" || parts[0] === "DDH") {
      if (parts[0] === "EDH") {
        result.entries = {};
        currentSection = result.entries;
      }
      continue;
    }

    // RR Header
    if (parts[0] === "RR") {
      currentRepeatKey = parts[1];
      currentRepeatFields = parts.slice(2, -1);
      repeatables[currentRepeatKey] = [];
      continue;
    }

    // Repeatable Data Row
    if (currentRepeatKey && currentRepeatFields.length > 0 && line.startsWith("|")) {
      const rowParts = parts.slice(2); // skip empty repeatable and key col
      const prePopulateStr = rowParts.pop() || "";
      const prePopulate = reverseFormatPrepopulate(prePopulateStr);
      const values = rowParts;

      const repeatableItem: any = {};
      for (let i = 0; i < currentRepeatFields.length; i++) {
        const field = currentRepeatFields[i];
        const value = values[i] ?? "";

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
            value: value.includes("^") ? value.split("^") : formatReturnValue(value),
            prePopulate,
          };
        }
      }

      repeatables[currentRepeatKey].push(repeatableItem);
      continue;
    }

    // Regular EDH entry
    if (currentSection === result.entries) {
      const [key, value, prePopulate] = parts;
      const formatted = formatReturnValue(value).split("^");

      const aliasResult = await getAliasKeyFromAliasAndScript({
        script: scriptId,
        alias: key,
      });
      const formattedField = aliasResult?.name || key;

      currentSection[formattedField] = {
        values: {
          value: formatted,
          prePopulate: reverseFormatPrepopulate(prePopulate),
        },
      };
      continue;
    }

    // MDH top-level fields
    const [key, value] = parts;
    if (key === 'completed_at') {
      result[key] = parseStringToDate(value);
    } else {
      result[key] = value;
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

  delete transformed.entries;
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
  // Split the formatted string by '^' to get the array of aliases
  const aliases = formattedString.split('^');

  // Create a lookup map for quick access to values based on aliases
  const valueMap = new Map(searchTypes.map(({ value, alias }) => [alias, value]));

  // Map each alias to its corresponding value or keep the alias if no match is found
  const values = aliases.map(alias => {
    return valueMap.get(alias) || ''; // Use value or keep the alias as-is
  });

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
  // ===== 1. Reverse Run-Length Encoding (RLE) if present =====
  const base10Str = undoRLE(encodedStr);
  const bigInt = BigInt(base10Str);

  // ===== 3. Extract original bytes from BigInt =====
  const byteArray = [];
  let tempBigInt = bigInt;

  while (tempBigInt > BigInt(0)) {
    // Extract the last 8 bits (1 byte)
    const byte = Number(tempBigInt & BigInt(0xFF));
    byteArray.unshift(byte); // Insert at start to maintain order
    tempBigInt = tempBigInt >> BigInt(8); // Right-shift by 8 bits
  }

  // ===== 4. Decompress with pako.inflate =====
  const compressedData = new Uint8Array(byteArray);
  return pako.inflate(compressedData, { to: 'string' });
}

// Helper: Reverse RLE (e.g., "4:1,2:0" → "111100")
function undoRLE(str: string): string {
  // If no RLE patterns exist, return as-is
  if (!str.includes(':')) return str;

  let result = '';
  const segments = str.split(',');

  for (const segment of segments) {
    if (segment.includes(':')) {
      const [countStr, digit] = segment.split(':');
      const count = parseInt(countStr, 10);
      result += digit.repeat(count);
    } else {
      result += segment;
    }
  }

  return result;
}