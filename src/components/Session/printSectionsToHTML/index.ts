import QRCode from 'qrcode';
import { ScreenEntryValue } from '@/src/types';
import { formatValueWithUnit } from '@/src/utils/units';
import { getBaseHTML } from "./baseHTML";
import { toHL7Like } from '../../../data/hl7Like'
import { formatExportableSession } from '../../../data/getConvertedSession'

interface PrintSection {
  title: string;
  entries: any[];
}

interface ScreenEntry {
  values: any[];
  screen: any;
  repeatables?: Record<string, any[]>;
}

interface ManagementSection {
  title?: string;
  image?: string;
  text?: string;
}

export async function printSectionsToHTML({
  session,
  showConfidential
}: {
  session: any;
  showConfidential?: boolean;
}): Promise<string> {
  const { form, script } = { ...session?.data };

  let qrSmall = false

  const generateQRCode = async (): Promise<string | null> => {
    try {
      const formattedData = await formatExportableSession(session, { showConfidential: true });
      const hl7: string = await toHL7Like(formattedData);
      
      if(hl7.length < 100) {
        qrSmall = true
      }
      
      // QR code parameters
      const dataToEncode: string = hl7
      let erc: 'L' | 'M' | 'Q' | 'H' = 'H'
      
      if (dataToEncode.length > 3057 && dataToEncode.length <= 3993) {
        erc = 'Q'
      } else if (dataToEncode.length > 3993 && dataToEncode.length <= 5596) {
        erc = 'M'
      } else if (dataToEncode.length > 5596) {
        erc = 'L'
      }

      const url = await new Promise<string>((resolve, reject) => {
        QRCode.toString(
          dataToEncode,
          {
            type: 'svg',
            errorCorrectionLevel: erc,
            margin: 2,
            width: qrSmall ? 100 : undefined
          },
          (err, url) => {
            if (err) {
              reject(err);
            } else {
              resolve(url);
            }
          }
        );
      });
      return url;

    } catch (e) {
      return null;
    }
  };

  const sections: PrintSection[] = (script?.data?.printSections || [])
    .map((s: any) => {
      return {
        title: s.title,
        entries: s.screensIds
          .map((screenId: string) => {
            const entry = form.filter((e: any) => e.screen?.screen_id === screenId)[0];
            return entry || null;
          })
          .filter((e: any) => e),
      };
    })
    .filter((s: any) => s.entries.length);

  if (!sections.length) return '';

  const html: string = sections.map((s: PrintSection) => {
    const title: string = s.title || s?.entries[0]?.screen?.title
    const entriesHTML: string = s.entries
      .filter((e: any) => (e.values.length || e.repeatables || (e.screen?.type === 'management')))
      .map(({ values, screen, repeatables }: ScreenEntry) => {
        const {
          type: screenType,
          metadata: screenMeta,
          listStyle: _listStyle = 'none',
        } = { ...screen, metadata: { ...screen?.metadata } };

        // Handle 'management' screens
        if (screenType === 'management') {
          const mgmtSections: ManagementSection[] = [
            { title: screenMeta.title1, image: screenMeta.image1?.data, text: screenMeta.text1 },
            { title: screenMeta.title2, image: screenMeta.image2?.data, text: screenMeta.text2 },
            { title: screenMeta.title3, image: screenMeta.image3?.data, text: screenMeta.text3 },
          ].filter(s => s.title || s.text || s.image);

          return !mgmtSections.length ? '' : `
                      <div style="margin: 25px 0;">
                          <div style="font-weight:bold;margin:10px 0;">${screen.printTitle || screen.title}</div>
                          <br />
                          ${mgmtSections.map((s: ManagementSection) => {
            return [
              !s.title ? '' : `<div><b>${s.title}</b></div>`,
              !s.image ? '' : `<div><img style="width:100%;height:auto;" src="${s.image}" /></div>`,
              !s.text ? '' : `<div>${s.text.replace(/\n/gi, '<br />')}</div>`,
            ].filter(Boolean).join('');
          }).join('<br />')}
                      </div>
                  `;
        }

        // Handle regular values
        const valuesHTML: string = values
          .filter((e: any) => e.confidential ? showConfidential : true)
          .filter((v: any) => v.valueText || v.value)
          .filter((e: any) => e.printable !== false)
          .map((v: any) => {
            let isFlexRow: boolean = true;
            let hideLabel: boolean = false;

            let extraLabels = (v.extraLabels as ScreenEntryValue['extraLabels']) || [];
            const listStyle: string = v.listStyle || _listStyle;

            const isDff = ['fluids', 'drugs'].includes(screenType);

            if (isDff) {
              isFlexRow = false;
              hideLabel = true;
              extraLabels = [...extraLabels].filter((s: any) => s.title) as typeof extraLabels; // remove management text
              extraLabels = extraLabels.map(s => {
                if (typeof s === 'string') return s;
                return {
                  ...s,
                  title: !s.printTitle ? '' : s.title,
                };
              }) as typeof extraLabels;
            }
            
            let value: any = v.valueText || v.value || 'N/A'
            const exportType = v.type || v.exportType
            if (exportType === 'datetime' || exportType === 'date') {
              value = formatDate(value, exportType)
            }
            const shouldAppendUnit = exportType === 'number' || exportType === 'text'
            if (shouldAppendUnit && !Array.isArray(value)) {
              value = formatValueWithUnit(value, v.unit)
            }

            return `
              <div class="${isFlexRow ? 'row' : ''}">
                <span style="display:${hideLabel ? 'none' : 'block'};font-weight:bold;">${screenMeta.label || v.label}</span>
                <div>
                  <div style="${!extraLabels.length ? '' : 'font-size:18px;font-weight:bold;margin-top:10px;'}">
                    ${Array.isArray(value) ?
                      value.map((val: any, i: number) => {
                        let bullet: string = listStyle === 'bullet' ? '&#x2022; ' : `${i + 1}. `;
                        if (listStyle === 'none') bullet = '';
                        return `<span>${bullet}${val.valueText || val.value || 'N/A'}</span>${!val.value2 ? '' : `<span>(${val.value2})</span>`}`;
                      }).join('<br />')
                      :
                      `<span>${value}</span>${!v.value2 ? '' : `<span>(${v.value2})</span>`}`
                    }
                  </div>
                  ${!extraLabels.length ? '' : `
                    <div>
                      ${extraLabels.map((item) => {
                      const label: string = typeof item === 'string' ? item : (
                        [item.title ? `<b>${item.title}</b>` : '', item.label].filter(s => s).join(':')
                      );
                      return `
                        <div style="margin-bottom:5px;">
                          <div style="opacity:0.7;">${label}</div>
                          </div>`;
                      }).join('')}
                    </div>
                  `}
                </div>                  
              </div>
            `;
          }).join('');

        // Handle repeatables
        const repeatablesHTML: string = repeatables
          ? (Object.entries(repeatables) as [string, any[]][]).map(([_, groupItems]) => {
            return groupItems.map((item: any, groupIndex: number) => {
              const repeatableFields: string = Object.entries(item)
                .filter(([, v]: [string, any]) => typeof v === 'object' && v?.value !== undefined)
                .map(([k, v]: [string, any], itemIndex: number) => {
                  let value: string = v.valueText || v.value || 'N/A'
                  let index: string = ''
                  
                  if(itemIndex === 0){
                    index = `<strong>${groupIndex + 1}.</strong>`
                    value = `<i><strong>${value}</strong></i>`
                  } 

                  const exportType = v.exportType || v.type
                  if (exportType === 'datetime' || exportType === 'date') {
                    value = formatDate(value, exportType)
                  }
                  const shouldAppendUnit = exportType === 'number' || exportType === 'text'
                  if (shouldAppendUnit) {
                    value = formatValueWithUnit(value, v.unit)
                  }
                  
                  return `
                      <div class="row">
                          <span style="font-weight:bold;">${index} ${v.label || k}</span>
                          <div>
                              <span>${value}</span>
                          </div>
                      </div>
                  `;
                }).join('');

              return `
                  <div>
                      ${repeatableFields}
                  </div>
              `;
            }).join('');
            
          }).join('')
          : '';

        return `<div>${valuesHTML}${repeatablesHTML}</div>`;
      }).join('');

    return `
          <div class="title row">
              <strong>${title}</strong>
          </div>
          ${entriesHTML}
      `;
  }).join('');

  function formatDate(input: string | null | undefined, type: 'date' | 'datetime'): string {
    if (!input) return '';

    const parsedDate = new Date(input);

    // Check if date is valid
    if (isNaN(parsedDate.getTime())) return '';

    const options: Intl.DateTimeFormatOptions =
        type === 'datetime'
            ? { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }
            : { day: '2-digit', month: 'long', year: 'numeric' };

    return parsedDate.toLocaleString('en-GB', options).replace(',', '');
  }

  const generateImageHtml = async (): Promise<string> => {
    try {
      const generatedQR: string | null = await generateQRCode()
      let htmlContent: string = !!qrSmall ? 
        `<div style="text-align: right; margin: 0 auto; padding-right: 40px;">
          ${generatedQR}
        </div>` :
        `<div style="width: 300px; height: 300px; text-align: left; margin: 0 auto;">
          ${generatedQR}
        </div>`;
      return htmlContent;
    } catch (e) {
      return '<div style="width: 100%; height: auto; text-align: center;">NO QR-CODE GENERATED</div>';
    }
  }

  const qrcode: string = `
    <div style="text-align: right;">
      ${await generateImageHtml()}
      <br/>
    </div>
  `

  if(!!qrSmall){
    return getBaseHTML(`
      <div class="grid">${qrcode}${html}</div>
    `, session);
  } else {
    return getBaseHTML(`
      <div class="grid">${html}${qrcode}</div>
    `, session);
  }
}