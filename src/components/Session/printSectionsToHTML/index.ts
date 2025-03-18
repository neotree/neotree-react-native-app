import { getBaseHTML } from "./baseHTML";

export async function printSectionsToHTML({
    session,
    showConfidential,
    qrCode,
}: {
    session: any;
    showConfidential?: boolean;
    qrCode: string;
}) {
    const { form, script } = session.data;
    const sections = (script?.data?.printSections || [])
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

    const html = sections.map((s: any) => {
        const entriesHTML = s.entries
            .filter((e: any) => (e.values.length || (e.screen?.type === 'management')))
            .map(({ values, screen }: any) => {
                const {
                    type: screenType,
                    metadata: screenMeta,
                } = { ...screen, metadata: { ...screen?.metadata }, };
        
                if (screenType === 'management') {
                    const mgmtSections = [
                        { title: screenMeta.title1, image: screenMeta.image1?.data, text: screenMeta.text1, },
                        { title: screenMeta.title2, image: screenMeta.image2?.data, text: screenMeta.text2, },
                        { title: screenMeta.title3, image: screenMeta.image3?.data, text: screenMeta.text3, },
                    ]
                    .filter(s => s.title || s.text || s.image);
                        
                    return !mgmtSections.length ? '' : `
                        <div style="margin: 25px 0;">
                            <div style="font:bold;margin:10px 0;">${screen.printTitle || screen.title}</div>
                            <br />
                            ${mgmtSections.map((s: any) => {
                                return [
                                    !s.title ? '' : `<div><b>${s.title}</b></div>`,
                                    !s.image ? '' : `<div><img style="width:100%;height:auto;" src="${s.image}" /></div>`,
                                    !s.text ? '' : `<div>${s.text.replace(new RegExp('\n', 'gi'), '<br />')}</div>`,
                                ].filter(s => s).join('');
                            }).join('<br />')}
                        </div>
                    `;
                }

                const valuesHTML = values
                    .filter((e: any) => e.confidential ? showConfidential : true)
                    .filter((v: any) => v.valueText || v.value)
                    .filter((e: any) => e.printable !== false)
                    .map((v: any) => {
                        let isFlexRow = true;
                        let hideLabel = false;

                        if (['fluids', 'drugs'].includes(screenType)) {
                            isFlexRow = false;
                            hideLabel = true;
                        }

                        return `
                            <div  class="${isFlexRow ? 'row' : ''}">
                                <span style="display:${hideLabel ? 'none' : 'block'};font-weight:bold;">${screenMeta.label || v.label}</span>
                                <div>
                                    ${v.value && v.value.map ? 
                                        v.value.map((v: any) => `<span>${v.valueText || v.value || 'N/A'}</span>`).join('<br />') 
                                        : 
                                        `<span>${v.valueText || v.value || 'N/A'}</span>`
                                    }

                                    ${!v.extraLabels ? '' : `<div>${v.extraLabels.map((label: string) => {
                                        return `<span style="opacity:0.7;">${label}</span>`;
                                    })}</div>`}
                                </div>                  
                            </div>
                        `;
                    }).join('');
        
                return `<div>${valuesHTML}</div>`;
            }).join('');

        return `
            <div class="title row">
                <strong>${s.title}</strong>
            </div>
            ${entriesHTML}
        `;
    }).join('');

    const qrCodeHTML = !qrCode ? '' : `
        <div>
            <div style="display: flex; flex-wrap: wrap;">
                <div style="flex: 1; padding: 10px;">
                    <h2>QR CODE:</h2>
                </div>
                <div style="flex: 1; padding: 10px;">
                    <img style="width:20%;height:auto;" src="${qrCode}"/>
                </div>
            </div>
            <br />
        </div>
    `;

    return getBaseHTML(`
        ${qrCodeHTML}
        <div class="grid">${html}</div>
    `, session);
}
