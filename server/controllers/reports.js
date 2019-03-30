import * as pug from 'pug';
import ChartjsNode from 'chartjs-node';
import puppeteer from 'puppeteer';
import * as sass from 'node-sass';
import * as path from 'path';

const defaultOptions = {
  htmlTemplatePath: path.resolve(__dirname, '../templates/template.pug'),
  styleOptions: {
    file: path.resolve(__dirname, '../templates/template.scss')
  },
  htmlTemplateOptions: {},
  pdfOptions: {
    path: 'pdf-file.pdf',
    format: 'A4',
    printBackground: true
  },
  puppeteerOptions: {
    // ignoreDefaultArgs: ['--disable-gpu']
  }
};

module.exports = {
  queue: async (options = defaultOptions) => {
    // console.log('options', options);

    const browser = await puppeteer.launch(options.puppeteerOptions);
    const page = await browser.newPage();
    let htmlTemplateOptions = {
      ...options.htmlTemplateOptions
    };
    let renderedTemplate;

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

    const chartNode = new ChartjsNode(600, 600);
    const chartJsOptions = {
      type: 'bar',
      data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
          label: '# of Votes',
          data: [12, 19, 3, 5, 2, 3],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
          ],
          borderColor: [
            'rgba(255,99,132,1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: false,
        animation: false,
        chartArea: {
          backgroundColor: '#fff',
        },
        plugins: {
          beforeDraw: (chart) => {
            const { ctx } = chart.chart;
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, chart.chart.width, chart.chart.height);
          }
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        },
      }
    };
    await chartNode.drawChart(chartJsOptions);
    const buffer = await chartNode.getImageBuffer('image/jpg');

    // await chartNode.writeImageToFile('image/png', './testimage.png');

    if (options.htmlTemplatePath) {
      renderedTemplate = pug.renderFile(options.htmlTemplatePath, {
        ...htmlTemplateOptions,
        buffer: buffer.toString('base64'),
        name: 'oiii'
      });
    } else {
      throw Error('htmlTemplateFn or htmlTemplatePath must be provided');
    }

    // Make puppeteer render the HTML from data buffer
    await page.setContent(renderedTemplate);

    // console.log('wwwww', await page.content());

    // await page.emulateMedia('screen');
    const pdfBuffer = await page.pdf({
      ...options.pdfOptions
    });
    // await page.screenshot({ path: 'screenshot.png' });

    await browser.close();

    return pdfBuffer;
  }
};
