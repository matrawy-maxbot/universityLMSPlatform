'use client';

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

// Sample data structure for testing
const sampleData = [
  {
      id: 1,
      name: "John Doe",
      gender: "male",
      department: "Computer Science",
      cumulativeGPA: 3.5,
      courses: [
          { code: "CS101", grade: 3.7, attempts: 1, semester: "Fall 2023" },
          { code: "CS102", grade: 3.5, attempts: 1, semester: "Fall 2023" },
          { code: "MATH101", grade: 2.8, attempts: 2, semester: "Spring 2023" }
      ]
  },
  {
      id: 2,
      name: "Jane Smith",
      gender: "female",
      department: "Information Systems",
      cumulativeGPA: 3.8,
      courses: [
          { code: "IS101", grade: 4.0, attempts: 1, semester: "Fall 2023" },
          { code: "CS101", grade: 3.5, attempts: 1, semester: "Fall 2023" },
          { code: "MATH101", grade: 3.7, attempts: 1, semester: "Spring 2023" }
      ]
  },
  {
      id: 3,
      name: "Mike Johnson",
      gender: "male",
      department: "Information Technology",
      cumulativeGPA: 2.9,
      courses: [
          { code: "IT101", grade: 3.0, attempts: 1, semester: "Fall 2023" },
          { code: "CS101", grade: 2.5, attempts: 2, semester: "Spring 2023" },
          { code: "MATH101", grade: 3.2, attempts: 1, semester: "Fall 2023" }
      ]
  },
  {
      id: 4,
      name: "Sarah Williams",
      gender: "female",
      department: "Artificial Intelligence",
      cumulativeGPA: 3.9,
      courses: [
          { code: "AI101", grade: 4.0, attempts: 1, semester: "Fall 2023" },
          { code: "CS101", grade: 3.8, attempts: 1, semester: "Fall 2023" },
          { code: "MATH101", grade: 3.9, attempts: 1, semester: "Spring 2023" }
      ]
  },
  {
      id: 5,
      name: "David Brown",
      gender: "male",
      department: "Software Systems",
      cumulativeGPA: 3.2,
      courses: [
          { code: "SW101", grade: 3.5, attempts: 1, semester: "Fall 2023" },
          { code: "CS101", grade: 3.0, attempts: 1, semester: "Fall 2023" },
          { code: "MATH101", grade: 3.1, attempts: 1, semester: "Spring 2023" }
      ]
  },
  {
      id: 6,
      name: "Emily Davis",
      gender: "female",
      department: "Computer Science",
      cumulativeGPA: 3.6,
      courses: [
          { code: "CS101", grade: 3.8, attempts: 1, semester: "Fall 2023" },
          { code: "CS102", grade: 3.5, attempts: 1, semester: "Fall 2023" },
          { code: "MATH101", grade: 3.5, attempts: 1, semester: "Spring 2023" }
      ]
  },
  {
      id: 7,
      name: "Robert Wilson",
      gender: "male",
      department: "Information Systems",
      cumulativeGPA: 2.8,
      courses: [
          { code: "IS101", grade: 2.5, attempts: 2, semester: "Fall 2023" },
          { code: "CS101", grade: 3.0, attempts: 1, semester: "Fall 2023" },
          { code: "MATH101", grade: 2.9, attempts: 1, semester: "Spring 2023" }
      ]
  },
  {
      id: 8,
      name: "Lisa Anderson",
      gender: "female",
      department: "Information Technology",
      cumulativeGPA: 3.7,
      courses: [
          { code: "IT101", grade: 3.8, attempts: 1, semester: "Fall 2023" },
          { code: "CS101", grade: 3.6, attempts: 1, semester: "Fall 2023" },
          { code: "MATH101", grade: 3.7, attempts: 1, semester: "Spring 2023" }
      ]
  },
  {
      id: 9,
      name: "James Taylor",
      gender: "male",
      department: "Artificial Intelligence",
      cumulativeGPA: 3.4,
      courses: [
          { code: "AI101", grade: 3.5, attempts: 1, semester: "Fall 2023" },
          { code: "CS101", grade: 3.3, attempts: 1, semester: "Fall 2023" },
          { code: "MATH101", grade: 3.4, attempts: 1, semester: "Spring 2023" }
      ]
  },
  {
      id: 10,
      name: "Mary Martinez",
      gender: "female",
      department: "Software Systems",
      cumulativeGPA: 3.1,
      courses: [
          { code: "SW101", grade: 3.2, attempts: 1, semester: "Fall 2023" },
          { code: "CS101", grade: 3.0, attempts: 1, semester: "Fall 2023" },
          { code: "MATH101", grade: 3.1, attempts: 1, semester: "Spring 2023" }
      ]
  },
  {
      id: 11,
      name: "Ahmed Hassan",
      gender: "male",
      department: "Computer Science",
      cumulativeGPA: 3.3,
      courses: [
          { code: "CS101", grade: 3.4, attempts: 1, semester: "Fall 2023" },
          { code: "CS102", grade: 3.2, attempts: 1, semester: "Fall 2023" },
          { code: "MATH101", grade: 3.3, attempts: 1, semester: "Spring 2023" }
      ]
  },
  {
      id: 12,
      name: "Fatima Ali",
      gender: "female",
      department: "Information Systems",
      cumulativeGPA: 3.9,
      courses: [
          { code: "IS101", grade: 4.0, attempts: 1, semester: "Fall 2023" },
          { code: "CS101", grade: 3.8, attempts: 1, semester: "Fall 2023" },
          { code: "MATH101", grade: 3.9, attempts: 1, semester: "Spring 2023" }
      ]
  },
  {
      id: 13,
      name: "Mohammed Ahmed",
      gender: "male",
      department: "Information Technology",
      cumulativeGPA: 2.7,
      courses: [
          { code: "IT101", grade: 2.8, attempts: 2, semester: "Fall 2023" },
          { code: "CS101", grade: 2.5, attempts: 2, semester: "Spring 2023" },
          { code: "MATH101", grade: 2.8, attempts: 1, semester: "Fall 2023" }
      ]
  },
  {
      id: 14,
      name: "Aisha Rahman",
      gender: "female",
      department: "Artificial Intelligence",
      cumulativeGPA: 3.8,
      courses: [
          { code: "AI101", grade: 3.9, attempts: 1, semester: "Fall 2023" },
          { code: "CS101", grade: 3.7, attempts: 1, semester: "Fall 2023" },
          { code: "MATH101", grade: 3.8, attempts: 1, semester: "Spring 2023" }
      ]
  },
  {
      id: 15,
      name: "Omar Khalil",
      gender: "male",
      department: "Software Systems",
      cumulativeGPA: 3.0,
      courses: [
          { code: "SW101", grade: 3.1, attempts: 1, semester: "Fall 2023" },
          { code: "CS101", grade: 2.9, attempts: 1, semester: "Fall 2023" },
          { code: "MATH101", grade: 3.0, attempts: 1, semester: "Spring 2023" }
      ]
  },
  {
      id: 16,
      name: "Nour Ibrahim",
      gender: "female",
      department: "Computer Science",
      cumulativeGPA: 3.7,
      courses: [
          { code: "CS101", grade: 3.8, attempts: 1, semester: "Fall 2023" },
          { code: "CS102", grade: 3.6, attempts: 1, semester: "Fall 2023" },
          { code: "MATH101", grade: 3.7, attempts: 1, semester: "Spring 2023" }
      ]
  },
  {
      id: 17,
      name: "Youssef Samir",
      gender: "male",
      department: "Information Systems",
      cumulativeGPA: 2.9,
      courses: [
          { code: "IS101", grade: 3.0, attempts: 2, semester: "Fall 2023" },
          { code: "CS101", grade: 2.8, attempts: 1, semester: "Fall 2023" },
          { code: "MATH101", grade: 2.9, attempts: 1, semester: "Spring 2023" }
      ]
  },
  {
      id: 18,
      name: "Layla Karim",
      gender: "female",
      department: "Information Technology",
      cumulativeGPA: 3.6,
      courses: [
          { code: "IT101", grade: 3.7, attempts: 1, semester: "Fall 2023" },
          { code: "CS101", grade: 3.5, attempts: 1, semester: "Fall 2023" },
          { code: "MATH101", grade: 3.6, attempts: 1, semester: "Spring 2023" }
      ]
  },
  {
      id: 19,
      name: "Ziad Tarek",
      gender: "male",
      department: "Artificial Intelligence",
      cumulativeGPA: 3.2,
      courses: [
          { code: "AI101", grade: 3.3, attempts: 1, semester: "Fall 2023" },
          { code: "CS101", grade: 3.1, attempts: 1, semester: "Fall 2023" },
          { code: "MATH101", grade: 3.2, attempts: 1, semester: "Spring 2023" }
      ]
  },
  {
      id: 20,
      name: "Mariam Adel",
      gender: "female",
      department: "Software Systems",
      cumulativeGPA: 3.4,
      courses: [
          { code: "SW101", grade: 3.5, attempts: 1, semester: "Fall 2023" },
          { code: "CS101", grade: 3.3, attempts: 1, semester: "Fall 2023" },
          { code: "MATH101", grade: 3.4, attempts: 1, semester: "Spring 2023" }
      ]
  },
  {
      id: 21,
      name: "Khaled Samy",
      gender: "male",
      department: "Computer Science",
      cumulativeGPA: 2.3,
      courses: [
          { code: "CS101", grade: 2.2, attempts: 2, semester: "Fall 2023" },
          { code: "CS102", grade: 2.4, attempts: 1, semester: "Fall 2023" },
          { code: "MATH101", grade: 2.3, attempts: 2, semester: "Spring 2023" }
      ]
  },
  {
      id: 22,
      name: "Heba Mostafa",
      gender: "female",
      department: "Information Systems",
      cumulativeGPA: 2.1,
      courses: [
          { code: "IS101", grade: 2.0, attempts: 2, semester: "Fall 2023" },
          { code: "CS101", grade: 2.1, attempts: 2, semester: "Fall 2023" },
          { code: "MATH101", grade: 2.2, attempts: 1, semester: "Spring 2023" }
      ]
  },
  {
      id: 23,
      name: "Amr Tarek",
      gender: "male",
      department: "Information Technology",
      cumulativeGPA: 1.8,
      courses: [
          { code: "IT101", grade: 1.7, attempts: 2, semester: "Fall 2023" },
          { code: "CS101", grade: 1.8, attempts: 2, semester: "Fall 2023" },
          { code: "MATH101", grade: 1.9, attempts: 2, semester: "Spring 2023" }
      ]
  },
  {
      id: 24,
      name: "Nada Hisham",
      gender: "female",
      department: "Artificial Intelligence",
      cumulativeGPA: 2.4,
      courses: [
          { code: "AI101", grade: 2.3, attempts: 1, semester: "Fall 2023" },
          { code: "CS101", grade: 2.4, attempts: 2, semester: "Fall 2023" },
          { code: "MATH101", grade: 2.5, attempts: 1, semester: "Spring 2023" }
      ]
  },
  {
      id: 25,
      name: "Waleed Karim",
      gender: "male",
      department: "Software Systems",
      cumulativeGPA: 1.9,
      courses: [
          { code: "SW101", grade: 1.8, attempts: 2, semester: "Fall 2023" },
          { code: "CS101", grade: 1.9, attempts: 2, semester: "Fall 2023" },
          { code: "MATH101", grade: 2.0, attempts: 2, semester: "Spring 2023" }
      ]
  },
  {
      id: 26,
      name: "Rania Adel",
      gender: "female",
      department: "Computer Science",
      cumulativeGPA: 2.2,
      courses: [
          { code: "CS101", grade: 2.1, attempts: 2, semester: "Fall 2023" },
          { code: "CS102", grade: 2.2, attempts: 1, semester: "Fall 2023" },
          { code: "MATH101", grade: 2.3, attempts: 2, semester: "Spring 2023" }
      ]
  },
  {
      id: 27,
      name: "Hassan Ali",
      gender: "male",
      department: "Information Systems",
      cumulativeGPA: 1.7,
      courses: [
          { code: "IS101", grade: 1.6, attempts: 2, semester: "Fall 2023" },
          { code: "CS101", grade: 1.7, attempts: 2, semester: "Fall 2023" },
          { code: "MATH101", grade: 1.8, attempts: 2, semester: "Spring 2023" }
      ]
  },
  {
      id: 28,
      name: "Dina Samir",
      gender: "female",
      department: "Information Technology",
      cumulativeGPA: 2.5,
      courses: [
          { code: "IT101", grade: 2.4, attempts: 1, semester: "Fall 2023" },
          { code: "CS101", grade: 2.5, attempts: 2, semester: "Fall 2023" },
          { code: "MATH101", grade: 2.6, attempts: 1, semester: "Spring 2023" }
      ]
  },
  {
      id: 29,
      name: "Tarek Mohamed",
      gender: "male",
      department: "Artificial Intelligence",
      cumulativeGPA: 1.6,
      courses: [
          { code: "AI101", grade: 1.5, attempts: 2, semester: "Fall 2023" },
          { code: "CS101", grade: 1.6, attempts: 2, semester: "Fall 2023" },
          { code: "MATH101", grade: 1.7, attempts: 2, semester: "Spring 2023" }
      ]
  },
  {
      id: 30,
      name: "Salma Ahmed",
      gender: "female",
      department: "Software Systems",
      cumulativeGPA: 2.0,
      courses: [
          { code: "SW101", grade: 1.9, attempts: 2, semester: "Fall 2023" },
          { code: "CS101", grade: 2.0, attempts: 2, semester: "Fall 2023" },
          { code: "MATH101", grade: 2.1, attempts: 2, semester: "Spring 2023" }
      ]
  }
];

// Helper function to safely create a new chart
function createChart(ctx, config) {
  if (!ctx) {
    console.warn('Chart context is not available');
    return null;
  }
  
  try {
    // Destroy existing chart if it exists
    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
      existingChart.destroy();
    }
    
    return new Chart(ctx, config);
  } catch (error) {
    console.error('Failed to create chart:', error);
    return null;
  }
}

// Gender GPA Analysis
function analyzeGenderGPAs(data) {
  const genderGPAChart = document.getElementById('genderGPAChart');
  if (genderGPAChart) {
    const genderStats = {
      male: { total: 0, count: 0 },
      female: { total: 0, count: 0 }
    };

    data.forEach(student => {
      const gender = student.gender.toLowerCase();
      if (genderStats[gender]) {
        genderStats[gender].total += student.cumulativeGPA;
        genderStats[gender].count++;
      }
    });

    const maleAvg = genderStats.male.count ? (genderStats.male.total / genderStats.male.count).toFixed(2) : 0;
    const femaleAvg = genderStats.female.count ? (genderStats.female.total / genderStats.female.count).toFixed(2) : 0;

    // Update the stats display
    document.querySelector('.male-count').textContent = genderStats.male.count;
    document.querySelector('.male-gpa').textContent = maleAvg;
    document.querySelector('.female-count').textContent = genderStats.female.count;
    document.querySelector('.female-gpa').textContent = femaleAvg;

    createChart(genderGPAChart, {
      type: 'bar',
      data: {
        labels: ['Male', 'Female'],
        datasets: [{
          label: 'Average GPA',
          data: [maleAvg, femaleAvg],
          backgroundColor: [
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 99, 132, 0.5)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 4.0
          }
        }
      }
    });
  }
}

// Course Retake Analysis
function analyzeCourseRetakes(data) {
  const courseRetakeStats = {};
  
  // Process all courses from all students
  data.forEach(student => {
    student.courses.forEach(course => {
      if (!courseRetakeStats[course.code]) {
        courseRetakeStats[course.code] = {
          totalStudents: 0,
          totalAttempts: 0,
          firstAttemptPass: 0,
          retakeCount: 0,
          averageGrade: 0,
          totalGrade: 0,
          improvementCount: 0,
          declineCount: 0
        };
      }
      
      const stats = courseRetakeStats[course.code];
      stats.totalStudents++;
      stats.totalAttempts += course.attempts;
      stats.totalGrade += course.grade;
      
      if (course.attempts === 1) {
        stats.firstAttemptPass++;
      } else {
        stats.retakeCount++;
      }
    });
  });

  // Calculate averages and prepare data for chart
  const courseLabels = [];
  const retakeRates = [];
  const firstAttemptRates = [];
  const improvementRates = [];

  Object.entries(courseRetakeStats).forEach(([code, stats]) => {
    courseLabels.push(code);
    const retakeRate = (stats.retakeCount / stats.totalStudents) * 100;
    const firstAttemptRate = (stats.firstAttemptPass / stats.totalStudents) * 100;
    const avgGrade = stats.totalGrade / stats.totalAttempts;
    
    retakeRates.push(retakeRate);
    firstAttemptRates.push(firstAttemptRate);
    improvementRates.push(avgGrade);
  });

  // Create the chart
  const ctx = document.getElementById('courseRetakeChart');
  if (!ctx) return;

  const existingChart = Chart.getChart(ctx);
  if (existingChart) {
    existingChart.destroy();
  }

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: courseLabels,
      datasets: [
        {
          label: 'Course Retake Rate',
          data: retakeRates,
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        },
        {
          label: 'First Attempt Success Rate',
          data: firstAttemptRates,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Percentage'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Course Code'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Course Retake Analysis'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.raw.toFixed(1)}%`;
            }
          }
        }
      }
    }
  });

  // Update the retake statistics
  const mostRetakenCourse = Object.entries(courseRetakeStats)
    .reduce((most, [code, stats]) => {
      const retakeRate = (stats.retakeCount / stats.totalStudents) * 100;
      return retakeRate > most.retakeRate ? { code, retakeRate } : most;
    }, { code: '', retakeRate: 0 });

  const bestFirstAttemptCourse = Object.entries(courseRetakeStats)
    .reduce((best, [code, stats]) => {
      const firstAttemptRate = (stats.firstAttemptPass / stats.totalStudents) * 100;
      return firstAttemptRate > best.firstAttemptRate ? { code, firstAttemptRate } : best;
    }, { code: '', firstAttemptRate: 0 });

  // Update DOM elements
  const mostRetakenList = document.querySelector('.most-retaken-list');
  const bestFirstAttemptList = document.querySelector('.best-first-attempt-list');

  if (mostRetakenList) {
    mostRetakenList.innerHTML = `
      <li>
        <span class="course-code">${mostRetakenCourse.code}</span>
        <span class="retake-rate">${mostRetakenCourse.retakeRate.toFixed(1)}%</span>
      </li>
    `;
  }

  if (bestFirstAttemptList) {
    bestFirstAttemptList.innerHTML = `
      <li>
        <span class="course-code">${bestFirstAttemptCourse.code}</span>
        <span class="first-attempt-rate">${bestFirstAttemptCourse.firstAttemptRate.toFixed(1)}%</span>
      </li>
    `;
  }
}

// Department Distribution Analysis
function analyzeDepartmentDistribution(data) {
  // Analyze student distribution across departments
  const departmentStats = {
    'Computer Science': { count: 0, gpa: 0, gender: { male: 0, female: 0 } },
    'Information Systems': { count: 0, gpa: 0, gender: { male: 0, female: 0 } },
    'Information Technology': { count: 0, gpa: 0, gender: { male: 0, female: 0 } },
    'Artificial Intelligence': { count: 0, gpa: 0, gender: { male: 0, female: 0 } },
    'Software Systems': { count: 0, gpa: 0, gender: { male: 0, female: 0 } }
  };

  // Collect data
  data.forEach(student => {
    const dept = student.department;
    if (departmentStats[dept]) {
      departmentStats[dept].count++;
      departmentStats[dept].gpa += student.cumulativeGPA;
      departmentStats[dept].gender[student.gender.toLowerCase()]++;
    }
  });

  // Calculate averages and prepare data for chart
  const labels = [];
  const counts = [];
  const gpas = [];
  const maleCounts = [];
  const femaleCounts = [];

  Object.entries(departmentStats).forEach(([dept, stats]) => {
    labels.push(dept);
    counts.push(stats.count);
    gpas.push(stats.gpa / stats.count);
    maleCounts.push(stats.gender.male);
    femaleCounts.push(stats.gender.female);
  });

  // Create chart
  const ctx = document.getElementById('departmentDistributionChart');
  if (!ctx) return;

  const existingChart = Chart.getChart(ctx);
  if (existingChart) {
    existingChart.destroy();
  }

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: counts,
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Student Distribution by Department',
          font: {
            size: 16
          }
        },
        legend: {
          position: 'right',
          labels: {
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              const dept = departmentStats[label];
              const avgGPA = (dept.gpa / dept.count).toFixed(2);
              return `${label}: ${value} students (${percentage}%) | GPA: ${avgGPA}`;
            }
          }
        }
      }
    }
  });

  // Update department statistics
  Object.entries(departmentStats).forEach(([dept, stats]) => {
    const deptElement = document.querySelector(`.department-stat.${dept.toLowerCase().replace(/\s+/g, '-')}`);
    if (deptElement) {
      const valueElement = deptElement.querySelector('.dept-value');
      if (valueElement) {
        const avgGPA = (stats.gpa / stats.count).toFixed(2);
        valueElement.innerHTML = `${stats.count} students <br> GPA: ${avgGPA}`;
      }
    }
  });
}

// GPA Trend Analysis
function analyzeGPATrends(data) {
  // تحليل اتجاهات المعدل التراكمي للطلاب
  const gpaTrends = {
    improving: 0,
    declining: 0,
    stable: 0,
    semesterData: {}
  };

  // تحليل كل طالب
  data.forEach(student => {
    const semesterGPAs = {};
    
    // تجميع درجات المواد حسب الفصل الدراسي
    student.courses.forEach(course => {
      if (!semesterGPAs[course.semester]) {
        semesterGPAs[course.semester] = {
          totalGrade: 0,
          courseCount: 0
        };
      }
      semesterGPAs[course.semester].totalGrade += course.grade;
      semesterGPAs[course.semester].courseCount++;
    });

    // حساب متوسط المعدل لكل فصل دراسي
    const semesterAverages = Object.entries(semesterGPAs).map(([semester, data]) => ({
      semester,
      average: data.totalGrade / data.courseCount
    }));

    // تحديد اتجاه المعدل التراكمي
    if (semesterAverages.length >= 2) {
      const firstSemester = semesterAverages[0].average;
      const lastSemester = semesterAverages[semesterAverages.length - 1].average;
      const difference = lastSemester - firstSemester;

      if (difference > 0.3) {
        gpaTrends.improving++;
      } else if (difference < -0.3) {
        gpaTrends.declining++;
      } else {
        gpaTrends.stable++;
      }

      // تجميع بيانات الفصول الدراسية
      semesterAverages.forEach(({ semester, average }) => {
        if (!gpaTrends.semesterData[semester]) {
          gpaTrends.semesterData[semester] = {
            totalGPA: 0,
            studentCount: 0
          };
        }
        gpaTrends.semesterData[semester].totalGPA += average;
        gpaTrends.semesterData[semester].studentCount++;
      });
    }
  });

  // حساب متوسط المعدل لكل فصل دراسي
  const semesterLabels = [];
  const semesterAverages = [];
  
  Object.entries(gpaTrends.semesterData)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([semester, data]) => {
      semesterLabels.push(semester);
      semesterAverages.push(data.totalGPA / data.studentCount);
    });

  // إنشاء الرسم البياني
  const ctx = document.getElementById('gpaTrendChart');
  if (!ctx) return;

  const existingChart = Chart.getChart(ctx);
  if (existingChart) {
    existingChart.destroy();
  }

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: semesterLabels,
      datasets: [{
        label: 'Cumulative GPA',
        data: semesterAverages,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 4.0,
          title: {
            display: true,
            text: 'Cumulative GPA'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Semester'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'GPA Trend Analysis',
          font: {
            size: 16
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.parsed.y.toFixed(2);
              const semester = context.label;
              const studentCount = gpaTrends.semesterData[semester].studentCount;
              return `المعدل: ${value} | عدد الطلاب: ${studentCount}`;
            }
          }
        }
      }
    }
  });

  // تحديث إحصائيات الاتجاهات
  const totalStudents = gpaTrends.improving + gpaTrends.declining + gpaTrends.stable;
  const improvingPercent = (gpaTrends.improving / totalStudents) * 100;
  const decliningPercent = (gpaTrends.declining / totalStudents) * 100;
  const stablePercent = (gpaTrends.stable / totalStudents) * 100;

  // تحديث عناصر DOM
  const improvingCount = document.querySelector('.improving-count');
  const decliningCount = document.querySelector('.declining-count');
  const stableCount = document.querySelector('.stable-count');
  const improvingPercentElement = document.querySelector('.improving-percent');
  const decliningPercentElement = document.querySelector('.declining-percent');
  const stablePercentElement = document.querySelector('.stable-percent');

  if (improvingCount) improvingCount.textContent = gpaTrends.improving;
  if (decliningCount) decliningCount.textContent = gpaTrends.declining;
  if (stableCount) stableCount.textContent = gpaTrends.stable;
  if (improvingPercentElement) improvingPercentElement.textContent = `${improvingPercent.toFixed(1)}%`;
  if (decliningPercentElement) decliningPercentElement.textContent = `${decliningPercent.toFixed(1)}%`;
  if (stablePercentElement) stablePercentElement.textContent = `${stablePercent.toFixed(1)}%`;
}

// Overall Performance Analysis
function analyzeOverallPerformance(data) {
  // Calculate total students
  const totalStudents = data.length;
  
  // Calculate students who completed 104+ hours
  const completedHours = data.filter(student => {
    const totalHours = student.courses.reduce((sum, course) => sum + (course.creditHours || 3), 0);
    return totalHours >= 104;
  }).length;
  
  // Update the display
  const totalStudentsElement = document.getElementById('totalStudentsValue');
  const completedHoursElement = document.getElementById('completedHoursValue');
  
  if (totalStudentsElement) totalStudentsElement.textContent = totalStudents;
  if (completedHoursElement) completedHoursElement.textContent = completedHours;
  
  // Create student analytics chart using Chart.js
  const studentAnalyticsDiv = document.getElementById('studentAnalyticsChart');
  if (!studentAnalyticsDiv) return;
  
  // Create a canvas element for Chart.js
  const canvas = document.createElement('canvas');
  studentAnalyticsDiv.innerHTML = '';
  studentAnalyticsDiv.appendChild(canvas);
  
  // Prepare data for the chart
  const chartData = {
    labels: ['Total Students', 'Completed 104+ Hours', 'Remaining Students'],
    datasets: [{
      label: 'Student Statistics',
      data: [totalStudents, completedHours, totalStudents - completedHours],
      backgroundColor: [
        'rgba(54, 162, 235, 0.5)',
        'rgba(75, 192, 192, 0.5)',
        'rgba(255, 159, 64, 0.5)'
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(255, 159, 64, 1)'
      ],
      borderWidth: 1
    }]
  };
  
  // Create the chart
  new Chart(canvas, {
    type: 'bar',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.raw}`;
            }
          }
        }
      }
    }
  });
}

// Course Performance Analysis
function analyzeCoursePerformance(data) {
  const courseStats = {};
  
  // Process all courses from all students
  data.forEach(student => {
    student.courses.forEach(course => {
      if (!courseStats[course.code]) {
        courseStats[course.code] = {
          totalStudents: 0,
          totalGrade: 0,
          passCount: 0,
          failCount: 0,
          attempts: 0,
          highestGrade: 0,
          lowestGrade: 4.0
        };
      }
      
      const stats = courseStats[course.code];
      stats.totalStudents++;
      stats.totalGrade += course.grade;
      stats.attempts += course.attempts;
      
      if (course.grade >= 2.0) {
        stats.passCount++;
      } else {
        stats.failCount++;
      }
      
      stats.highestGrade = Math.max(stats.highestGrade, course.grade);
      stats.lowestGrade = Math.min(stats.lowestGrade, course.grade);
    });
  });

  // Calculate averages and prepare data for chart
  const courseLabels = [];
  const passRates = [];
  const failRates = [];
  const avgGrades = [];

  Object.entries(courseStats).forEach(([code, stats]) => {
    courseLabels.push(code);
    const passRate = (stats.passCount / stats.totalStudents) * 100;
    const failRate = (stats.failCount / stats.totalStudents) * 100;
    const avgGrade = stats.totalGrade / stats.totalStudents;
    
    passRates.push(passRate);
    failRates.push(failRate);
    avgGrades.push(avgGrade);
  });

  // Create the chart
  const ctx = document.getElementById('coursePerformanceChart');
  if (!ctx) return;

  const existingChart = Chart.getChart(ctx);
  if (existingChart) {
    existingChart.destroy();
  }

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: courseLabels,
      datasets: [
        {
          label: 'Success Rate',
          data: passRates,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        },
        {
          label: 'Failure Rate',
          data: failRates,
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: 'Percentage'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Course Code'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Course Performance Analysis',
          font: {
            size: 16
          }
        },
        legend: {
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.dataset.label || '';
              const value = context.parsed.y.toFixed(1);
              const courseCode = context.label;
              const stats = courseStats[courseCode];
              const avgGrade = (stats.totalGrade / stats.totalStudents).toFixed(2);
              return `${label}: ${value}% | المعدل: ${avgGrade} | عدد الطلاب: ${stats.totalStudents}`;
            }
          }
        }
      }
    }
  });

  // Update the performance summary
  const bestCourse = Object.entries(courseStats)
    .reduce((best, [code, stats]) => {
      const passRate = (stats.passCount / stats.totalStudents) * 100;
      return passRate > best.passRate ? { code, passRate } : best;
    }, { code: '', passRate: 0 });

  const worstCourse = Object.entries(courseStats)
    .reduce((worst, [code, stats]) => {
      const passRate = (stats.passCount / stats.totalStudents) * 100;
      return passRate < worst.passRate ? { code, passRate } : worst;
    }, { code: '', passRate: 100 });

  // Update DOM elements
  const bestCourseElement = document.querySelector('.best-course .summary-value');
  const bestCourseStatElement = document.querySelector('.best-course .summary-stat');
  const worstCourseElement = document.querySelector('.worst-course .summary-value');
  const worstCourseStatElement = document.querySelector('.worst-course .summary-stat');

  if (bestCourseElement) bestCourseElement.textContent = bestCourse.code;
  if (bestCourseStatElement) bestCourseStatElement.textContent = `${bestCourse.passRate.toFixed(1)}% Success Rate`;
  if (worstCourseElement) worstCourseElement.textContent = worstCourse.code;
  if (worstCourseStatElement) worstCourseStatElement.textContent = `${worstCourse.passRate.toFixed(1)}% Success Rate`;
}

// GPA Distribution Analysis
function analyzeGPADistribution(data) {
  const ctx = document.getElementById('gpaDistributionChart');
  if (!ctx) return;

  // تجميع البيانات
  const gpaRanges = {
    '4.0-3.5': { count: 0, students: [] },
    '3.4-3.0': { count: 0, students: [] },
    '2.9-2.5': { count: 0, students: [] },
    '2.4-2.0': { count: 0, students: [] },
    'أقل من 2.0': { count: 0, students: [] }
  };

  // تصنيف الطلاب حسب المعدل التراكمي
  data.forEach(student => {
    const gpa = student.cumulativeGPA;
    if (gpa >= 3.5) {
      gpaRanges['4.0-3.5'].count++;
      gpaRanges['4.0-3.5'].students.push(student);
    } else if (gpa >= 3.0) {
      gpaRanges['3.4-3.0'].count++;
      gpaRanges['3.4-3.0'].students.push(student);
    } else if (gpa >= 2.5) {
      gpaRanges['2.9-2.5'].count++;
      gpaRanges['2.9-2.5'].students.push(student);
    } else if (gpa >= 2.0) {
      gpaRanges['2.4-2.0'].count++;
      gpaRanges['2.4-2.0'].students.push(student);
    } else {
      gpaRanges['أقل من 2.0'].count++;
      gpaRanges['أقل من 2.0'].students.push(student);
    }
  });

  // إعداد بيانات الرسم البياني
  const chartData = Object.entries(gpaRanges).map(([range, info]) => ({
    name: range,
    value: info.count,
    students: info.students
  }));

  // إنشاء الرسم البياني
  const chartContainer = document.getElementById('gpaDistributionChart');
  if (chartContainer) {
    // Clear any existing content
    chartContainer.innerHTML = '';
    
    // Create the chart using Chart.js instead of Recharts
    createChart(chartContainer, {
      type: 'bar',
      data: {
        labels: chartData.map(item => item.name),
        datasets: [{
          label: 'عدد الطلاب',
          data: chartData.map(item => item.value),
          backgroundColor: [
            'rgba(75, 192, 192, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(153, 102, 255, 0.5)',
            'rgba(255, 159, 64, 0.5)',
            'rgba(255, 99, 132, 0.5)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'عدد الطلاب'
            }
          },
          x: {
            title: {
              display: true,
              text: 'نطاق المعدل التراكمي'
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return `عدد الطلاب: ${context.raw}`;
              }
            }
          }
        }
      }
    });
  }

  // تحديث ملخص التوزيع
  const distributionSummary = document.querySelector('.gpa-distribution .stats-summary');
  if (distributionSummary) {
    const highestRange = chartData.reduce((a, b) => a.value > b.value ? a : b);
    const lowestRange = chartData.reduce((a, b) => a.value < b.value ? a : b);
    
    distributionSummary.innerHTML = `
      <div class="stat-item">
        <span class="stat-label">الفئة الأعلى:</span>
        <span class="stat-value">${highestRange.name} (${highestRange.value} طالب)</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">الفئة الأقل:</span>
        <span class="stat-value">${lowestRange.name} (${lowestRange.value} طالب)</span>
      </div>
    `;
  }
}

// Update the main analysis function
function analyzeData(data) {
  // Existing analysis functions
  analyzeOverallPerformance(data);
  analyzeCoursePerformance(data);
  analyzeGPADistribution(data);

  // New analysis functions
  analyzeGenderGPAs(data);
  analyzeCourseRetakes(data);
  analyzeDepartmentDistribution(data);
  analyzeGPATrends(data);
}

export default function AnalyticsDashboard() {
  const chartRefs = useRef({});

  useEffect(() => {
    // Wait for DOM to be ready
    const initializeCharts = () => {
      try {
        // Initialize all charts with sample data
        analyzeData(sampleData);
      } catch (error) {
        console.error('Failed to initialize charts:', error);
      }
    };

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(initializeCharts);

    // Cleanup function
    return () => {
      // Destroy all charts when component unmounts
      Object.values(chartRefs.current).forEach(chart => {
        if (chart) {
          chart.destroy();
        }
      });
    };
  }, []);

  return (
    <></>
  );
} 