const puppeteer = require('puppeteer');
const AWS = require('aws-sdk')
 exports.genratePdf =  async(req,res) => {
  try {
    let registerNumber = req?.body?.registerNumber || "dnfkngkghdkhbbj"
    let challanDetail = []

    // Create a new PDF document
    const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT_NEW);
    const s3 = new AWS.S3({
        endpoint: spacesEndpoint,
        accessKeyId: process.env.DO_SPACES_KEY_NEW,
        secretAccessKey: process.env.DO_SPACES_SECRET_NEW,
    });
    const bucketName = process.env.DO_SPACES_BUCKET_NEW;
    const objectKey = `local/ChallanPdf/${registerNumber?.toLowerCase()}.pdf`; // Update with the appropriate object key
    // var destination = `${process.env.DO_SPACE_FOLDER_NEW}/${folder}/${filename[filename.length - 1]}`
    s3.getObject({
        Bucket: bucketName,
        Key: objectKey
    }, async (err, data) => {
        if (err) {
            const generateP = await generatePdfObject(challanDetail, registerNumber)
            // console.log('generateP', generateP)
            const PdfUploadedLink = await fileUploadWithDigitalOcean(generateP, "ChallanPdf", registerNumber);
            console.log('PdfUploadedLink', PdfUploadedLink);
            return res.send({ data: { status: true, pdfUrl: PdfUploadedLink?.pdfUrl } })
            // Handle the error here
        } else {
            return res.send({ data: { status: true, pdfUrl: "https://rtoapplication.sgp1.cdn.digitaloceanspaces.com/" + objectKey } })
            // Process the retrieved object data here
        }
    });
} catch (error) {
    console.log("Error generating or uploading PDF: " + error.message);
    return res.send({ error: "Something went wrong !!" })
}
};


async function fileUploadWithDigitalOcean(file, foldername, registerNumber) {
  try {
      const fileName = registerNumber?.toLowerCase() + "." + "pdf";
      const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT_NEW);
      const s3 = new AWS.S3({
          endpoint: spacesEndpoint,
          accessKeyId: process.env.DO_SPACES_KEY_NEW,
          secretAccessKey: process.env.DO_SPACES_SECRET_NEW,
      });
      let destination
      if (foldername == "") {
          destination = `${process.env.DO_SPACE_FOLDER_NEW}/${fileName}`
      }
      else {
          destination = `${process.env.DO_SPACE_FOLDER_NEW}/${foldername}/${fileName}`
      }
      var contenttype = file?.mimetype;
      const digiCridential = {
          Bucket: process.env.DO_SPACES_BUCKET_NEW,
          folder: process.env.DO_SPACE_FOLDER_NEW,
          Key: destination,
          Body: file.data,
          ACL: "public-read",
          region: process.env.DO_SPACES_REGION_NEW,
          ContentType: contenttype
      }
      const dataLoc = await s3.upload(digiCridential).promise()
      if (dataLoc) {
          return {
              status: true,
              pdfUrl: (dataLoc.Location).replace("https://rtoapplication.sgp1.digitaloceanspaces.com/", process.env.DO_SPACES_BASE_URL_NEW)
          }
      } else {
          return {
              status: false,
          }
      }
  } catch (error) {
      if (error) {
          return {
              status: false
          }
      }
      return error
  }

}

const generatePdfObject = async (challanDetail, registerNumber) => {
  try {
     challanDetail = [
      {
        "challan_no": "CH001",
        "challan_date": "2024-03-30",
        "challan_amount": 1000,
        "challan_status": "Paid"
      },
      {
        "challan_no": "CH002",
        "challan_date": "2024-03-29",
        "challan_amount": 1500,
        "challan_status": "Unpaid"
      },
      {
        "challan_no": "CH003",
        "challan_date": "2024-03-28",
        "challan_amount": 800,
        "challan_status": "Paid"
      },
      // Add more dummy data as needed
    ];
      // Launch a headless browser
      const browser = await puppeteer.launch({
        executablePath: '/usr/bin/chromium-browser'
      });

      // Create a new page
      const page = await browser.newPage();

      // Set the HTML content of the page
      await page.setContent(`
      <!DOCTYPE html>
      <html>
          <head>
              <title>RTO Vehicle Information - Challan Details</title>
              <style>
                  @page {
                      size: a4 portrait;
                  }
                  *{
                      box-sizing: border-box;
                      padding: 0;
                      margin: 0;
                      font-family: "Arial";
                      font-size: 1rem;
                  }
                  .rc-details {
                      width: 960px;
                      margin: 1rem auto;
                  }
                  .rc-details .header {
                      display: flex;
                      align-items: center;
                      justify-content: space-between;
                      padding: 15px;
                      border: 1px solid #d2d2d2;
                      height: 111px;
                  }
                  .rc-details .header .header-logo {
                      display: flex;
                      align-items: center;
                  }
                  .rc-details .header .header-logo img{
                      width: 80px;
                  }
                  .rc-details .header .header-logo span {
                      font-size: 1.3rem;
                      margin-left: 15px;
                      font-weight: 700;
                  }
                  .rc-details .header .header-button .app-store-btn {
                      display: inline-block;
                      padding: 10px 15px 10px 50px;
                      border-radius: .325rem;
                      background-position: center left .75rem;
                      background-color: #222;
                      background-size: 1.7rem 1.7rem;
                      background-repeat: no-repeat;
                      text-decoration: none;
                      white-space: nowrap;
                      margin: 0 5px;
                  }
                  .rc-details .header .header-button .btn-apple {
                      background-image: url(data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCAzMDUgMzA1IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAzMDUgMzA1OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjI0cHgiIGhlaWdodD0iMjRweCI+CjxnIGlkPSJYTUxJRF8yMjhfIj4KCTxwYXRoIGlkPSJYTUxJRF8yMjlfIiBkPSJNNDAuNzM4LDExMi4xMTljLTI1Ljc4NSw0NC43NDUtOS4zOTMsMTEyLjY0OCwxOS4xMjEsMTUzLjgyQzc0LjA5MiwyODYuNTIzLDg4LjUwMiwzMDUsMTA4LjIzOSwzMDUgICBjMC4zNzIsMCwwLjc0NS0wLjAwNywxLjEyNy0wLjAyMmM5LjI3My0wLjM3LDE1Ljk3NC0zLjIyNSwyMi40NTMtNS45ODRjNy4yNzQtMy4xLDE0Ljc5Ny02LjMwNSwyNi41OTctNi4zMDUgICBjMTEuMjI2LDAsMTguMzksMy4xMDEsMjUuMzE4LDYuMDk5YzYuODI4LDIuOTU0LDEzLjg2MSw2LjAxLDI0LjI1Myw1LjgxNWMyMi4yMzItMC40MTQsMzUuODgyLTIwLjM1Miw0Ny45MjUtMzcuOTQxICAgYzEyLjU2Ny0xOC4zNjUsMTguODcxLTM2LjE5NiwyMC45OTgtNDMuMDFsMC4wODYtMC4yNzFjMC40MDUtMS4yMTEtMC4xNjctMi41MzMtMS4zMjgtMy4wNjZjLTAuMDMyLTAuMDE1LTAuMTUtMC4wNjQtMC4xODMtMC4wNzggICBjLTMuOTE1LTEuNjAxLTM4LjI1Ny0xNi44MzYtMzguNjE4LTU4LjM2Yy0wLjMzNS0zMy43MzYsMjUuNzYzLTUxLjYwMSwzMC45OTctNTQuODM5bDAuMjQ0LTAuMTUyICAgYzAuNTY3LTAuMzY1LDAuOTYyLTAuOTQ0LDEuMDk2LTEuNjA2YzAuMTM0LTAuNjYxLTAuMDA2LTEuMzQ5LTAuMzg2LTEuOTA1Yy0xOC4wMTQtMjYuMzYyLTQ1LjYyNC0zMC4zMzUtNTYuNzQtMzAuODEzICAgYy0xLjYxMy0wLjE2MS0zLjI3OC0wLjI0Mi00Ljk1LTAuMjQyYy0xMy4wNTYsMC0yNS41NjMsNC45MzEtMzUuNjExLDguODkzYy02LjkzNiwyLjczNS0xMi45MjcsNS4wOTctMTcuMDU5LDUuMDk3ICAgYy00LjY0MywwLTEwLjY2OC0yLjM5MS0xNy42NDUtNS4xNTljLTkuMzMtMy43MDMtMTkuOTA1LTcuODk5LTMxLjEtNy44OTljLTAuMjY3LDAtMC41MywwLjAwMy0wLjc4OSwwLjAwOCAgIEM3OC44OTQsNzMuNjQzLDU0LjI5OCw4OC41MzUsNDAuNzM4LDExMi4xMTl6IiBmaWxsPSIjRkZGRkZGIi8+Cgk8cGF0aCBpZD0iWE1MSURfMjMwXyIgZD0iTTIxMi4xMDEsMC4wMDJjLTE1Ljc2MywwLjY0Mi0zNC42NzIsMTAuMzQ1LTQ1Ljk3NCwyMy41ODNjLTkuNjA1LDExLjEyNy0xOC45ODgsMjkuNjc5LTE2LjUxNiw0OC4zNzkgICBjMC4xNTUsMS4xNywxLjEwNywyLjA3MywyLjI4NCwyLjE2NGMxLjA2NCwwLjA4MywyLjE1LDAuMTI1LDMuMjMyLDAuMTI2YzE1LjQxMywwLDMyLjA0LTguNTI3LDQzLjM5NS0yMi4yNTcgICBjMTEuOTUxLTE0LjQ5OCwxNy45OTQtMzMuMTA0LDE2LjE2Ni00OS43N0MyMTQuNTQ0LDAuOTIxLDIxMy4zOTUtMC4wNDksMjEyLjEwMSwwLjAwMnoiIGZpbGw9IiNGRkZGRkYiLz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K);
                  }
                  .rc-details .header .header-button .btn-google {
                      background-image: url(data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjUxMnB4IiBoZWlnaHQ9IjUxMnB4Ij4KPHBvbHlnb24gc3R5bGU9ImZpbGw6IzVDREFERDsiIHBvaW50cz0iMjkuNTMsMCAyOS41MywyNTEuNTA5IDI5LjUzLDUxMiAyOTkuMDA0LDI1MS41MDkgIi8+Cjxwb2x5Z29uIHN0eWxlPSJmaWxsOiNCREVDQzQ7IiBwb2ludHM9IjM2OS4wNjcsMTgwLjU0NyAyNjIuMTc1LDExOS40NjcgMjkuNTMsMCAyOTkuMDA0LDI1MS41MDkgIi8+Cjxwb2x5Z29uIHN0eWxlPSJmaWxsOiNEQzY4QTE7IiBwb2ludHM9IjI5LjUzLDUxMiAyOS41Myw1MTIgMjYyLjE3NSwzODMuNTUxIDM2OS4wNjcsMzIyLjQ3IDI5OS4wMDQsMjUxLjUwOSAiLz4KPHBhdGggc3R5bGU9ImZpbGw6I0ZGQ0E5NjsiIGQ9Ik0zNjkuMDY3LDE4MC41NDdsLTcwLjA2Myw3MC45NjFsNzAuMDYzLDcwLjk2MWwxMDguNjg4LTYyLjg3N2M2LjI4OC0zLjU5Myw2LjI4OC0xMS42NzcsMC0xNS4yNyAgTDM2OS4wNjcsMTgwLjU0N3oiLz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==);
                  }
                  .rc-details .header .header-button .app-store-btn .app-store-btn-subtitle {
                      display: block;
                      margin-bottom: 0.2rem;
                      color: #fff;
                      font-size: .8rem;
                      letter-spacing: 0.4px;
                  }
                  .rc-details .header .header-button .app-store-btn .app-store-btn-title {
                      display: block;
                      color: #fff;
                      font-size: 1.1rem;
                      font-weight: 700;
                  }
                  .rc-details .rc-details-datatable .table-striped{
                      width: 100%;
                      border-collapse: collapse;
                      text-align: left;
                      border: 1px solid #d2d2d2;
                      margin-top: 30px;
                  }
                  .rc-details .rc-details-datatable .table-striped tr{
                      height: 52px;
                  }
                  .rc-details .rc-details-datatable .table-striped td{
                      position: relative;
                      padding: 0 1.2rem;
                      width: 50%;
                      font-weight: 700;
                      letter-spacing: 0.2px;
                      text-transform: capitalize;
                  }
                  .rc-details .rc-details-datatable .table-striped td span{
                      font-weight: 600;
                      color: #656565;
                  }
                  .rc-details .rc-details-datatable .table-striped td:nth-child(2):before{
                      content: "";
                      position: absolute;
                      left: 0;
                      top: 50%;
                      transform: translateY(-50%);
                      height: 80%;
                      width: 1px;
                      background-color: #D2D2D2;
                  }
                  .rc-details .rc-details-datatable .table-striped tbody tr:nth-of-type(odd) {
                      background-color: #E7E9E8;
                  }
                  .rc-details .rc-details-datatable .table-striped tbody tr:nth-of-type(even) {
                      background-color: #F5F5F5;
                  }
                  .rc-details .rc-details-datatable .table-striped th {
                      position: relative;
                      padding: 1.2rem;
                      font-size: 20px;
                      line-height: 16px;
                      font-weight: 700;
                      letter-spacing: 0.2px;
                      text-align: center;
                      border-bottom: 1px solid #d2d2d2;
                      background-color: #d9dbda;
                  }
                  .rc-details .rc-details-datatable .description{
                      margin-top: 20px;
                      color: #656565;
                  }
              </style>
          </head>
      <body>
          <div class="rc-details">
              <div class="header">
                  <div class="header-logo">
                      <img src="logo.png" alt="RTO Vehicle Information" title="RTO Vehicle Information">
                      <span>RTO Vehicle Information</span>
                  </div>
                  <div class="header-button">
                      <a class="app-store-btn btn-google">
                          <span class="app-store-btn-subtitle">Download on the</span>
                          <span class="app-store-btn-title">Google Play</span>
                      </a>
                      <a class="app-store-btn btn-apple">
                          <span class="app-store-btn-subtitle">Download on the</span>
                          <span class="app-store-btn-title">App Store</span>
                      </a>
                  </div>
              </div>
      
              <div class="rc-details-datatable">
                  <table class="table-striped first" style="margin-top: 0">
                      <tr>
                          <th colspan="2">Challan Details (${registerNumber})</th>
                      </tr>
                  </table>
      
                 ${challanDetail?.map((item) => {
          return (`<table class="table-striped first">
                      <tr id="challan_no">
                          <td>Challan No. : <span>${item.challan_no}</span></td>
                          <td>Challan Date : <span>${item?.challan_date}</span></td>
                      </tr>
                      <tr id="challan_amount">
                          <td colspan="2">Challan Amount : <span>${item?.challan_amount}</span></td>
                      </tr>
                      <tr id="challan_status">
                          <td colspan="2">Challan Status : <span>${item?.challan_status}</span></td>
                      </tr>
                      <tr id="challan_payment">
                          <td colspan="2">RC Number : <span>${registerNumber}</span></td>
                      </tr>
                  </table>`)
      })}
      
                  
      
                  <p class="description">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
              </div>
          </div>
      </body>
      </html>
      `);
      const pdfBuffer = await page.pdf({ format: 'A4' });
      // Close the browser
      await browser.close();
      // Construct object with PDF data
      const pdfObject = {
          name: 'dummy.pdf',
          data: pdfBuffer,
          size: pdfBuffer.length,
          encoding: '7bit',
          tempFilePath: '',
          truncated: false,
          mimetype: 'application/pdf',
          md5: '', // Calculate MD5 hash if needed
          mv: () => { } // Function placeholder
      };
      return pdfObject;
  } catch (error) {
      throw error;
  }
};