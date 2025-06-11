# University Platform Frontend

This repository contains the frontend code for a university platform that allows students, faculty, and administrators to manage academic activities.

## Overview

This frontend application is designed to work with a backend API, but can also function independently using mock data. The application includes modules for:

- User authentication and authorization
- Student academic records and grades
- Faculty course management
- Administrative functions
- Course registration system
- Academic structure (semesters, levels, groups)

## Mock Data System

Since the backend was deleted, this frontend implements a comprehensive mock data system to simulate the backend functionality. The mock data includes:

- **User Data**: Student, faculty, and administrative user accounts
- **Academic Records**: Student grades, GPA calculation, and transcripts
- **Faculty Data**: Doctors, assistants, and their course assignments
- **Administrative Data**: Admin records and analytics
- **Course Data**: Course catalog, registration, and enrollment information
- **Academic Structure**: Semesters, levels, groups, and group memberships

## Features

### Student Features

- **Dashboard**: View academic summary, current courses, and announcements
- **Grades**: View course grades and calculate GPA
- **Course Registration**: Register for courses, view pending registrations, and see registration status
- **Academic Information**: View semester, level, and group information

### Faculty Features

- **Course Management**: View assigned courses and student lists
- **Grade Management**: Enter and modify student grades
- **Registration Approval**: Approve or reject student course registrations

### Administrative Features

- **User Management**: Manage student and faculty accounts
- **Course Management**: Set up courses, assign instructors
- **Registration Settings**: Configure registration periods, credit hour limits, and GPA conditions

## Mock API Service

The application includes a mock API service that simulates backend functionality:

- **User Service**: Authentication and user profile management
- **Student Service**: Academic record and grade retrieval
- **Course Service**: Course catalog and registration management
- **Academic Service**: Semester, level, and group information
- **Admin Service**: Administrative functions and analytics

## Course Registration System

The system includes a complete course registration workflow:

- Students can browse available courses for the current semester
- Registration is subject to credit hour limits and GPA conditions
- Students can submit registration requests that require approval
- Faculty/admins can approve or reject registration requests with comments
- Registration settings can be configured per semester

## Components

The key components in the application include:

- **Login**: User authentication
- **StudentDashboard**: Main student interface
- **CourseRegistration**: Course selection and registration system
- **RegistrationManagement**: Admin interface for managing registrations
- **AcademicInfo**: Display of academic structure information
- **GradeDisplay**: View and calculate student grades

## Getting Started

To run the application locally:

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm start`

The application will run in development mode using the mock data system to simulate backend functionality.

## Mock Data Files

- `mockUtils.js`: Basic utility functions and user data
- `mockExtendedData.js`: Student records, grades, and faculty data
- `mockAcademicData.js`: Semesters, levels, groups, and memberships
- `mockCourseData.js`: Course catalog, registration settings, and enrollments
- `mockApiService.js`: Mock implementation of backend API endpoints
