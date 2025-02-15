import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

// Register necessary chart.js elements
Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const ResourcesBarChart = ({ feedbackData }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Resources Needed",
        data: [],
        backgroundColor: [],
        borderWidth: 1,
      },
    ],
  });

  useEffect(() => {
    // Count occurrences of each resource
    const resourceCount = feedbackData.reduce((acc, feedback) => {
      feedback.resources.forEach((resource) => {
        acc[resource] = (acc[resource] || 0) + 1;
      });
      return acc;
    }, {});

    const labels = [];
    const data = [];
    const colors = [];

    const colorPalette = [
      "#FF6384",
      "#FF9F40",
      "#FFCD56",
      "#4BC0C0",
      "#36A2EB",
      "#FF5733",
      "#C70039",
      "#900C3F",
      "#581845",
      "#DAF7A6",
    ];

    // Function to wrap text into multiple lines
    const wrapLabel = (label, maxLength = 12) => {
      if (label.length <= maxLength) return [label]; // Short labels stay the same
      const words = label.split(" ");
      const lines = [];
      let line = "";

      words.forEach((word) => {
        if ((line + word).length > maxLength) {
          lines.push(line.trim()); // Push current line
          line = word + " ";
        } else {
          line += word + " ";
        }
      });
      lines.push(line.trim()); // Push the last line
      return lines;
    };

    Object.keys(resourceCount).forEach((resource, index) => {
      labels.push(wrapLabel(resource)); // Apply text wrapping
      data.push(resourceCount[resource]);
      colors.push(colorPalette[index % colorPalette.length]);
    });

    setChartData({
      labels,
      datasets: [
        {
          label: "Resources Needed",
          data,
          backgroundColor: colors,
          borderWidth: 1,
        },
      ],
    });
  }, [feedbackData]);

  return (
    <div
      className="chart-container"
      style={{ height: "250px", width: "500px" }}
    >
      <Bar
        data={chartData}
        options={{
          plugins: {
            title: {
              display: true,
              text: "Número total de respuestas por recurso necesario",
            },
            legend: {
              display: false,
            },
            tooltip: {
              enabled: false,
              callbacks: {
                label: function (tooltipItem) {
                  return ""; // No content shown in tooltip
                },
              },
            },
          },
          scales: {
            x: {
              title: {
                display: false,
                text: "Recursos",
              },
              ticks: {
                autoSkip: false, // Show all labels
                maxRotation: 0, // Keep labels straight
                minRotation: 0,
                callback: function (value, index) {
                  return chartData.labels[index]; // Return the wrapped label as an array
                },
              },
              barThickness: 30,
            },
            y: {
              title: {
                display: true,
                text: "Número de respuestas",
              },
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          },
          responsive: true,
          maintainAspectRatio: false,
        }}
      />
    </div>
  );
};

export default ResourcesBarChart;
