import ucFirst from '../../../utils/ucFirst';

type Repeatables = {
  [key: string]: Record<string, any>[];
};

export default function groupEntries(form: any[]) {
  const sections: any[] = [];

  form.forEach((entry) => {
    const { screen, values = [], repeatables = {} } = entry;
    const { sectionTitle, type: screenType } = screen;
    const excludeScreenTypes = ['edliz_summary_table'];

    const hasValidValues = values.length > 0;
    const hasRepeatables = repeatables && Object.keys(repeatables).length > 0;

    if ((hasValidValues && !excludeScreenTypes.includes(screenType)) || hasRepeatables) {
      const sectionTitles = screenType === 'diagnosis'
        ? ['Ranked diagnoses']
        : [sectionTitle];

      sectionTitles.forEach((sectionTitle) => {
        const _sectionTitle = ucFirst(`${sectionTitle}`.toLowerCase());
        let sectionIndex = sections.map(([section]) => section).indexOf(_sectionTitle);

        if (sectionIndex < 0) {
          sections.push([_sectionTitle, []]);
          sectionIndex = sections.length - 1;
        }

        // Push normal values if any
        const filteredValues = values.filter((v: any) => {
          if (screenType === 'diagnosis') {
            return v.diagnosis?.how_agree !== 'No';
          }
          return v.value || v.valueText;
        });

        if (filteredValues.length) {
          sections[sectionIndex][1].push({ ...entry, values: filteredValues });
        }

        // Push repeatables as individual entries
        const repeatablesTyped = repeatables as Repeatables;
        Object.entries(repeatablesTyped).forEach(([repeatKey, repeatItems]) => {
          repeatItems.forEach((repeatEntry, i) => {
            const subSectionEntry = {
              ...entry,
              values: Object.entries(repeatEntry).map(([key, val]) => ({
                key,
                ...val,
              })),
              isRepeatable: true,
              repeatKey,
              repeatIndex: i,
            };
            sections[sectionIndex][1].push(subSectionEntry);
          });
        });
      });
    }
  });

  return sections;
}
