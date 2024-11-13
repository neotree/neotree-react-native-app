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
        segments['metadata'] = metadata
    })

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

    // SET QR LIMIT
    if (entries && entries.length <= 1200) {
        // IF WITHIN LIMIT, WRITE ALL
       segments['entries']= entries

    } else {
        const lines = entries.split('\n'); // Split the string into lines
        const splits = [];
        let currentSegment = '';

        for (const line of lines) {
            // Check if adding this line would exceed the maxLength
            if (currentSegment.length + line.length > 1200) {
                splits.push(currentSegment);
                //ADD HEADER (FIRST SEGMENT ADDED; NOW ON SUBSEQUENT SEGMENTS)
                currentSegment= 'EMH|type|value|label|prePopulate|\n'
                currentSegment+= line+'\n';

               
            } else {
          
                    currentSegment+= line+'\n';
                
            }
        }

        // Push the last segment if it exists
        if (currentSegment.split('\n').length>0) {
            splits.push(currentSegment);
        }
        if(splits && splits.length>0){
            splits.map((s,i)=>{
                segments[`entries_${i}`]=s
            })
        }

    }
       
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
        segments['diagnoses'] = diagnoses
    }
    )

    return segments
}

export function fromHL7Like(data: string) {

}
