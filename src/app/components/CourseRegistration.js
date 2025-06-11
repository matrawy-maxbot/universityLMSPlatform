import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Button, Tag, Alert, Spin, Tabs, Form, 
  Select, InputNumber, Typography, Divider, Space, Modal
} from 'antd';
import { 
  BookOutlined, CheckCircleOutlined, ClockCircleOutlined, 
  ExclamationCircleOutlined, PlusOutlined, SettingOutlined 
} from '@ant-design/icons';
import mockApiService from '../api/mockApiService';

const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

const CourseRegistration = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [registeredCourses, setRegisteredCourses] = useState([]);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [registrationSettings, setRegistrationSettings] = useState(null);
  const [studentRecord, setStudentRecord] = useState(null);
  const [totalHours, setTotalHours] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get user data
        const userResponse = await mockApiService.user.getCurrentUser();
        setUser(userResponse.data);
        
        // Get semesters
        const semestersResponse = await mockApiService.academic.getAllSemesters();
        setSemesters(semestersResponse.data);
        
        // Get current semester
        const currentSemesterResponse = await mockApiService.academic.getCurrentSemester();
        setSelectedSemester(currentSemesterResponse.data.id);
        
        // If student user, get student record
        if (userResponse.data.type === 0) { // Student user type
          const studentId = userResponse.data.id;
          
          // Get student record
          const recordResponse = await mockApiService.student.getStudentRecord(studentId);
          if (recordResponse.success) {
            setStudentRecord(recordResponse.data);
          }
          
          // Get registered courses
          const coursesResponse = await mockApiService.student.getRegisteredCourses(studentId);
          if (coursesResponse.success) {
            setRegisteredCourses(coursesResponse.data);
            
            // Calculate total registered hours
            let hours = 0;
            coursesResponse.data.forEach(course => {
              if (course.semesterId === currentSemesterResponse.data.id) {
                hours += course.hours;
              }
            });
            setTotalHours(hours);
          }
          
          // Get pending registrations
          const pendingResponse = await mockApiService.student.getPendingRegistrations(studentId);
          if (pendingResponse.success) {
            setPendingRegistrations(pendingResponse.data);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load course registration data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    const fetchSemesterData = async () => {
      if (!selectedSemester) return;
      
      try {
        setLoading(true);
        
        // Get registration settings for the selected semester
        const settingsResponse = await mockApiService.course.getRegistrationSettings(selectedSemester);
        if (settingsResponse.success) {
          setRegistrationSettings(settingsResponse.data);
        }
        
        // Get available courses for the selected semester
        const coursesResponse = await mockApiService.course.getAvailableCourses(selectedSemester);
        if (coursesResponse.success) {
          setAvailableCourses(coursesResponse.data);
        } else {
          setAvailableCourses([]);
        }
        
        // Recalculate total hours for the selected semester
        if (user && user.type === 0) {
          let hours = 0;
          registeredCourses.forEach(course => {
            if (course.semesterId === selectedSemester) {
              hours += course.hours;
            }
          });
          setTotalHours(hours);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching semester data:', err);
        setError('Failed to load semester data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchSemesterData();
  }, [selectedSemester]);

  const handleSemesterChange = (value) => {
    setSelectedSemester(value);
  };

  const handleRegisterCourse = (course) => {
    setSelectedCourse(course);
    
    confirm({
      title: `Register for ${course.coursename}?`,
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Course: {course.coursename} ({course.coursecode})</p>
          <p>Credit Hours: {course.coursehours}</p>
          <p>Department: {course.group}</p>
          <p>Level: {course.level}</p>
        </div>
      ),
      onOk() {
        registerForCourse(course);
      },
      onCancel() {
        setSelectedCourse(null);
      },
    });
  };

  const registerForCourse = async (course) => {
    if (!user || !selectedSemester) return;
    
    try {
      setLoading(true);
      
      const response = await mockApiService.student.registerForCourse(
        user.id, 
        course.id, 
        selectedSemester
      );
      
      if (response.success) {
        // Add to pending registrations
        setPendingRegistrations([...pendingRegistrations, {
          id: response.data.id,
          courseId: course.id,
          courseName: course.coursename,
          courseCode: course.coursecode,
          semesterId: selectedSemester,
          hours: course.coursehours,
          createdAt: response.data.createdAt
        }]);
        
        setRegistrationSuccess(`Successfully requested registration for ${course.coursename}`);
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setRegistrationSuccess(null);
        }, 5000);
      } else {
        setError(response.message);
        
        // Clear error message after 5 seconds
        setTimeout(() => {
          setError(null);
        }, 5000);
      }
      
      setLoading(false);
      setSelectedCourse(null);
    } catch (err) {
      console.error('Error registering for course:', err);
      setError('Failed to register for course. Please try again later.');
      setLoading(false);
      setSelectedCourse(null);
    }
  };

  const availableCoursesColumns = [
    {
      title: 'Code',
      dataIndex: 'coursecode',
      key: 'code',
      sorter: (a, b) => a.coursecode.localeCompare(b.coursecode),
    },
    {
      title: 'Course Name',
      dataIndex: 'coursename',
      key: 'name',
      sorter: (a, b) => a.coursename.localeCompare(b.coursename),
    },
    {
      title: 'Hours',
      dataIndex: 'coursehours',
      key: 'hours',
      sorter: (a, b) => a.coursehours - b.coursehours,
    },
    {
      title: 'Department',
      dataIndex: 'group',
      key: 'group',
      sorter: (a, b) => a.group.localeCompare(b.group),
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      sorter: (a, b) => a.level - b.level,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => handleRegisterCourse(record)}
          disabled={!registrationSettings?.open}
        >
          Register
        </Button>
      ),
    },
  ];

  const registeredCoursesColumns = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Course Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Hours',
      dataIndex: 'hours',
      key: 'hours',
    },
    {
      title: 'Department',
      dataIndex: 'group',
      key: 'group',
    },
    {
      title: 'Semester',
      dataIndex: 'semester',
      key: 'semester',
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Tag color="success">Registered</Tag>
      ),
    },
  ];

  const pendingRegistrationsColumns = [
    {
      title: 'Code',
      dataIndex: 'courseCode',
      key: 'code',
    },
    {
      title: 'Course Name',
      dataIndex: 'courseName',
      key: 'name',
    },
    {
      title: 'Hours',
      dataIndex: 'hours',
      key: 'hours',
    },
    {
      title: 'Request Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Tag color="processing">Pending Approval</Tag>
      ),
    },
  ];

  if (loading && !user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="course-registration">
      <Card>
        <Title level={2}>Course Registration</Title>
        
        {/* Error and Success Messages */}
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}
        
        {registrationSuccess && (
          <Alert
            message="Success"
            description={registrationSuccess}
            type="success"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}
        
        {/* Semester Selection */}
        <Card style={{ marginBottom: '16px' }}>
          <Form layout="inline">
            <Form.Item label="Semester">
              <Select
                style={{ width: 200 }}
                value={selectedSemester}
                onChange={handleSemesterChange}
                loading={loading}
              >
                {semesters.map(semester => (
                  <Option key={semester.id} value={semester.id}>
                    {semester.semester.charAt(0).toUpperCase() + semester.semester.slice(1)} {semester.semesterstartyear}/{semester.semesterendyear}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item>
              {registrationSettings && (
                <Tag color={registrationSettings.open ? 'green' : 'red'}>
                  Registration {registrationSettings.open ? 'Open' : 'Closed'}
                </Tag>
              )}
            </Form.Item>
          </Form>
        </Card>
        
        {/* Student Information */}
        {user && user.type === 0 && studentRecord && (
          <Card style={{ marginBottom: '16px' }}>
            <Title level={4}>Student Information</Title>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <Text strong>ID:</Text> {user.id}
              </div>
              <div>
                <Text strong>Name:</Text> {user.name}
              </div>
              <div>
                <Text strong>Major:</Text> {studentRecord.major}
              </div>
              <div>
                <Text strong>Section:</Text> {studentRecord.section}
              </div>
              <div>
                <Text strong>Max Hours:</Text> {studentRecord.maxhours}
              </div>
              <div>
                <Text strong>Current Hours:</Text> {totalHours}
              </div>
              <div>
                <Text strong>Remaining Hours:</Text> {studentRecord.maxhours - totalHours}
              </div>
            </div>
          </Card>
        )}
        
        {/* Registration Tabs */}
        <Tabs defaultActiveKey="1">
          <TabPane
            tab={
              <span>
                <BookOutlined />
                Available Courses
              </span>
            }
            key="1"
          >
            {!registrationSettings?.open && (
              <Alert
                message="Registration is closed for this semester"
                type="warning"
                showIcon
                style={{ marginBottom: '16px' }}
              />
            )}
            
            <Table
              dataSource={availableCourses}
              columns={availableCoursesColumns}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <CheckCircleOutlined />
                Registered Courses
              </span>
            }
            key="2"
          >
            <Table
              dataSource={registeredCourses.filter(course => course.semesterId === selectedSemester)}
              columns={registeredCoursesColumns}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              summary={pageData => {
                let totalHours = 0;
                pageData.forEach(({ hours }) => {
                  totalHours += hours;
                });
                
                return (
                  <>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={2}>Total</Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>{totalHours} Credit Hours</Table.Summary.Cell>
                      <Table.Summary.Cell index={2} colSpan={3}></Table.Summary.Cell>
                    </Table.Summary.Row>
                  </>
                );
              }}
            />
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <ClockCircleOutlined />
                Pending Registrations
              </span>
            }
            key="3"
          >
            <Table
              dataSource={pendingRegistrations.filter(reg => reg.semesterId === selectedSemester)}
              columns={pendingRegistrationsColumns}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: 'No pending course registrations' }}
            />
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <SettingOutlined />
                Registration Information
              </span>
            }
            key="4"
          >
            <Card>
              {registrationSettings ? (
                <div>
                  <Title level={4}>Registration Settings</Title>
                  <Divider />
                  <p><Text strong>Status:</Text> {registrationSettings.open ? 'Open' : 'Closed'}</p>
                  <p><Text strong>Maximum Hours:</Text> {registrationSettings.maxhours}</p>
                  <p><Text strong>Minimum Hours:</Text> {registrationSettings.minhours}</p>
                  
                  {registrationSettings.gpaconditions && (
                    <div>
                      <Title level={5}>GPA Conditions</Title>
                      <ul>
                        {(() => {
                          try {
                            const conditions = JSON.parse(registrationSettings.gpaconditions);
                            return conditions.map((condition, index) => (
                              <li key={index}>
                                If GPA is less than {condition.lowerthan}, maximum hours is limited to {condition.maxhours}
                              </li>
                            ));
                          } catch (err) {
                            return <li>Error parsing GPA conditions</li>;
                          }
                        })()}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <Empty description="No registration settings available for this semester" />
              )}
            </Card>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default CourseRegistration; 