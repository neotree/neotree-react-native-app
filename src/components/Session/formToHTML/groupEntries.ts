import ucFirst from '../../../utils/ucFirst';

export default function groupEntries(form: any) {
    const sections: any[] = [];

    form.forEach((entry: any) => {
        const { screen } = entry;
        const { sectionTitle } = screen;
        const excludeScreenTypes = ['edliz_summary_table'];
        if (entry.values.length && !excludeScreenTypes.includes(screen.type)) {
            [
                ...(screen.type === 'diagnosis' ? [
                    'Ranked diagnoses',
                ] : [sectionTitle])
            ].forEach((sectionTitle) => {
                const _sectionTitle = ucFirst(`${sectionTitle}`.toLowerCase());
                let sectionIndex = sections.map(([section]) => section).indexOf(_sectionTitle);
                if (sectionIndex < 0) {
                    sections.push([sectionTitle ? _sectionTitle : '', []]);
                    sectionIndex = sections.length - 1;
                }

                const values = entry.values.filter((v: any) => {
                    if (screen.type === 'diagnosis') {
                        let accepted = v.diagnosis.how_agree !== 'No';
                        if (!accepted) return false;
                        return true;
                    }
                    return v.value || v.valueText ? true : false;
                });

                if (values.length) sections[sectionIndex][1].push({ ...entry, values, });
            });
        }
    });
    
    return sections;
}
