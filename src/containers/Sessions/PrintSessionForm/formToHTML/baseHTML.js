export default html => `
<!DOCTYPE html>
<html>
  <header>
    <style>
      #header {
        text-align: center;
      }
      #headerTitle {
        margin: 0;
        padding: 0;
      }
      #headerSubtitle {
        color: #999;
      }
      #content {
        webkit-columns: 0px 2;
        moz-columns: 0px 2;
        ms-columns: 0px 2;
        columns: 0px 2;
      }
      .title {
        padding: 10px;
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
        padding: 5px;
      }
    </style>
  </header>
  <body>
    <div id="header">
      <div id="headerImg">
        <h1 id="headerTitle">Neotree Neonatal Hospital Form</h1>
        <p id="headerSubtitle">Ministry of Health - National Admission Form</p>
      </div>
    </div>
    <div id="content">${html || ''}<div>
  </body>
</html>
`;
