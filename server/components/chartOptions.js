export default {
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
};
