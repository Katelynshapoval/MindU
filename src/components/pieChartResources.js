// pieChart.js
import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

// Register required elements
Chart.register(ArcElement, Tooltip, Legend);

const PieChartResources = ({ feedbackData }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          "#FF6384",
          "#FF9F40",
          "#FFCD56",
          "#4BC0C0",
          "#36A2EB",
        ],
        borderWidth: 1,
      },
    ],
  });

  const [tooltipData, setTooltipData] = useState([]);

  useEffect(() => {
    // Count occurrences of each resource
    const resourceCount = feedbackData.reduce((acc, feedback) => {
      feedback.resources.forEach((resource) => {
        acc[resource] = (acc[resource] || 0) + 1;
      });
      return acc;
    }, {});

    // Prepare the chart data
    const labels = [];
    const data = [];
    const tooltipDataTemp = [];

    Object.keys(resourceCount).forEach((resource) => {
      labels.push(`${resource}: ${resourceCount[resource]}`);
      data.push(resourceCount[resource]);
      tooltipDataTemp.push(
        `${resource}: ${resourceCount[resource]} respuestas`
      );
    });

    // Update the chart data and tooltip data state
    setChartData({
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            "#FF6384",
            "#FF9F40",
            "#FFCD56",
            "#4BC0C0",
            "#36A2EB",
          ],
          borderWidth: 1,
        },
      ],
    });

    setTooltipData(tooltipDataTemp); // Set the tooltip data
  }, [feedbackData]);

  return (
    <div className="chart-container">
      <h2 style={{ textAlign: "center" }}>
        Distribución de Recursos Necesarios
      </h2>
      <Pie
        data={chartData}
        options={{
          plugins: {
            tooltip: {
              callbacks: {
                label: function (tooltipItem) {
                  const resourceIndex = tooltipItem.dataIndex;
                  return tooltipData[resourceIndex] || "";
                },
              },
            },
            title: {
              display: true,
              text: "Número total de respuestas por recurso necesario",
            },
          },
        }}
      />
    </div>
  );
};

export default PieChartResources;
