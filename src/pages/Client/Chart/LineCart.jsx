import React, {useState, useEffect} from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);
// const data = [

//   {
//     "id": 7,
//     "createdAt": "2024-12-28T13:11:40.801Z",
//     "updatedAt": "2024-12-28T13:11:40.801Z",
//     "clientId": 1,
//     "socialMediaPlatformId": 1,
//     "contextId": 1,
//     "date": "2024-12-28T00:00:00.000Z",
//     "metricType": "Followers",
//     "value": 1000,
//     "context": {
//       "id": 1,
//       "createdAt": "2024-12-21T07:03:44.575Z",
//       "updatedAt": "2024-12-23T07:43:49.319Z",
//       "name": "Followers",
//       "status": true
//     }
//   },
//   {
//     "id": 9,
//     "createdAt": "2024-12-28T13:36:55.103Z",
//     "updatedAt": "2024-12-28T13:36:55.103Z",
//     "clientId": 1,
//     "socialMediaPlatformId": 1,
//     "contextId": 1,
//     "date": "2024-03-12T00:00:00.000Z",
//     "metricType": "Followers",
//     "value": 1100,
//     "context": {
//       "id": 1,
//       "createdAt": "2024-12-21T07:03:44.575Z",
//       "updatedAt": "2024-12-23T07:43:49.319Z",
//       "name": "Followers",
//       "status": true
//     }
//   },
//   {
//     "id": 10,
//     "createdAt": "2025-01-11T10:11:52.681Z",
//     "updatedAt": "2025-01-11T10:11:52.681Z",
//     "clientId": 1,
//     "socialMediaPlatformId": 1,
//     "contextId": 2,
//     "date": "2024-12-01T00:00:00.000Z",
//     "metricType": "Engagement",
//     "value": 500,
//     "context": {
//       "id": 2,
//       "createdAt": "2024-12-21T07:03:51.443Z",
//       "updatedAt": "2024-12-23T07:43:44.568Z",
//       "name": "Engagement",
//       "status": true
//     }
//   },
//   {
//     "id": 11,
//     "createdAt": "2025-01-11T10:12:08.676Z",
//     "updatedAt": "2025-01-11T10:12:08.676Z",
//     "clientId": 1,
//     "socialMediaPlatformId": 1,
//     "contextId": 2,
//     "date": "2024-12-05T00:00:00.000Z",
//     "metricType": "Engagement",
//     "value": 1500,
//     "context": {
//       "id": 2,
//       "createdAt": "2024-12-21T07:03:51.443Z",
//       "updatedAt": "2024-12-23T07:43:44.568Z",
//       "name": "Engagement",
//       "status": true
//     }
//   },
//   {
//     "id": 12,
//     "createdAt": "2025-01-11T10:12:24.046Z",
//     "updatedAt": "2025-01-11T10:12:24.046Z",
//     "clientId": 1,
//     "socialMediaPlatformId": 1,
//     "contextId": 2,
//     "date": "2024-12-15T00:00:00.000Z",
//     "metricType": "Engagement",
//     "value": 2000,
//     "context": {
//       "id": 2,
//       "createdAt": "2024-12-21T07:03:51.443Z",
//       "updatedAt": "2024-12-23T07:43:44.568Z",
//       "name": "Engagement",
//       "status": true
//     }
//   },
//   {
//     "id": 13,
//     "createdAt": "2025-01-11T10:12:40.447Z",
//     "updatedAt": "2025-01-11T10:12:40.447Z",
//     "clientId": 1,
//     "socialMediaPlatformId": 1,
//     "contextId": 2,
//     "date": "2024-12-18T00:00:00.000Z",
//     "metricType": "Engagement",
//     "value": 1500,
//     "context": {
//       "id": 2,
//       "createdAt": "2024-12-21T07:03:51.443Z",
//       "updatedAt": "2024-12-23T07:43:44.568Z",
//       "name": "Engagement",
//       "status": true
//     }
//   }

// ];

function getRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgba(${r},${g},${b},1)`;
}

export default function LineCart({ metrics = [] }) {

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    const groupedData = {};

    // Process and group data by metric type
    metrics.forEach(item => {
      const metric = item.context.name;
      if (!groupedData[metric]) {
        groupedData[metric] = [];
      }
      groupedData[metric].push({
        date: new Date(item.date),
        value: item.value,
      });
    });

    // Prepare chart labels (dates) and datasets (values over time)
    const labels = [...new Set(metrics.map(item => item.date))].sort();
    const datasets = Object.keys(groupedData).map(metric => {
      const values = labels.map(date => {
        const metricData = groupedData[metric].find(d => d.date.toISOString().slice(0, 10) === date.slice(0, 10));
        return metricData ? metricData.value : null;
      });

      const trend = values.map((value, index) => {
        if (index === 0) return 0;
        return value > values[index - 1] ? 1 : value < values[index - 1] ? -1 : 0;
      });

      return {
        label: metric,
        data: values,
        fill: false,
        borderColor: getRandomColor,
        tension: 0.1,
      };
    });

    setChartData({
      labels: labels.map(date => new Date(date).toLocaleDateString()),
      datasets: datasets,
    });
  }, [metrics]);

  return (
    <div>
      <h2>Metrics Trend</h2>
      <Line data={chartData} />
    </div>
  );
}