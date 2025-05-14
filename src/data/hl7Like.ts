import pako from 'pako'
import Base64 from 'react-native-base64';
import {formatDate,parseStringToDate} from '../utils/formatDate'

export function toHL7Like(data: any) {

  let metadata = "MDH\n"
  let entries = 'EDH\n'
  let diagnoses = 'DDH\n'

  // METADATA
  Object.keys(data).forEach((k) => {
    if (k !== 'entries' && k !== 'diagnoses' && k !== 'scriptTitle') {
      if (k === 'script' && typeof data[k] === 'object') {
        Object.entries(data[k]).forEach(([ki, value]) => {
          if(ki==='id'){
            //skip
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

  // DIAGNOSES
  Object.keys(data).filter(k => (k === 'diagnoses')).map((k) => {

    const diags = data[k]
    if (Array.isArray(diags) && diags.length > 0) {
      diags.map(d => {
        Object.keys(d).map((key) => {

          const { Priority, Suggested, hcw_agree, hcw_follow_instructions, hcw_reason_given } = d[key]
          const values = [
            key,
            Priority !== null ? Priority : '',
            Suggested !== null ? Suggested : '',
            hcw_agree !== null ? hcw_agree : '',
            hcw_follow_instructions !== null ? hcw_follow_instructions : '',
            hcw_reason_given !== null ? hcw_reason_given : ''
          ]

          diagnoses += `${values.join('|')}\n`
        })
      })
    }


  })

  // ENTRIES
  Object.keys(data).filter(k => (k === 'entries')).map((k) => {

    const entriesArray = data[k]

    Object.keys(entriesArray).map((key: any) => {
      const { values, type, prePopulate } = entriesArray[key]
      if (key !== 'repeatables' && type !== 'diagnosis' && Array.isArray(prePopulate) && prePopulate.length > 0) {
        const value = values?.value
        if (value && Array.isArray(value) && value.length > 0 && value[0] != null) {
          entries += `${key}|${value.join('^')}|${formatPrepopulate(prePopulate)}\n`
        }
      }
      else if (key === 'repeatables') {
        // Handle repeatables
        if (key === 'repeatables') {
          const repeatableTypes = entriesArray[key];

          Object.keys(repeatableTypes).forEach((repeatKey) => {
            const repeatList = repeatableTypes[repeatKey];
            if (Array.isArray(repeatList) && repeatList.length > 0) {
              const firstItem = repeatList[0];
              const fieldKeys = Object.keys(firstItem);

              // RR header with PP
              entries += `RR|${repeatKey}|${fieldKeys.join('|')}|PP\n`;

              repeatList.forEach((item) => {
                const rowValues = fieldKeys.map((field) => {
        
                  const val = field==='createdAt'?formatDate(item[field]):item[field];
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

                // Prepend empty values to match "RR|" structure (2 empty columns)
                entries += `|  |${rowValues.join('|')}|${prePopStr}\n`;
              });
            }
          });
        }


      }
    })
  })

  let combined = `${metadata}${entries}`
  let compressed = textToNumbers(compressDataForQRCode(combined))

  while (compressed && compressed.length > 2800) {
    combined = truncateData(combined)
    compressed = textToNumbers(compressDataForQRCode(combined))
  }

  return compressed;
}

function truncateData(data: any) {

  let lines = data.split('\n');

  if (lines.length > 0) {
    // Remove the last line
    lines.pop();
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


export function fromHL7Like(data: string) {
try {
  // Attempt the first decoding method
  try {
    const newUncompressed = decodeOptimisedData(data);
    if (newUncompressed) {
      return convertToJSON(newUncompressed);
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
              return convertToJSON(decompressed);
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
  return data.split('').map((char: any) => char.charCodeAt(0)).join('');
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

function convertToJSON(input: string) {
  const lines = input.trim().split("\n");
  const result: any = {};
  let currentSection: any = result;
  let ddhHeader: string[] = [];

  // Repeatables state
  let repeatables: Record<string, any[]> = {};
  let currentRepeatKey: string | null = null;
  let currentRepeatFields: string[] = [];

  const toDataType = (val: string) => {
    if (val === "true") return true;
    if (val === "false") return false;
    if (!isNaN(Number(val))) return Number(val);
    return val;
  };

  lines.forEach((line) => {
    const parts = line.trim().split("|");

    if (parts[0] === "MDH" || parts[0] === "EDH" || parts[0] === "DDH") {
      if (parts[0] === "EDH") {
        result.entries = {};
        currentSection = result.entries;
      } else if (parts[0] === "DDH") {
        result.diagnoses = [];
        ddhHeader = "Priority,Suggested,hcw_agree,hcw_follow_instructions,hcw_reason_given".split(",");
        currentSection = result.diagnoses;
      }
      return;
    }

    // RR Header
    if (parts[0] === "RR") {
      currentRepeatKey = parts[1];
      currentRepeatFields = parts.slice(2, -1);
      repeatables[currentRepeatKey] = [];
      return;
    }

    // Repeatable Data Row
    if (currentRepeatKey && currentRepeatFields.length > 0 && line.startsWith("|")) {
      const rowParts = parts.slice(2); // skip empty repeatable and key col
      const prePopulateStr = rowParts.pop() || "";
      const prePopulate = reverseFormatPrepopulate(prePopulateStr);
      const values = rowParts;

      const repeatableItem: any = {};
      currentRepeatFields.forEach((field, i) => {
        const value = values[i] ?? "";

        if (field === "id" ) {
          repeatableItem[field] = value;
         
        } else if(field==="createdAt"){
         repeatableItem[field] = parseStringToDate(value)
        }else if(field==="requiredComplete"){
          // do nothing
        }
        
        else {
          repeatableItem[field] = {
            value: value.includes("^") ? value.split("^") : value,
            prePopulate,
          };
        }
      });

      repeatables[currentRepeatKey].push(repeatableItem);
      return;
    }

    // Regular EDH entry
    if (currentSection === result.entries) {
      const [key, value, prePopulate] = parts;
      let formatted =  value.split("^")
      currentSection[key] = {
        values: {
          value: formatted,
          prePopulate: reverseFormatPrepopulate(prePopulate),
        },
    }
    }

    // DDH diagnoses section
    else if (currentSection === result.diagnoses) {
      const [entryKey, ...values] = parts;
      const ddhObject: any = {};
      ddhHeader.forEach((header: string, index: number) => {
        const value: any = values[index];
        ddhObject[header] = !value ? null : toDataType(value);
      });
      const formattedEntry = { [entryKey]: ddhObject };
      currentSection.push(formattedEntry);
    }

    // MDH top-level fields
    else {
      const [key, value] = parts;
      if(key==='completed_at'){
        result[key] = parseStringToDate(value);
      }else{
      result[key] = value;
      }
    }
  });

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