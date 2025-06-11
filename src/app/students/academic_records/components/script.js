'use client';

import { useEffect } from 'react';
import Chart from 'chart.js/auto';
import { mockGpaData } from '@/app/mockAcademicData';

export function initializeGpaChart() {
  useEffect(() => {
    const gpaChart = document.getElementById('gpaChart');
    if (!gpaChart) return;

    const ctx = gpaChart.getContext('2d');
    
    // Cleanup any existing chart instance
    let chartInstance = Chart.getChart(ctx);
    if (chartInstance) {
      chartInstance.destroy();
    }
    
    // استخدام البيانات الافتراضية
    const gpaData = mockGpaData;
    
    const data = {
        labels: gpaData.labels,
        datasets: [{
            label: 'GPA',
            data: gpaData.data,
            borderColor: '#ffd700',
            backgroundColor: 'rgba(255, 215, 0, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#ffd700',
            pointBorderColor: '#1a1c1e',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
        }]
    };

    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 4,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#888',
                        font: {
                            size: 12
                        },
                        stepSize: 1
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#888',
                        font: {
                            size: 12
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#2a2d30',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        title: function(context) {
                            return 'Semester ' + context[0].label;
                        },
                        label: function(context) {
                            return 'GPA: ' + context.raw;
                        }
                    }
                }
            }
        }
    };

    new Chart(ctx, config);
    
    // Cleanup function to destroy chart when component unmounts
    return () => {
      chartInstance = Chart.getChart(ctx);
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount
}

// React component for the GPA Chart
export default function GpaChart() {
  initializeGpaChart();
  
  return (
    <div className="chart-container">
      <canvas id="gpaChart"></canvas>
    </div>
  );
}