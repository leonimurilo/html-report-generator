import * as pug from 'pug';
import puppeteer from 'puppeteer';
import * as sass from 'node-sass';
import * as path from 'path';

const defaultOptions = {
  htmlTemplatePath: path.resolve(__dirname, '../templates/pdf-template.pug'),
  styleOptions: {
    file: path.resolve(__dirname, '../templates/pdf-template.scss')
  },
  htmlTemplateOptions: {},
  pdfOptions: {
    path: 'pdf-file.pdf',
    format: 'A4',
    printBackground: true
  }
};

module.exports = {
  queue: async (options = defaultOptions) => {
    const browser = await puppeteer.launch(options.puppeteerOptions);
    const page = await browser.newPage();
    let htmlTemplateOptions = { ...options.htmlTemplateOptions };
    let renderedTemplate;

    // This is conditional since the user could get his style in some other way.
    if (options.styleOptions) {
      const compiledStyle = sass.renderSync({ ...options.styleOptions });

      htmlTemplateOptions = {
        ...options.htmlTemplateOptions,
        compiledStyle: compiledStyle.css,
      };
    }

    if (options.htmlTemplateFn) {
      renderedTemplate = options.htmlTemplateFn(htmlTemplateOptions);
    } else if (options.htmlTemplatePath) {
      renderedTemplate = pug.renderFile(options.htmlTemplatePath, htmlTemplateOptions);
    } else {
      throw Error('htmlTemplateFn or htmlTemplatePath must be provided');
    }

    // Make puppeteer render the HTML from data buffer
    await page.goto(`data:text/html,${renderedTemplate}`,
      { waitUntil: ['load', 'domcontentloaded', 'networkidle0'] });

    const pdfBuffer = await page.pdf({ ...options.pdfOptions });

    await browser.close();

    return pdfBuffer;
  }
};
