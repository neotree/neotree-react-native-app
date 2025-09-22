/* eslint-disable indent */

import QRCode from 'qrcode';
import { ScreenEntryValue } from '@/src/types';
import baseHTML from './baseHTML';
import groupEntries from './groupEntries';
import { reportErrors } from '../../../data/api';
import { formatExportableSession } from '../../../data/getConvertedSession'
import { toHL7Like } from '../../../data/hl7Like'



//import LZString from 'lz-string';
//import { deflate } from 'react-native-gzip';



export default async (session: any, showConfidential?: boolean) => {

  let { form, management, } = { ...session?.data };
  let qrSmall = false

  management = (management || []).filter((s: any) => form.map((e: any) => e.screen.screen_id).includes(s.screen_id));

  const sections: any[] = groupEntries(form);

  const generateQRCode = async () => {
    try {
      const formattedData = await formatExportableSession(session, { showConfidential: true });
      const hl7 = await toHL7Like(formattedData);
      // QR code parameters
      const dataToEncode: any = hl7
      if (dataToEncode.length < 200) {
        qrSmall = true
      }
      let erc: any = 'H'
      if (dataToEncode.length > 3057 && dataToEncode.length <= 3993) {
        erc = 'Q'
      } else if (dataToEncode.length > 3993 && dataToEncode.length <= 5596) {
        erc = 'M'
      } else if (dataToEncode.length > 5596) {
        erc = 'L'
      }

      const url = await new Promise((resolve, reject) => {
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
      const generatedQR = await generateQRCode()
      let htmlContent = !!qrSmall ? `<div style="text-align: right; margin: 0 auto; padding-right: 40px;">
                  ${generatedQR}
              </div>`:
        `<div style="width: 300px; height: 300px; text-align: left; margin: 0 auto;">
                  ${generatedQR}
              </div>
              `;

      return htmlContent;

    } catch (e) {
      reportErrors(e)
      return null;
    }
  }



  const qrcode =
    `<div style="text-align: right;">
  ${await generateImageHtml()}
  <br/>
</div>`
  const tables = sections
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

                const extraLabels = (v.extraLabels as ScreenEntryValue['extraLabels']) || [];
                let listStyle = v.listStyle || 'none';

                if (['fluids', 'drugs'].includes(type)) {
                  isFlexRow = false;
                  hideLabel = true;
                }
                let value = v.valueText || v.value || 'N/A'
                const exportType = v.type ||v.exportType
                if (exportType == 'datetime' || exportType == 'date') {
                  value = formatDate(value, exportType)
                }

                return `
                  <div  class="${isFlexRow ? 'row' : ''}">
                    <span style="display:${hideLabel ? 'none' : 'block'};font-weight:bold;">${label || v.label}</span>
                    <div>
                      <div style="${!extraLabels.length ? '' : 'font-size:18px;font-weight:bold;margin-top:10px;'}">
                        ${value && value.map ?
                          value.map((v: any, i: number) => {
                            let bullet = listStyle === 'bullet' ? '&#x2022; ' : `${i + 1}. `;
                            if (listStyle === 'none') bullet = '';
                            return `<span>${bullet}${v.valueText || v.value || 'N/A'}</span>${!v.value2 ? '' : `<span>(${v.value2})</span>`}`;
                          }).join('<br />')
                          :
                          `<span>${value}</span>${!v.value2 ? '' : `<span>(${v.value2})</span>`}`
                        }
                      </div>

                      ${!extraLabels?.length ? '' : `
                        <div>
                          ${extraLabels.map((item) => {
                            const label = typeof item === 'string' ? item : (
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

            return `<div>${valuesHTML}</div>`;
          })
          .join('')
        }
      `;
    }
    ).join('');

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
  if (!!qrSmall) {
    return baseHTML(`<div class="grid">${qrcode}${tables}</div><div>${managementHTML}</div>`, session);
  } else {
    return baseHTML(`<div class="grid">${tables}${qrcode}</div><div>${managementHTML}</div>`, session);
  }
};
