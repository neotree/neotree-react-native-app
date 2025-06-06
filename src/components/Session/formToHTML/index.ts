/* eslint-disable indent */
import baseHTML from './baseHTML';
import groupEntries from './groupEntries';
import { reportErrors } from '../../../data/api';
import { formatExportableSession } from '../../../data/getConvertedSession'
import { toHL7Like } from '../../../data/hl7Like'
import QRCode from 'qrcode';



//import LZString from 'lz-string';
//import { deflate } from 'react-native-gzip';



export default async (session: any, showConfidential?: boolean) => {

  let { form, management,country } = session?.data;

  management = (management || []).filter((s: any) => form.map((e: any) => e.screen.screen_id).includes(s.screen_id));

  const sections: any[] = groupEntries(form);
  
  const generateQRCode = async () => {
    try {
      const formattedData = await formatExportableSession(session, { showConfidential: true });
      const hl7 = await toHL7Like(formattedData);
      // QR code parameters
      const dataToEncode:any = hl7
      
      let erc:any = 'H'
     if(dataToEncode.length>3057 && dataToEncode.length<=3993){
      erc='Q'
      }else if(dataToEncode.length>3993 && dataToEncode.length<=5596){
        erc='M'
      }else if(dataToEncode.length>5596) {
       erc='L'
      }
     
      const url = await new Promise((resolve, reject) => {
        QRCode.toString(
          dataToEncode,
          {
            type: 'svg',
            errorCorrectionLevel: erc,
            margin: 2,
          },
          (err, url) => {
            if (err) {
              reject(err); // Reject the promise if there's an error
            } else {
              resolve(url); // Resolve the promise with the SVG string
            }
          }
        );
      });
      return url;
      
    } catch (e) {
      return null;
    }
  };

 
  let managementHTML = management.map((screen: any) => {
    let sections = [
      { title: screen.metadata.title1, image: screen.metadata.image1?.data, text: screen.metadata.text1, },
      { title: screen.metadata.title2, image: screen.metadata.image2?.data, text: screen.metadata.text2, },
      { title: screen.metadata.title3, image: screen.metadata.image3?.data, text: screen.metadata.text3, },
    ].filter(s => s.title || s.text || s.image);

    return `
		<div style="margin: 25px 0;page-break-after:always;">
			<div class="title"> ${screen.printTitle || screen.title}</div>
			<br />
			${sections.map(s => {
      return [
        !s.title ? '' : `<div><b>${s.title}</b></div>`,
        !s.image ? '' : `<div><img style="width:100%;height:auto;" src="${s.image}" /></div>`,
        !s.text ? '' : `<div>${s.text.replace(new RegExp('\n', 'gi'), '<br />')}</div>`,
      ].filter(s => s).join('');
    }).join('<br />')}
		</div>
	`;
  }).join('');
  managementHTML = !managementHTML ? '' : `<div style="page-break-before:always;">${managementHTML}</div>`;
  const generateImageHtml = async () => {

  
    try {
    
      let htmlContent = `
              <div style="width: 100%; height: auto; text-align: center;">
                  ${await generateQRCode()}
              </div>
              `;
      
      return htmlContent;

    } catch (e) {
      reportErrors(e)
      return null;
    }
  }



  const qrcode =
    `<div style={"justify-content: center; align-items: center;"}>
  ${await generateImageHtml()}
  <br/>
  </div>
  `
  const tables =sections
    .filter(([, entries]) => entries.length)
    .map(([sectionTitle, entries]) => {
   
      entries = entries.filter((e: any) => e.values.length);
     
      return `
        ${!sectionTitle ? '' : (`
          <div class="title row">
            <strong>${sectionTitle}</strong>
          </div>
        `)}
      
        ${entries.filter((e: any) => e.values.length)
          .map(({
            values,
            // management, 
            screen: { metadata: { label }, type }
          }: any) => {
            // management = management || [];

            const valuesHTML = values
              .filter((e: any) => e.confidential ? showConfidential : true)
              .filter((v: any) => v.valueText || v.value)
              .filter((e: any) => e.printable !== false)
              .map((v: any) => {
                let isFlexRow = true;
                let hideLabel = false;

                if (['fluids', 'drugs'].includes(type)) {
                  isFlexRow = false;
                  hideLabel = true;
                }

                return `
                        <div  class="${isFlexRow ? 'row' : ''}">
                          <span style="display:${hideLabel ? 'none' : 'block'};font-weight:bold;">${label || v.label}</span>
                          <div>
                              ${v.value && v.value.map ?
                                  v.value.map((v: any) => `<span>${v.valueText || v.value || 'N/A'}</span>`).join('<br />')
                                  :
                                  `<span>${v.valueText || v.value || 'N/A'}</span>`
                                }

                              ${!v.extraLabels?.length ? '' : `
                                <div style="margin-top:5px;"></div>
                                ${v.extraLabels.map((label: string) => {
                                      return `<span style="opacity:0.7;">${label}</span>`;
                                  })}
                              `}
                          </div>                  
                        </div>
                    `;
              }).join('');

            return `<div>${valuesHTML}</div>`;
          })
          .join('')
        }
      `;
    }
  ).join('');

  return baseHTML(`<div class="grid">${qrcode}${tables}</div><div>${managementHTML}</div>`, session);
};
