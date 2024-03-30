const puppeteer = require('puppeteer');

 exports.genratePdf =  async(req,res) => {
  try {
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium-browser'
    });
    const page = await browser.newPage();

    // HTML content
    const htmlContent = `
      <html>
        <head>
          <title>Enter a title, displayed at the top of the window.</title>
        </head>
        <body>
          <h1>Enter the main heading, usually the same as the title.</h1>
          <p>Be <b>bold</b> in stating your key points. Put them in a list: </p>
          <ul>
            <li>The first item in your list</li>
            <li>The second item; <i>italicize</i> key words</li>
          </ul>
          <p>Improve your image by including an image. </p>
          <p><img src="http://www.mygifs.com/CoverImage.gif" alt="A Great HTML Resource"></p>
          <p>Add a link to your favorite <a href="https://www.dummies.com/">Web site</a>.
          Break up your page with a horizontal rule or two. </p>
          <hr>
          <p>Finally, link to <a href="page2.html">another page</a> in your own Web site.</p>
          <p>© Wiley Publishing, 2011</p>
        </body>
      </html>
    `;

    // Set the HTML content
    await page.setContent(htmlContent);

    // Generate PDF
    await page.pdf({ path: 'example.pdf', format: 'A4' });

    console.log('PDF generated successfully.');

    await browser.close();
  } catch (error) {
    console.error('An error occurred:', error);
  }
};