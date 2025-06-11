import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Badge, Progress, Spin, Alert, Tabs } from 'antd';
import { BookOutlined, CheckCircleOutlined, ClockCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import mockApiService from '../api/mockApiService';

const { TabPane } = Tabs;

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [studentRecord, setStudentRecord] = useState(null);
  const [gpa, setGpa] = useState(0);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get user data from localStorage
        const userResponse = await mockApiService.user.getCurrentUser();
        const userData = userResponse.data;
        setUser(userData);
        
        // Fetch student record
        if (userData.type === 0) { // Student user type
          const studentId = userData.id;
          
          // Get student academic record
          const recordResponse = await mockApiService.student.getStudentRecord(studentId);
          if (recordResponse.success) {
            setStudentRecord(recordResponse.data);
          }
          
          // Get GPA
          const gpaResponse = await mockApiService.student.getStudentGPA(studentId);
          if (gpaResponse.success) {
            setGpa(gpaResponse.data.gpa);
          }
          
          // Get registered courses
          const coursesResponse = await mockApiService.student.getRegisteredCourses(studentId);
          if (coursesResponse.success) {
            setCourses(coursesResponse.data);
          }
          
          // Get assignments
          const assignmentsResponse = await mockApiService.assignment.getStudentAssignments();
          if (assignmentsResponse.success) {
            setAssignments(assignmentsResponse.data);
          }
          
          // Get quizzes
          const quizzesResponse = await mockApiService.quiz.getStudentQuizzes();
          if (quizzesResponse.success) {
            setQuizzes(quizzesResponse.data);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const courseColumns = [
    {
      title: 'Course Code',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Course Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Instructor',
      dataIndex: 'instructor',
      key: 'instructor',
    },
    {
      title: 'Grade',
      key: 'grade',
      render: (text, record) => (
        <span>
          {record.grade}/{record.maxGrade} ({((record.grade / record.maxGrade) * 100).toFixed(1)}%)
        </span>
      )
    }
  ];

  const assignmentColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Course',
      dataIndex: 'courseId',
      key: 'courseId',
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
    },
    {
      title: 'Status',
      key: 'status',
      render: (text, record) => (
        <span>
          {record.submitted ? (
            <Badge status="success" text="Submitted" />
          ) : (
            <Badge status="processing" text="Pending" />
          )}
        </span>
      )
    }
  ];

  const quizColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Course',
      dataIndex: 'courseId',
      key: 'courseId',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Score',
      key: 'score',
      render: (text, record) => (
        <span>
          {record.completed ? (
            `${record.score}/${record.totalPoints} (${((record.score / record.totalPoints) * 100).toFixed(1)}%)`
          ) : (
            <Badge status="warning" text="Not taken" />
          )}
        </span>
      )
    }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div className="student-dashboard">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Student Overview">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Card className="stat-card">
                  <h3>Name</h3>
                  <p>{user?.name || 'Student'}</p>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card className="stat-card">
                  <h3>ID</h3>
                  <p>{user?.id || 'N/A'}</p>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card className="stat-card">
                  <h3>Major</h3>
                  <p>{studentRecord?.major || 'N/A'}</p>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card className="stat-card">
                  <h3>GPA</h3>
                  <p>{gpa}</p>
                  <Progress percent={parseFloat(gpa) * 25} status="active" strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }} />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Tabs defaultActiveKey="1">
            <TabPane
              tab={
                <span>
                  <BookOutlined />
                  Courses
                </span>
              }
              key="1"
            >
              <Card>
                <Table 
                  dataSource={courses} 
                  columns={courseColumns} 
                  rowKey="id"
                  pagination={false}
                />
              </Card>
            </TabPane>
            <TabPane
              tab={
                <span>
                  <CheckCircleOutlined />
                  Assignments
                </span>
              }
              key="2"
            >
              <Card>
                <Table 
                  dataSource={assignments} 
                  columns={assignmentColumns} 
                  rowKey="id"
                  pagination={false}
                />
              </Card>
            </TabPane>
            <TabPane
              tab={
                <span>
                  <ClockCircleOutlined />
                  Quizzes
                </span>
              }
              key="3"
            >
              <Card>
                <Table 
                  dataSource={quizzes} 
                  columns={quizColumns} 
                  rowKey="id"
                  pagination={false}
                />
              </Card>
            </TabPane>
            <TabPane
              tab={
                <span>
                  <CalendarOutlined />
                  Schedule
                </span>
              }
              key="4"
            >
              <Card>
                <p>Your class schedule will be displayed here.</p>
              </Card>
            </TabPane>
          </Tabs>
        </Col>
      </Row>

      <style jsx>{`
        .student-dashboard {
          padding: 16px;
        }
        .stat-card {
          text-align: center;
          height: 100%;
        }
        .stat-card h3 {
          margin-bottom: 8px;
          color: #8c8c8c;
        }
        .stat-card p {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
};

export default StudentDashboard; 