DROP DATABASE IF EXISTS employee_db;
CREATE DATABASE employee_db;

USE employee_db;

CREATE TABLE department (
  id INT NOT NULL,
  name: VARCHAR(30) to hold department name,
  course_title VARCHAR(30) NOT NULL,
  course_description TEXT NOT NULL,
  active BOOLEAN NOT NULL,
  date_added DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE employee (
  id: INT PRIMARY KEY,
  role_id: INT to hold reference to employee role,
  manager_id: INT to hold reference to another employee that is the manager of the current employee (null if the employee has no manager),
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  active BOOLEAN NOT NULL,
  date_updated DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE role (
  id: INT PRIMARY KEY,
title: VARCHAR(30) to hold role title,
salary: DECIMAL to hold role salary,
department_id: INT to hold reference to department role belongs to,
  date_updated DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);





