import pako from 'pako'
import Base64 from 'react-native-base64';

export function toHL7Like(data: any) {

    let metadata="MDH\n"
    let entries ='EDH\n'
    let diagnoses= 'DDH\n'

    // METADATA
    Object.keys(data).filter(k => (k != 'entries' && k != 'diagnoses'&&k!='scriptTitle')).map((k) => {
  
    
        if(k==='script'){
          Object.keys(data[k]).filter(ki=>ki!=='id').map((ki)=>{
            metadata+=`${ki}|${data[k][ki]}\n`
          })
        }else{
          if(k==='uid'){
            metadata+=`${k}|${data[k]}\n`
          }
        }
    })
    Object.keys(data).filter(k => (k === 'diagnoses')).map((k) => {
   const diags = data[k]
   if(Array.isArray(diags) && diags.length>0){
    diags.map(d=>{
      Object.keys(d).map(key=>{
        const {Priority,Suggested,hcw_agree,hcw_follow_instructions,hcw_reason_given}=d[key]
        const values = [
          key,
          Priority !== null ? Priority : '',
          Suggested !== null ? Suggested : '',
          hcw_agree !== null ? hcw_agree : '',
          hcw_follow_instructions !== null ? hcw_follow_instructions : '',
          hcw_reason_given !== null ? hcw_reason_given : ''
      ]

     diagnoses+=`${values.join('|')}\n`
      })
    })
   }

    
  })

    
    // ENTRIES
    Object.keys(data).filter(k => (k === 'entries')).map((k) => {
       
    const entriesArray = data[k]

    Object.keys(entriesArray).map((key: any) => {
  
            const {values,type} = entriesArray[key]
            if(type!=='diagnosis'){
            const value = values?.value
             if(value &&Array.isArray(value)&& value.length>0 && value[0]!=null){
              entries+= `${key}|${value.join('^')}\n`
             }
            }
        })
    })
   
   const combined = `${metadata}${entries}${diagnoses}`
    return textToNumbers(compressDataForQRCode(combined))
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
  const backToBase64 = numbersToText(data)
  if(backToBase64){
    const uint8Array = base64ToUint8Array(backToBase64)
    if(uint8Array){
     const decompressed= decompressDataFromQRCode(uint8Array)
     if(decompressed){
      return convertToJSON(decompressed)
     }
    }
    return []
  }
  return []
}

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

function convertToJSON(input:string) {
  const lines = input.trim().split("\n");
  const result:any = {};
  let currentSection:any = result; // Pointer for the current section being processed
  let ddhHeader:any = []; // Header for DDH section
  
  lines.forEach((line) => {
      const parts = line.split("|");

      if (parts[0] === "MDH" || parts[0] === "EDH" || parts[0] === "DDH") {
          if (parts[0] === "EDH") {
              result.entries = {};
              currentSection = result.entries;
          } else if (parts[0] === "DDH") {
              result.diagnoses = [];
              ddhHeader = String('Priority,Suggested,hcw_agree,hcw_follow_instructions,hcw_reason_given').split(',')
              currentSection = result.diagnoses;
          }
          return; // Skip the header line
      }

      if (currentSection === result.entries) {
          // Inside EDH section
          const [key, value] = parts;
          currentSection[key] = {
              values: {
                  value: value.split("^") // Split on "^" for multiple values
              }
          };
      } else if (currentSection === result.diagnoses) {
          // Inside DDH section
          const [entryKey, ...values] = parts;
          const ddhObject:any = {};
         
          ddhHeader.forEach((header:string, index:number) => {
              const value:any = values[index];
              ddhObject[header] = !value? null : toDataType(value);
          });
          const formattedEntry = { [entryKey]: ddhObject };
          currentSection.push(formattedEntry);
      } else {
          // General keys in MDH
          const [key, value] = parts;
          result[key] = value;
      }
  });
  const transformed = {
    ...result, 
    data: result 
  };
  if(transformed.entries){
    delete transformed.entries
  }
  if(transformed.diagnoses){
    delete transformed.diagnoses
  }

  return transformed;
}
function toDataType(value:any) {

  if (!isNaN(value) && value !== null && value !== "") {
    return Number(value);
  }
  else if (value === "true" || value === "false") {
    return value === "true";
  }
 else{
  return value
 }
}