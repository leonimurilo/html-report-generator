import * as pug from 'pug';
import moment from 'moment';
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

    // ===== Create chart from data =====
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
    const buffer = await chartNode.getImageBuffer('image/png');

    // ===== render html template passing the chart as argument =====
    if (options.htmlTemplatePath) {
      renderedTemplate = pug.renderFile(options.htmlTemplatePath, {
        ...htmlTemplateOptions,
        components: [
          {
            buffer: buffer.toString('base64'),
            title: 'Item 1',
            description: `
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur fringilla mi tortor, id porta nisl venenatis vitae. Nulla pulvinar varius neque, eget congue nunc posuere quis. Donec eu lacinia purus, vitae fermentum quam. Proin id lobortis augue, eu tempor diam. Curabitur lacinia elit in mi faucibus, at condimentum ex feugiat. Praesent in arcu porta, lacinia tellus vitae, venenatis felis. In at blandit augue. Quisque ut ligula ex.

Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc volutpat, ligula id euismod efficitur, mauris justo bibendum magna, posuere porttitor velit odio in ex. Etiam congue scelerisque suscipit. Nullam gravida, justo a ullamcorper fringilla, augue magna vehicula eros, eu aliquet ex leo nec quam. Donec aliquet libero quis tellus venenatis tristique. Proin at justo erat. Quisque gravida fermentum justo at rhoncus. Phasellus in mattis neque.

Aenean semper mi sit amet nunc egestas mollis. In ornare maximus mi, id posuere est viverra vel. Praesent nec mattis ipsum. Pellentesque posuere enim et convallis facilisis. Pellentesque lobortis lorem eget rutrum auctor. Pellentesque in dignissim metus. Aliquam sit amet diam id lacus hendrerit dapibus. Nam non tellus sagittis, scelerisque dolor in, iaculis elit. Quisque lacus arcu, molestie id egestas vel, faucibus ut risus.

In tempor nulla eu semper sagittis. Proin nulla nisl, vestibulum sed ligula eget, dictum congue libero. Ut scelerisque dignissim odio, in pellentesque elit facilisis sodales. Pellentesque nibh dolor, condimentum vel ipsum vel, aliquam congue est. Nulla ultricies nunc id ex iaculis efficitur. Proin convallis finibus lacinia. Ut ut sem et nunc congue accumsan. Fusce euismod, massa non cursus sollicitudin, libero velit fermentum quam, eu malesuada purus orci sit amet elit. Morbi tristique augue vel est vestibulum, vitae malesuada odio tincidunt. Quisque in lectus sit amet metus tincidunt hendrerit. Sed eget rutrum metus.`
          },
          {
            buffer: buffer.toString('base64'),
            title: 'Item 2'
          }
        ],
        currentDate: moment().format(options.dateFormat)
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
