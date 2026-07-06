import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

export interface BarChartImageConfig {
  labels: string[];
  data: number[];
  backgroundColor: string | string[];
  title: string;
}

// PDF, canvas/SVG'yi doğrudan gömemez; grafik bir defalık bir <canvas>'a
// (DOM'a hiç eklenmeden) çizilip PNG'e çevrilir, ardından PDF belgesine
// <Image> olarak yerleştirilir (bkz. AC-009 "Grafikler bozulmaz").
export function renderBarChartToImage(config: BarChartImageConfig): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 320;
    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: config.labels,
        datasets: [{ label: 'Başarı %', data: config.data, backgroundColor: config.backgroundColor }],
      },
      options: {
        responsive: false,
        animation: false,
        plugins: {
          legend: { display: false },
          title: { display: true, text: config.title },
        },
        scales: { y: { min: 0, max: 100 } },
      },
    });

    requestAnimationFrame(() => {
      const image = chart.toBase64Image();
      chart.destroy();
      resolve(image);
    });
  });
}
