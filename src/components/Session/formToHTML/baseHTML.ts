import moment from 'moment';

import { ScreenEntry } from '@/src/types';

export default (html: any, session: any) => {
  const { completed_at, canceled_at, script, form, } = session.data;

  const printConfig = script?.data?.printConfig || {
    headerFields: [] as string[],
    footerFields: [] as string[],
    sections: [] as any[],
  };

  const headerFields: { key: string; value: string; label: string; }[] = [];
    
  form.forEach((e: ScreenEntry) => {
    let values = Array.isArray(e.value) ? e.value : (e.value ? [e.value] : []);
    values = Array.isArray(e.values) ? e.values : (e.values ? [e.values] : []);

    values
      .filter(v => printConfig.headerFields.includes(v.key))
      .forEach(v => {
        const key = v.key;
        const label = v.valueLabel || v.label;

        let value = v.valueText || v.value || '';
        if (v.value2) value = `${value || ''} (${v.value2})`.trim();

        if (value && key) headerFields.push({ key, value, label, });
      });
  });

  const creationDate = completed_at || canceled_at;
  const formatScriptType = (type:string)=>{
   
    if(type==='discharge'){
      return "Discharge"
    }else if(type==='drecord'){
      return "Daily Records"
    } else{
      return "Admission"
    }

  }

  return `
  <!DOCTYPE html>
  <html>
    <header>
      <style>
        body {
          font-size: 14px;
          padding: 0px 20px;
        }
        #header {
          text-align: center;
          margin-bottom: 10px;
        }
        #headerTitle {
          margin: 0;
          padding: 0;
        }
        #headerSubtitle {
          color: #999;
          margin: 0;
          padding: 0;
        }
        .grid {
          webkit-columns: 0px 2;
          moz-columns: 0px 2;
          ms-columns: 0px 2;
          columns: 0px 2;
        }
        .title {
          padding: 3px;
          border: 1px solid #000;
          margin-bottom: 10px;
        }
        .row {
          webkit-column-break-inside: avoid;
          moz-column-break-inside: avoid;
          ms-column-break-inside: avoid;
          column-break-inside: avoid;
          webkit-break-inside: avoid;
          moz-break-inside: avoid;
          ms-break-inside: avoid;
          break-inside: avoid;
          display: flex;
        }
        .row:not(.title) > * {
          flex: 0 0 50%;
          padding: 3px;
        }

        tfoot, thead {
          font-size: 9px;
          color: #999;
        }

        thead {
          margin-bottom: 20px;
          text-align: center;
          background-color: red;
          display: none;
        }

        #footer-meta {
          text-align: center;
          display: flex;
          align-items: center;
          column-gap: 5px;
        }

        @page {
          size: A4;
          margin: 11mm 0;
        }

        @media print {
          /* tfoot {
            position: fixed;
            bottom: 0px;
            left: 0;
            width: 100%;
          } */

          .content-wrap {
            page-break-inside: avoid;
          }

          /*#pageNo::after {
            counter-increment: page;
            content: "Page " counter(page) " of " counter(pages);
          }*/
        }
      </style>
    </header>
    <body>
      <table>
        ${!headerFields.length ? '' : `
          <thead>
              <tr>
                  <td style="text-align:center;">
                    <div style="display:inline-block;text-align:left;">
                      ${headerFields.map(f => `
                        <div><b>${f.label}</b>: ${f.value}</div>  
                      `).join('')}
                    </div>  
                  </td>
              </tr>
          </thead>
        `}

        <tbody>
            <tr>
                <td>
                  <div id="header">
                    <div id="headerImg">
                      <h3 id="headerTitle">${script.data.printTitle || script.data.title}</h3>
                      <p id="headerSubtitle">Ministry of Health - National ${formatScriptType(script.data.type)} Form</p>
                    </div>
                  </div>
                  <div id"content-wrap">
                    <div id="content">
                        ${html || ''}
                    <div>
                  </div>
                </td>
            </tr>
        </tbody>

        <tfoot>
            <tr>
                <td>
                  <div id="footer-meta">
                    <span>Session ID: ${session.uid}</span>                    
                    ${!creationDate ? '' : `<span>Creation date: ${moment(creationDate).format('DD MMM, YYYY')}</span>`}
                    <span style="margin:auto;" id="pageNo"></span>
                  </div>
                </td>
            </tr>
        </tfoot>
      </table>
    </body>
  </html>
  `;
};
