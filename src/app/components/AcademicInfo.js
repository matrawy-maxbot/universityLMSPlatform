import React, { useState, useEffect } from 'react';
import { Card, Tabs, Table, Spin, Alert, Typography, Select, Tag, List, Avatar } from 'antd';
import { CalendarOutlined, TeamOutlined, SolutionOutlined, BarsOutlined } from '@ant-design/icons';
import mockApiService from '../api/mockApiService';

const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { Option } = Select;

const AcademicInfo = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [levels, setLevels] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [currentSemester, setCurrentSemester] = useState(null);
  const [user, setUser] = useState(null);
  const [studentGroups, setStudentGroups] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get user data
        const userResponse = await mockApiService.user.getCurrentUser();
        setUser(userResponse.data);

        // Get academic data
        const semestersResponse = await mockApiService.academic.getAllSemesters();
        setSemesters(semestersResponse.data);
        
        const levelsResponse = await mockApiService.academic.getAllLevels();
        setLevels(levelsResponse.data);
        
        const groupsResponse = await mockApiService.academic.getAllGroups();
        setGroups(groupsResponse.data);

        const yearsResponse = await mockApiService.academic.getAcademicYears();
        setAcademicYears(yearsResponse.data);

        const currentSemesterResponse = await mockApiService.academic.getCurrentSemester();
        setCurrentSemester(currentSemesterResponse.data);
        
        // If the user is a student, get their groups
        if (userResponse.data.type === 0) { // Student type
          const studentGroupsResponse = await mockApiService.student.getStudentGroups(userResponse.data.id);
          setStudentGroups(studentGroupsResponse.data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching academic data:', err);
        setError('Failed to load academic information. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleGroupChange = async (groupId) => {
    try {
      setLoading(true);
      const response = await mockApiService.academic.getGroupMembers(groupId);
      setGroupMembers(response.data);
      setSelectedGroup(groupId);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching group members:', err);
      setError('Failed to load group members. Please try again later.');
      setLoading(false);
    }
  };

  const semesterColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Semester',
      dataIndex: 'semester',
      key: 'semester',
      render: (text) => text.charAt(0).toUpperCase() + text.slice(1)
    },
    {
      title: 'Academic Year',
      key: 'year',
      render: (text, record) => `${record.semesterstartyear}/${record.semesterendyear}`
    },
    {
      title: 'Status',
      key: 'status',
      render: (text, record) => {
        const now = new Date();
        const endDate = record.endedat ? new Date(record.endedat) : new Date(2099, 11, 31);
        if (endDate < now) {
          return <Tag color="default">Ended</Tag>;
        } else {
          return <Tag color="green">Active</Tag>;
        }
      }
    }
  ];

  const levelColumns = [
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
    },
    {
      title: 'Supervisor',
      dataIndex: 'supervisorid',
      key: 'supervisorid',
    },
    {
      title: 'Hours',
      dataIndex: 'levelhours',
      key: 'levelhours',
    }
  ];

  const groupColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Author',
      dataIndex: 'authorid',
      key: 'authorid',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <a onClick={() => handleGroupChange(record.id)}>View Members</a>
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
    <div className="academic-info">
      <Card>
        <Title level={2}>Academic Information</Title>
        
        {currentSemester && (
          <Card style={{ marginBottom: '20px' }}>
            <Title level={4}>Current Semester</Title>
            <Text strong>
              {currentSemester.semester.charAt(0).toUpperCase() + currentSemester.semester.slice(1)} {currentSemester.semesterstartyear}/{currentSemester.semesterendyear}
            </Text>
          </Card>
        )}
        
        {user && user.type === 0 && studentGroups.length > 0 && (
          <Card style={{ marginBottom: '20px' }}>
            <Title level={4}>Your Groups</Title>
            <List
              itemLayout="horizontal"
              dataSource={studentGroups}
              renderItem={(group) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<TeamOutlined />} />}
                    title={group.title}
                    description={group.description}
                  />
                </List.Item>
              )}
            />
          </Card>
        )}
        
        <Tabs defaultActiveKey="1">
          <TabPane
            tab={
              <span>
                <CalendarOutlined />
                Semesters
              </span>
            }
            key="1"
          >
            <Table dataSource={semesters} columns={semesterColumns} rowKey="id" />
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <BarsOutlined />
                Levels
              </span>
            }
            key="2"
          >
            <Table dataSource={levels} columns={levelColumns} rowKey="id" />
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <TeamOutlined />
                Groups
              </span>
            }
            key="3"
          >
            <div style={{ marginBottom: '20px' }}>
              <Select
                style={{ width: 300 }}
                placeholder="Select a group to view members"
                onChange={handleGroupChange}
                value={selectedGroup}
              >
                {groups.map(group => (
                  <Option key={group.id} value={group.id}>{group.title}</Option>
                ))}
              </Select>
            </div>
            
            {selectedGroup ? (
              <Card title={`Members of ${groups.find(g => g.id === selectedGroup)?.title || 'Group'}`}>
                <List
                  itemLayout="horizontal"
                  dataSource={groupMembers}
                  renderItem={(member) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<SolutionOutlined />} />}
                        title={member.name || member.id}
                        description={`ID: ${member.id}`}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            ) : (
              <Table dataSource={groups} columns={groupColumns} rowKey="id" />
            )}
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <CalendarOutlined />
                Academic Years
              </span>
            }
            key="4"
          >
            <List
              bordered
              dataSource={academicYears}
              renderItem={year => (
                <List.Item>
                  <Text strong>{year}</Text>
                </List.Item>
              )}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default AcademicInfo; 