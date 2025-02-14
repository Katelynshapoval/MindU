import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2"; // Import the Bar chart component
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
        backgroundColor: [], // This will hold dynamic colors for each bar
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
    const colors = []; // Array to hold colors

    const colorPalette = [
      "#FF6384",
      "#FF9F40",
      "#FFCD56",
      "#4BC0C0",
      "#36A2EB", // predefined colors
      "#FF5733",
      "#C70039",
      "#900C3F",
      "#581845",
      "#DAF7A6", // additional colors
    ];

    Object.keys(resourceCount).forEach((resource, index) => {
      labels.push(`${resource}: ${resourceCount[resource]}`);
      data.push(resourceCount[resource]);
      colors.push(colorPalette[index % colorPalette.length]); // Assign color from the palette
    });

    setChartData({
      labels,
      datasets: [
        {
          label: "Resources Needed",
          data,
          backgroundColor: colors, // Use the generated colors array
          borderWidth: 1,
        },
      ],
    });
  }, [feedbackData]); // Ensure this hook runs when `feedbackData` changes

  return (
    <div className="chart-container" style={{ height: "300px", width: "100%" }}>
      <Bar
        data={chartData}
        options={{
          plugins: {
            title: {
              display: true,
              text: "Número total de respuestas por recurso necesario",
            },
            legend: {
              position: "top",
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "Recursos",
              },
              ticks: {
                // Custom function to break long labels into two lines
                callback: function (value) {
                  const maxLength = 20; // Maximum characters per line
                  if (value.length > maxLength) {
                    return (
                      value.substring(0, maxLength) +
                      "\n" +
                      value.substring(maxLength)
                    );
                  }
                  return value;
                },
                maxRotation: 0, // No rotation, we'll wrap text instead
                minRotation: 0,
              },
              barThickness: 30, // Reduce this value to make the bars thinner
            },
            y: {
              title: {
                display: true,
                text: "Número de respuestas",
              },
              beginAtZero: true, // Start Y-axis at 0
              max: Math.max(3, Math.max(...chartData.datasets[0].data) + 1), // Dynamically limit max to 3 or the max value
              ticks: {
                stepSize: 1, // This ensures the tick marks are integers (no decimals)
                callback: function (value) {
                  // Remove the commas from the number (just display as is)
                  return value.toString(); // This will output the value without commas
                },
              },
            },
          },
          responsive: true, // Make chart responsive
          maintainAspectRatio: false, // Allow resizing the chart
        }}
      />
    </div>
  );
};

export default ResourcesBarChart;
