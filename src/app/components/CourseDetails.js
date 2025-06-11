import React, { useState, useEffect } from 'react';
import { 
  Card, Descriptions, Tag, Spin, Alert, Tabs, Table, Typography, 
  Divider, Statistic, Row, Col, Avatar, List
} from 'antd';
import { 
  UserOutlined, BookOutlined, CalendarOutlined,
  ClockCircleOutlined, TeamOutlined, StarOutlined
} from '@ant-design/icons';
import mockApiService from '../api/mockApiService';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

const CourseDetails = ({ courseId, semesterId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [course, setCourse] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [semester, setSemester] = useState(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;
      
      try {
        setLoading(true);
        
        // Get course details
        const courseResponse = await mockApiService.course.getCourseById(courseId);
        if (!courseResponse.success) {
          setError('Course not found');
          setLoading(false);
          return;
        }
        
        setCourse(courseResponse.data);
        
        // Get semester details if semesterId is provided
        if (semesterId) {
          const semesterResponse = await mockApiService.academic.getSemesterById(semesterId);
          if (semesterResponse.success) {
            setSemester(semesterResponse.data);
          }
        }
        
        // Get enrolled students for this course
        const studentsResponse = await mockApiService.course.getStudentsInCourse(
          courseId, 
          semesterId || 14 // Default to semester 14 if not provided
        );
        
        if (studentsResponse.success) {
          setEnrolledStudents(studentsResponse.data);
        }
        
        // Parse instructor and assistant IDs
        const instructorIds = parseArrayString(courseResponse.data.doctors);
        const assistantIds = parseArrayString(courseResponse.data.assistants);
        
        // Get instructor details
        const facultyResponse = await mockApiService.admin.getAllFaculty();
        if (facultyResponse.success) {
          const faculty = facultyResponse.data;
          
          // Filter instructors
          const courseInstructors = faculty.filter(f => 
            instructorIds.includes(f.id)
          );
          setInstructors(courseInstructors);
          
          // Filter assistants
          const courseAssistants = faculty.filter(f => 
            assistantIds.includes(f.id)
          );
          setAssistants(courseAssistants);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching course data:', err);
        setError('Failed to load course details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchCourseData();
  }, [courseId, semesterId]);

  // Helper function to parse array strings from the database
  const parseArrayString = (arrayStr) => {
    if (!arrayStr || arrayStr === '{}') return [];
    
    try {
      // Remove curly braces and split by comma
      const cleanStr = arrayStr.replace(/{|}/g, '');
      if (!cleanStr) return [];
      
      return cleanStr.split(',');
    } catch (err) {
      console.error('Error parsing array string:', err);
      return [];
    }
  };
  
  // Format semester name
  const formatSemesterName = (semester) => {
    if (!semester) return 'Unknown Semester';
    
    const semesterName = semester.semester.charAt(0).toUpperCase() + semester.semester.slice(1);
    return `${semesterName} ${semester.semesterstartyear}/${semester.semesterendyear}`;
  };

  const enrolledStudentsColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Major',
      dataIndex: 'major',
      key: 'major',
      sorter: (a, b) => a.major.localeCompare(b.major),
    },
    {
      title: 'Section',
      dataIndex: 'section',
      key: 'section',
    }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <Alert
        message="Error"
        description={error || "Course not found"}
        type="error"
        showIcon
      />
    );
  }

  // Parse prerequisites
  const prerequisites = parseArrayString(course.precoursespassed);

  return (
    <div className="course-details">
      <Card>
        <Title level={2}>
          <BookOutlined /> {course.coursename} ({course.coursecode})
        </Title>
        
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Statistic 
              title="Credit Hours" 
              value={course.coursehours} 
              prefix={<ClockCircleOutlined />} 
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic 
              title="Department" 
              value={course.group || 'N/A'} 
              prefix={<TeamOutlined />} 
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic 
              title="Level" 
              value={course.level} 
              prefix={<StarOutlined />} 
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic 
              title="Semester" 
              value={course.semestername.charAt(0).toUpperCase() + course.semestername.slice(1)} 
              prefix={<CalendarOutlined />} 
            />
          </Col>
        </Row>
        
        <Divider />
        
        <Tabs defaultActiveKey="1">
          <TabPane 
            tab={<span><BookOutlined /> Course Information</span>} 
            key="1"
          >
            <Descriptions bordered column={{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
              <Descriptions.Item label="Course Code" span={2}>{course.coursecode}</Descriptions.Item>
              <Descriptions.Item label="Course Name" span={2}>{course.coursename}</Descriptions.Item>
              <Descriptions.Item label="Credit Hours">{course.coursehours}</Descriptions.Item>
              <Descriptions.Item label="Level">{course.level}</Descriptions.Item>
              <Descriptions.Item label="Department">{course.group || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Semester">{course.semestername}</Descriptions.Item>
              <Descriptions.Item label="Max Points">{course.defaultmaxpoints}</Descriptions.Item>
              <Descriptions.Item label="Requirement" span={3}>
                {course.requirement ? course.requirement : 'None'}
              </Descriptions.Item>
              <Descriptions.Item label="Prerequisites" span={3}>
                {prerequisites.length > 0 ? (
                  prerequisites.map(prereq => (
                    <Tag color="blue" key={prereq}>{prereq}</Tag>
                  ))
                ) : (
                  'None'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Created" span={3}>
                {new Date(course.createdAt).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated" span={3}>
                {new Date(course.updatedAt).toLocaleDateString()}
              </Descriptions.Item>
            </Descriptions>
          </TabPane>
          
          <TabPane 
            tab={<span><UserOutlined /> Instructors</span>} 
            key="2"
          >
            <List
              itemLayout="horizontal"
              dataSource={instructors}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={item.name}
                    description={`ID: ${item.id}`}
                  />
                </List.Item>
              )}
              locale={{ emptyText: 'No instructors assigned' }}
            />
            
            <Divider>Assistants</Divider>
            
            <List
              itemLayout="horizontal"
              dataSource={assistants}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={item.name}
                    description={`ID: ${item.id}`}
                  />
                </List.Item>
              )}
              locale={{ emptyText: 'No assistants assigned' }}
            />
          </TabPane>
          
          <TabPane 
            tab={<span><TeamOutlined /> Enrolled Students</span>} 
            key="3"
          >
            {semester && (
              <div style={{ marginBottom: '16px' }}>
                <Text strong>Semester: </Text>
                <Tag color="blue">{formatSemesterName(semester)}</Tag>
              </div>
            )}
            
            <Table
              dataSource={enrolledStudents}
              columns={enrolledStudentsColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: 'No students enrolled' }}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default CourseDetails; 