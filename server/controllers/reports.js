import * as pug from 'pug';
import moment from 'moment';
import puppeteer from 'puppeteer';
import * as sass from 'node-sass';
import * as path from 'path';

import BarChart from '../components/BarChart';

const defaultOptions = {
  htmlTemplatePath: path.resolve(__dirname, '../templates/template.pug'),
  styleOptions: {
    file: path.resolve(__dirname, '../templates/template.scss')
  },
  htmlTemplateOptions: {},
  pdfOptions: {
    path: 'pdf-file.pdf',
    // format: 'A4',
    width: '1240',
    height: '1754',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: '<div id="footer-template" style="font-size:10px !important; color:#808080; padding-left:10px"> Page <span class="pageNumber" style="margin-left: auto;"></span><span> of </span> <span class="totalPages"></span> </div>',
    margin: {
      bottom: '50px',
    },
  },
  puppeteerOptions: {
    // ignoreDefaultArgs: ['--disable-gpu']
  },
  dateFormat: 'MMMM Do YYYY, h:mm',
};

module.exports = {
  queue: async (params, options = defaultOptions) => {
    // console.log('options', options);
    const { components, abortWhen } = params;

    const browser = await puppeteer.launch(options.puppeteerOptions);
    const page = await browser.newPage();
    let htmlTemplateOptions = {
      ...options.htmlTemplateOptions
    };
    let renderedTemplate;
    const ignoredComponents = [];

    // This is conditional since the user could get his style in some other way.
    if (options.styleOptions) {
      const compiledStyle = sass.renderSync({
        ...options.styleOptions
      });

      htmlTemplateOptions = {
        ...options.htmlTemplateOptions,
        compiledStyle: compiledStyle.css,
      };
    }

    const anAsyncFunction = async (component) => {
      const buffer = await BarChart(component.subType, component.data);
      return {
        buffer: buffer.toString('base64'),
        title: component.title,
        description: component.description,
      };
    };

    const renderedComponents = await Promise.all(components.map((component, index) => {
      if (component.type === 'chartjs') {
        return anAsyncFunction(component);
        // switch (component.subType) {
        //   case 'bar': return anAsyncFunction(component);
        //   default:
        //     console.log(`Unknown type of chart: ${component.subType}`);
        //     if (abortWhen && abortWhen.unknownComponentType) {
        //       throw new Error(`Unknown type of chart: ${component.subType}`);
        //     }
        //     ignoredComponents.push({
        //       message: `Unknown type of chart: ${component.subType}`,
        //       index
        //     });
        //     return null;
        // }
      }
      console.log(`Unknown type of component: ${component.type}`);
      if (abortWhen && abortWhen.unknownComponentType) {
        throw new Error(`Unknown type of chart: ${component.subType}`);
      }
      ignoredComponents.push({
        message: `Unknown type of component: ${component.type}`,
        index
      });
      return null;
    }));

    if (options.htmlTemplatePath) {
      renderedTemplate = pug.renderFile(options.htmlTemplatePath, {
        ...htmlTemplateOptions,
        components: renderedComponents.filter(item => !!item),
        currentDate: moment().format(options.dateFormat)
      });
    } else {
      throw Error('htmlTemplateFn or htmlTemplatePath must be provided');
    }

    // Make puppeteer render the HTML from data buffer
    await page.setContent(renderedTemplate);

    // console.log('wwwww', await page.content());

    // await page.emulateMedia('screen');
    await page.pdf({
      ...options.pdfOptions
    });
    // await page.screenshot({ path: 'screenshot.png' });

    await browser.close();

    return { ignoredComponents };
  }
};
