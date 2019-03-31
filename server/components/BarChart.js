import ChartjsNode from 'chartjs-node';
import chartOptions from './chartOptions';

const defaultCanvasSize = {
  width: 600,
  height: 600,
};

const barChart = async (canvasSize = defaultCanvasSize, data) => {
  const chartNode = new ChartjsNode(canvasSize.width, canvasSize.height);

  await chartNode.drawChart({ type: 'bar', data, options: chartOptions });

  // asynchronously returns the image buffer
  return chartNode.getImageBuffer('image/png');
};

export default barChart;
