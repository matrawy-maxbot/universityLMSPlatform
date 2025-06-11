import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Button, Tag, Alert, Spin, Tabs, Form, 
  Select, Typography, Divider, Modal, Input, Switch, InputNumber, Space
} from 'antd';
import { 
  CheckCircleOutlined, CloseCircleOutlined, 
  SettingOutlined, UserOutlined, FileSearchOutlined
} from '@ant-design/icons';
import mockApiService from '../api/mockApiService';

const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { confirm } = Modal;

const RegistrationManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [user, setUser] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [registrationSettings, setRegistrationSettings] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [students, setStudents] = useState([]);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Simulate pending registrations data for the admin view
  const mockPendingRegistrations = [
    {
      id: 1,
      studentId: 'S001',
      studentName: 'Ahmed Mohamed',
      courseId: 'CS202',
      courseName: 'نظم التشغيل',
      courseCode: 'CS202',
      semesterId: 14,
      hours: 3,
      gpa: 3.5,
      currentHours: 12,
      createdAt: '2025-06-05T10:30:00.000Z'
    },
    {
      id: 2,
      studentId: 'S002',
      studentName: 'Fatima Ali',
      courseId: 'MATH101',
      courseName: 'حساب التفاضل والتكامل',
      courseCode: 'MATH101',
      semesterId: 14,
      hours: 4,
      gpa: 2.8,
      currentHours: 14,
      createdAt: '2025-06-05T11:15:00.000Z'
    },
    {
      id: 38,
      studentId: 'S008',
      studentName: 'Nour Hassan',
      courseId: 'ENG105',
      courseName: 'كتابة التقارير الفنية',
      courseCode: 'ENG105',
      semesterId: 14,
      hours: 2,
      gpa: 3.2,
      currentHours: 9,
      createdAt: '2025-06-01T09:34:59.983Z'
    },
    {
      id: 39,
      studentId: 'S008',
      studentName: 'Nour Hassan',
      courseId: 'MATH101',
      courseName: 'حساب التفاضل والتكامل',
      courseCode: 'MATH101',
      semesterId: 14,
      hours: 4,
      gpa: 3.2,
      currentHours: 9,
      createdAt: '2025-06-03T07:51:19.719Z'
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get user data
        const userResponse = await mockApiService.user.getCurrentUser();
        setUser(userResponse.data);
        
        // Verify user is admin or faculty
        if (userResponse.data.type !== 1 && userResponse.data.type !== 2 && userResponse.data.type !== 3) {
          setError('Unauthorized: Only administrators and faculty can access this page');
          setLoading(false);
          return;
        }
        
        // Get semesters
        const semestersResponse = await mockApiService.academic.getAllSemesters();
        setSemesters(semestersResponse.data);
        
        // Get current semester
        const currentSemesterResponse = await mockApiService.academic.getCurrentSemester();
        setSelectedSemester(currentSemesterResponse.data.id);
        
        // Get all students
        const studentsResponse = await mockApiService.admin.getAllStudents();
        setStudents(studentsResponse.data);
        
        // Get all courses
        const coursesResponse = await mockApiService.course.getAllCourses();
        setCourses(coursesResponse.data);
        
        // In a real app, we'd get the actual pending registrations
        // For now, use mock data
        setPendingRegistrations(mockPendingRegistrations);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load registration management data. Please try again later.');
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

  const handleCourseChange = (value) => {
    setSelectedCourse(value);
  };

  const handleApprove = (registration) => {
    confirm({
      title: 'Approve Course Registration',
      content: `Are you sure you want to approve ${registration.studentName}'s registration for ${registration.courseName}?`,
      onOk: async () => {
        try {
          setLoading(true);
          
          // Call API to approve registration
          const response = await mockApiService.admin.approveRegistration(registration.id);
          
          if (response.success) {
            // Remove from pending list
            setPendingRegistrations(
              pendingRegistrations.filter(reg => reg.id !== registration.id)
            );
            
            setSuccess(`Successfully approved registration for ${registration.studentName}`);
            
            // Clear success message after 5 seconds
            setTimeout(() => {
              setSuccess(null);
            }, 5000);
          } else {
            setError(response.message);
          }
          
          setLoading(false);
        } catch (err) {
          console.error('Error approving registration:', err);
          setError('Failed to approve registration. Please try again later.');
          setLoading(false);
        }
      }
    });
  };

  const handleReject = (registration) => {
    Modal.confirm({
      title: 'Reject Course Registration',
      content: (
        <div>
          <p>Are you sure you want to reject {registration.studentName}'s registration for {registration.courseName}?</p>
          <Form layout="vertical">
            <Form.Item
              label="Reason for Rejection"
              name="rejectionReason"
              rules={[{ required: true, message: 'Please provide a reason for rejection' }]}
            >
              <TextArea rows={4} />
            </Form.Item>
          </Form>
        </div>
      ),
      onOk: async () => {
        const reason = document.querySelector('textarea').value;
        if (!reason) {
          setError('Please provide a reason for rejection');
          return;
        }
        
        try {
          setLoading(true);
          
          // Call API to reject registration
          const response = await mockApiService.admin.rejectRegistration(
            registration.id, 
            reason
          );
          
          if (response.success) {
            // Remove from pending list
            setPendingRegistrations(
              pendingRegistrations.filter(reg => reg.id !== registration.id)
            );
            
            setSuccess(`Successfully rejected registration for ${registration.studentName}`);
            
            // Clear success message after 5 seconds
            setTimeout(() => {
              setSuccess(null);
            }, 5000);
          } else {
            setError(response.message);
          }
          
          setLoading(false);
        } catch (err) {
          console.error('Error rejecting registration:', err);
          setError('Failed to reject registration. Please try again later.');
          setLoading(false);
        }
      }
    });
  };

  const handleShowSettingsModal = () => {
    form.setFieldsValue({
      open: registrationSettings?.open || false,
      maxhours: registrationSettings?.maxhours || 18,
      minhours: registrationSettings?.minhours || 2,
      gpaconditions: registrationSettings?.gpaconditions || '[{"maxhours": 16, "lowerthan": 2.5}]'
    });
    setIsSettingsModalVisible(true);
  };

  const handleSaveSettings = async (values) => {
    try {
      setLoading(true);
      
      // Call API to update settings
      const response = await mockApiService.admin.updateRegistrationSettings(
        selectedSemester,
        values
      );
      
      if (response.success) {
        setRegistrationSettings(response.data);
        setSuccess('Registration settings updated successfully');
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 5000);
      } else {
        setError(response.message);
      }
      
      setIsSettingsModalVisible(false);
      setLoading(false);
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Failed to update registration settings. Please try again later.');
      setLoading(false);
    }
  };

  const pendingRegistrationsColumns = [
    {
      title: 'Student ID',
      dataIndex: 'studentId',
      key: 'studentId',
      sorter: (a, b) => a.studentId.localeCompare(b.studentId),
    },
    {
      title: 'Student Name',
      dataIndex: 'studentName',
      key: 'studentName',
      sorter: (a, b) => a.studentName.localeCompare(b.studentName),
    },
    {
      title: 'Course Code',
      dataIndex: 'courseCode',
      key: 'courseCode',
      sorter: (a, b) => a.courseCode.localeCompare(b.courseCode),
    },
    {
      title: 'Course Name',
      dataIndex: 'courseName',
      key: 'courseName',
      sorter: (a, b) => a.courseName.localeCompare(b.courseName),
    },
    {
      title: 'Hours',
      dataIndex: 'hours',
      key: 'hours',
      sorter: (a, b) => a.hours - b.hours,
    },
    {
      title: 'Student GPA',
      dataIndex: 'gpa',
      key: 'gpa',
      sorter: (a, b) => a.gpa - b.gpa,
    },
    {
      title: 'Current Hours',
      dataIndex: 'currentHours',
      key: 'currentHours',
      sorter: (a, b) => a.currentHours - b.currentHours,
    },
    {
      title: 'Request Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            icon={<CheckCircleOutlined />} 
            onClick={() => handleApprove(record)}
          >
            Approve
          </Button>
          <Button 
            danger 
            icon={<CloseCircleOutlined />} 
            onClick={() => handleReject(record)}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  const courseRegistrationColumns = [
    {
      title: 'Course Code',
      dataIndex: 'coursecode',
      key: 'coursecode',
      sorter: (a, b) => a.coursecode.localeCompare(b.coursecode),
    },
    {
      title: 'Course Name',
      dataIndex: 'coursename',
      key: 'coursename',
      sorter: (a, b) => a.coursename.localeCompare(b.coursename),
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
      title: 'Credit Hours',
      dataIndex: 'coursehours',
      key: 'coursehours',
      sorter: (a, b) => a.coursehours - b.coursehours,
    },
    {
      title: 'Registered Students',
      key: 'registeredCount',
      render: (_, record) => {
        // Count students registered for this course
        const count = pendingRegistrations.filter(
          reg => reg.courseId === record.id && reg.semesterId === selectedSemester
        ).length;
        
        return <Tag color={count > 0 ? 'blue' : 'default'}>{count}</Tag>;
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          onClick={() => handleCourseChange(record.id)}
        >
          View Details
        </Button>
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
    <div className="registration-management">
      <Card>
        <Title level={2}>Course Registration Management</Title>
        
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
        
        {success && (
          <Alert
            message="Success"
            description={success}
            type="success"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}
        
        {/* Semester Selection and Settings */}
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
            
            <Form.Item>
              <Button 
                type="primary" 
                icon={<SettingOutlined />} 
                onClick={handleShowSettingsModal}
              >
                Registration Settings
              </Button>
            </Form.Item>
          </Form>
        </Card>
        
        {/* Registration Management Tabs */}
        <Tabs defaultActiveKey="1">
          <TabPane
            tab={
              <span>
                <FileSearchOutlined />
                Pending Registrations
              </span>
            }
            key="1"
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
                <BookOutlined />
                Courses
              </span>
            }
            key="2"
          >
            <Table
              dataSource={courses.filter(course => course.semestername === semesters.find(s => s.id === selectedSemester)?.semester)}
              columns={courseRegistrationColumns}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <UserOutlined />
                Students
              </span>
            }
            key="3"
          >
            <p>View student registration details and manage student exceptions.</p>
            {/* Student management would go here */}
          </TabPane>
        </Tabs>
      </Card>
      
      {/* Registration Settings Modal */}
      <Modal
        title="Course Registration Settings"
        visible={isSettingsModalVisible}
        onCancel={() => setIsSettingsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveSettings}
        >
          <Form.Item
            name="open"
            label="Registration Status"
            valuePropName="checked"
          >
            <Switch checkedChildren="Open" unCheckedChildren="Closed" />
          </Form.Item>
          
          <Form.Item
            name="maxhours"
            label="Maximum Credit Hours"
            rules={[
              { required: true, message: 'Please input maximum hours' },
              { type: 'number', min: 1, max: 24, message: 'Hours must be between 1 and 24' }
            ]}
          >
            <InputNumber min={1} max={24} />
          </Form.Item>
          
          <Form.Item
            name="minhours"
            label="Minimum Credit Hours"
            rules={[
              { required: true, message: 'Please input minimum hours' },
              { type: 'number', min: 1, max: 24, message: 'Hours must be between 1 and 24' }
            ]}
          >
            <InputNumber min={1} max={24} />
          </Form.Item>
          
          <Form.Item
            name="gpaconditions"
            label="GPA Conditions (JSON)"
            rules={[
              { required: true, message: 'Please input GPA conditions' },
              {
                validator: (_, value) => {
                  try {
                    JSON.parse(value);
                    return Promise.resolve();
                  } catch (err) {
                    return Promise.reject(new Error('Invalid JSON format'));
                  }
                }
              }
            ]}
          >
            <TextArea rows={4} placeholder='[{"maxhours": 16, "lowerthan": 2.5}]' />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Save Settings
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RegistrationManagement; 