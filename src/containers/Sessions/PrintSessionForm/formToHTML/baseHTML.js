import moment from 'moment';

export default (html, session) => {
  const { completed_at, canceled_at, script, } = session.data;
  const creationDate = completed_at || canceled_at;

  return `
  <!DOCTYPE html>
  <html>
    <header>
      <style>
        body {
          font-size: 14px;
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
        #content {
          webkit-columns: 0px 2;
          moz-columns: 0px 2;
          ms-columns: 0px 2;
          columns: 0px 2;
        }
        .title {
          padding: 3px;
          background: #ccc;
          color: #000;
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

        footer {
          font-size: 9px;
          color: #999;
          text-align: center;
          display: flex;
          align-items: center;
        }

        @page {
          size: A4;
          margin: 11mm 0;
        }

        @media print {
          footer {
            position: fixed;
            bottom: 0px;
            left: 0;
            width: 100%;
          }

          /*#pageNo::after {
            counter-increment: page;
            content: "Page " counter(page) " of " counter(pages);
          }*/

          .content-wrap {
            page-break-inside: avoid;
          }

          html, body {
            width: 210mm;
            height: 297mm;
          }
        }
      </style>
    </header>
    <body>
      <div id="header">
        <div id="headerImg">
          <h3 id="headerTitle">Neotree Neonatal Hospital Form</h3>
          <p id="headerSubtitle">Ministry of Health - National ${script.data.type === 'discharge' ? 'Discharge' : 'Admission'} Form</p>
        </div>
      </div>
      <div id"content-wrap">
        <div id="content">${html || ''}<div>
      </div>
      <footer>
        <span>Session ID: ${session.id}</span>
        <span style="margin:auto;" id="pageNo"></span>
        <span>Creation date: ${moment(creationDate).format('DD MMM, YYYY')}</span>
      </footer>
    </body>
  </html>
  `;
};
