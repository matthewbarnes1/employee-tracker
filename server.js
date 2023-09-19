const express = require('express');
const mysql = require('mysql2');
const inquirer = require('inquirer');
require('dotenv').config();

const db_name = process.env.DB_NAME;
const db_user = process.env.DB_USER;
const db_pw = process.env.DB_PASSWORD;

const PORT = process.env.PORT || 3001;
const app = express();

const db = mysql.createConnection(
  {
    host: '127.0.0.1',
    user: db_user,
    password: db_pw,
    database: db_name,
  },
  console.log(`Connected to the ${db_name} database.`)
);

function mainMenu() {
  inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'View all departments',
        'View all roles',
        'View all employees',
        'Add a department',
        'Add a role',
        'Add an employee',
        'Update an employee role',
        'Exit'
      ]
    }
  ]).then(answer => {
    switch (answer.action) {
      case 'View all departments':
        viewDepartments();
        break;
      case 'View all roles':
        viewRoles();
        break;
      case 'View all employees':
        viewEmployees();
        break;
      case 'Add a department':
        addDepartment();
        break;
      case 'Add a role':
        addRole();
        break;
      case 'Add an employee':
        addEmployee();
        break;
      case 'Update an employee role':
        updateEmployeeRole();
        break;
      default:
        process.exit();
    }
  });
}

function viewDepartments() {
  db.query('SELECT * FROM departments', (err, rows) => {
    if (err) throw err;
    console.table(rows);
    mainMenu();
  });
}

function viewRoles() {
  const query = `
    SELECT roles.id, roles.title, roles.salary, departments.name AS department 
    FROM roles 
    JOIN departments ON roles.department_id = departments.id`;

  db.query(query, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    mainMenu();
  });
}

function viewEmployees() {
  const query = `
    SELECT employees.id, employees.first_name, employees.last_name, roles.title, 
           departments.name AS department, roles.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager 
    FROM employees 
    LEFT JOIN roles ON employees.role_id = roles.id 
    LEFT JOIN departments ON roles.department_id = departments.id 
    LEFT JOIN employees manager ON manager.id = employees.manager_id`;

  db.query(query, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    mainMenu();
  });
}

function addDepartment() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'departmentName',
      message: 'Enter the name of the department:'
    }
  ]).then(answer => {
    const query = 'INSERT INTO departments (name) VALUES (?)';
    db.query(query, answer.departmentName, (err, result) => {
      if (err) throw err;
      console.log('Added department successfully!');
      mainMenu();
    });
  });
}

// ... continue with addRole, addEmployee, and updateEmployeeRole functions ...

app.use((req, res) => {
  res.status(404).end();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  mainMenu();
});
