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
    </style>
  </header>
  <body>
    <div id="header">
      <div id="headerImg">
        <h1 id="headerTitle">Neotree Neonatal Hospital Form</h1>
        <p id="headerSubtitle">Ministry of Health - National Admission Form</p>
      </div>
    </div>
    <div>${html || ''}<div>
  </body>
</html>
`;
