import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

// Register required elements
Chart.register(ArcElement, Tooltip, Legend);

const PieChart = ({ feedbackData }) => {
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
    // Group data by sentiment and school type
    const sentimentSchoolCount = feedbackData.reduce((acc, feedback) => {
      const { sentiment, schoolType } = feedback;

      // If the sentiment doesn't exist in the accumulator, create an entry for it
      if (!acc[sentiment]) {
        acc[sentiment] = {};
      }

      // Count school types within each sentiment
      if (acc[sentiment][schoolType]) {
        acc[sentiment][schoolType]++;
      } else {
        acc[sentiment][schoolType] = 1;
      }

      return acc;
    }, {});

    // Prepare the chart data
    const labels = [];
    const data = [];
    const tooltipDataTemp = [];

    Object.keys(sentimentSchoolCount).forEach((sentiment) => {
      let label = `${sentiment}: `;
      const schools = sentimentSchoolCount[sentiment];
      const schoolLabels = [];
      let count = 0;

      // Loop through the schools within the sentiment
      for (const schoolType in schools) {
        schoolLabels.push(`${schoolType}: ${schools[schoolType]}`);
        count += schools[schoolType];
      }

      labels.push(`${sentiment} (${count})`);
      data.push(count);
      tooltipDataTemp.push(schoolLabels.join(", "));
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
      {/* <h2 style={{ textAlign: "center" }}>
        Distribución por Sentimiento y Tipo de Escuela
      </h2> */}
      <Pie
        data={chartData}
        options={{
          plugins: {
            tooltip: {
              callbacks: {
                label: function (tooltipItem) {
                  const sentimentIndex = tooltipItem.dataIndex;
                  return tooltipData[sentimentIndex] || "";
                },
              },
            },
            title: {
              display: true,
              text: "Número total de respuestas por sentimiento y tipo de escuela",
            },
            legend: {
              position: "right", // Move the legend to the right of the pie chart
              labels: {
                boxWidth: 20, // Adjust the size of the label box
                padding: 10, // Adjust the padding around the label
              },
            },
          },
        }}
      />
    </div>
  );
};

export default PieChart;
