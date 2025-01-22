/* eslint-disable indent */
import { generateQRCode } from '@/src/utils/generate-session-qrcode';
import baseHTML from './baseHTML';
import groupEntries from './groupEntries';


export default  async ({ session, showConfidential, }: {
  session: any, 
  showConfidential?: boolean;
}) => {
  const qrCode = await generateQRCode({ session });
  let { form, management } = session.data;
 
  management = (management || []).filter((s: any) => form.map((e: any) => e.screen.screen_id).includes(s.screen_id));

  const sections: any[] = groupEntries(form);

  let managementHTML = management.map((screen: any) => {
    const sections = [
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

  const qrcode = !qrCode ? '' : `
  <div style="display: flex; flex-wrap: wrap;">
  <div style="flex: 1; padding: 10px;">
    <h2>QR CODE:</h2>
  </div>
  <div style="flex: 1; padding: 10px;">
  <img style="width:20%;height:auto;" src="${await generateQRCode({ session })}"/>
  </div>
</div>
 <br />
  `

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
            screen: { metadata: { label } }
          }: any) => {
            // management = management || [];

            const valuesHTML = values
              .filter((e: any) => e.confidential ? showConfidential : true)
              .filter((v: any) => v.valueText || v.value)
              .filter((e: any) => e.printable !== false)
              .map((v: any) => {
                return `
                        <div  class="row">
                          <span>${label || v.label}</span>
                          <div>
                              ${v.value && v.value.map ?
                                  v.value.map((v: any) => `<span>${v.valueText || v.value || 'N/A'}</span>`).join('<br />')
                                  :
                                  `<span>${v.valueText || v.value || 'N/A'}</span>`
                                }

                              ${!v.extraLabels?.length ? '' : `
                                <div style="margin-top:5px;"></div>
                                ${v.extraLabels.map((label: string) => {
                                      return `<span style="color:#999;">${label}</span>`;
                                  })}
                              `}
                          </div>                  
                        </div>
                    `;
              }).join('');

            // let managementHTML = management.map((s: any) => {
            //   const sections = [
            //     { title: s.metadata.title1, image: s.metadata.image1?.data, text: s.metadata.text1, },
            //     { title: s.metadata.title2, image: s.metadata.image2?.data, text: s.metadata.text2, },
            //     { title: s.metadata.title3, image: s.metadata.image3?.data, text: s.metadata.text3, },
            //   ].filter(s => s.title || s.text || s.image);
            //   return sections.map(s => {
            //     return [
            //       !s.title ? '' : `<div>${s.title}</div>`,
            //       !s.image ? '' : `<div><img style="width:auto;height:auto;max-width:100%;" src="${s.image}" /></div>`,
            //       !s.text ? '' : `<div>${s.text}</div>`,
            //     ].filter(s => s).join('');
            //   }).join('');
            // }).join('');
            // managementHTML = !managementHTML ? '' : `<div>${managementHTML}</div>`;

            // return `
            //   <div>${valuesHTML}</div> 
            //   <div>${managementHTML}</div>
            // `;

            return `<div>${valuesHTML}</div>`;
          }).join('')}
      `;
    }).join('');

  return baseHTML(`<div>${qrcode}</div><div class="grid">${tables}</div><div>${managementHTML}</div>`, session);
};
