import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

(async () => {
  console.log('🚀 Starting PDF generation...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  const htmlPath = join(__dirname, '../presentation.html');
  const pdfPath = join(__dirname, '../Portfolio_Maker_Pro_Presentation.pdf');
  
  console.log('📄 Loading HTML file...');
  await page.goto(`file://${htmlPath}`, {
    waitUntil: 'networkidle0'
  });
  
  console.log('📋 Generating PDF...');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    landscape: true,
    printBackground: true,
    preferCSSPageSize: false,
    margin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  });
  
  await browser.close();
  
  console.log('✅ PDF created successfully!');
  console.log(`📁 Location: ${pdfPath}`);
})();
