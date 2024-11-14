export function toHL7Like(data: any) {

    let segments: any = {}
    let metadata = ''
    let diagnoses = ''
    let entries=''

    // METADATA
    Object.keys(data).filter(k => (k != 'entries' && k != 'diagnoses' && k != 'script')).map((k) => {
        metadata += `${k}|${data[k]}|\n`
    })
    // SCRIPT
    Object.keys(data).filter(k => (k === 'script')).map((k) => {
        // SCRIPT MESSAGE HEADER (SMH)
        const script = data[k]
        let scritpHeader = 'SMH|'
        let scriptData = ''
        Object.keys(script).map((key) => {
            scritpHeader += `${key}|`
            scriptData += `${key}|${script[key]}|`
        })
        metadata += `${scritpHeader}\n${scriptData}\n`
        
    })
    const splittedMetadata = splitString(metadata,100,'metadata')

    // ENTRIES
    Object.keys(data).filter(k => (k === 'entries')).map((k) => {
       
    const entriesArray = data[k]

    entries = 'EMH|type|value|label|prePopulate|\n'
    Object.keys(entriesArray).map((key: any) => {
  
            const { type, values, prePopulate: pp } = entriesArray[key]

            const value = values?.value.join("^")
            const label = values?.label.join("^");

            if(value){
                const prePopulate = pp?.join("^");
                entries+= `${key}|${type}|${value}|${label}|[${prePopulate}]|\n`;
            }
            
        })
    })
  const splittedEntries = splitString(entries,100,'entries')
       
    // DIAGNOSES
    Object.keys(data).filter(k => (k === 'diagnoses')).map((k) => {
        const diagnosesArray = data[k]
        if (diagnosesArray) {
            const diagnosesHeader = 'DGS|Priority|Suggested|hcw_agree|hcw_reason_given|hcw_follow_instructions|\n';
            const formattedDiagnoses = diagnosesArray.map((d: any) => {
                const { Priority, Suggested, hcw_agree, hcw_reason_given, hcw_follow_instructions } = d[Object.keys(d)[0]];
                return `${Object.keys(d)[0]}|${Priority}|${Suggested}|${hcw_agree || "null"}|${hcw_reason_given || "null"}|${hcw_follow_instructions || "null"}|`;
            }).join("\n");
            diagnoses += `${diagnosesHeader}${formattedDiagnoses}`
        }
    })
    const splittedDiagnoses = splitString(diagnoses,100,'diagnoses')
    
    segments = {...splittedMetadata,...splittedEntries,...splittedDiagnoses}
    
    return segments
}

function splitString(data: string, chunksize: number, key: string) {
    let segments: any = {};  // Object to store the segmented data

    // If the data length is less than or equal to the chunk size, return it as is
    if (data.length <= chunksize) {
        segments[key] = data;
    } else {
        const lines = data.split('\n'); 
        let segment = '';  
        let segmentIndex = 0;  

        for (const line of lines) {
            if (segment.length + line.length + 1 > chunksize) {  
                segments[`${key}_${segmentIndex}`] = segment;
                segmentIndex++; 
                segment = ''; 
            }
            segment += line + '\n';
        }

        // If there's any remaining data in the segment, add it to the segments object
        if (segment.length > 0) {
            segments[`${key}_${segmentIndex}`] = segment;
        }
    }

    return segments;
}

export function fromHL7Like(data: string) {

}
