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
    host: 'localhost',
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
    SELECT role.id, role.title, role.salary, departments.name AS department 
    FROM role 
    JOIN departments ON role.department_id = departments.id`;

  db.query(query, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    mainMenu();
  });
}

function viewEmployees() {
  const query = `
    SELECT employee.id, employee.first_name, employee.last_name, role.title, 
           departments.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager 
    FROM employee
    LEFT JOIN role ON employee.role_id = role.id 
    LEFT JOIN departments ON role.department_id = departments.id -- Corrected table name here
    LEFT JOIN employee manager ON manager.id = employee.manager_id`;

  db.query(query, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    mainMenu();
  });
}


function addDepartment() {
  inquirer.prompt([{
    type: 'input',
    name: 'departmentName',
    message: 'Enter the name of the department:'
  }]).then(answer => {
    const query = 'INSERT INTO departments (name) VALUES (?)';  // Fixed table name to "departments"
    db.query(query, answer.departmentName, (err, result) => {
      if (err) throw err;
      console.log('Added department successfully!');
      mainMenu();
    });
  });
}

function addRole() {
  // First, prompt for the role details
  inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Enter the title of the role:'
    },
    {
      type: 'input',
      name: 'salary',
      message: 'Enter the salary for this role:',
      validate: value => {
        if (isNaN(value) || parseFloat(value) <= 0) {
          return "Please enter a valid positive number for the salary.";
        }
        return true;
      }
    }
  ])
  .then(answer => {
    // Fetch department details to allow user to choose
    db.query('SELECT id, name FROM departments', (err, departments) => {
      if (err) throw err;

      inquirer.prompt({
        type: 'list',
        name: 'departmentId',
        message: 'Choose the department for this role:',
        choices: departments.map(dept => ({
          name: dept.name,
          value: dept.id
        }))
      })
      .then(departmentAnswer => {
        const query = 'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)';
        db.query(query, [answer.title, parseFloat(answer.salary), departmentAnswer.departmentId], (err, result) => {
          if (err) throw err;
          console.log('Added role successfully!');
          mainMenu();
        });
      });
    });
  });
}


function addEmployee() {
  // First, fetch all roles to allow the user to choose
  db.query('SELECT id, title FROM role', (err, roles) => {
    if (err) throw err;

    inquirer.prompt([
      {
        type: 'input',
        name: 'firstName',
        message: 'Enter the first name of the employee:'
      },
      {
        type: 'input',
        name: 'lastName',
        message: 'Enter the last name of the employee:'
      },
      {
        type: 'list',
        name: 'roleId',
        message: 'Choose the role for this employee:',
        choices: roles.map(role => ({
          name: role.title,
          value: role.id
        }))
      }
    ])
    .then(answer => {
      // Fetch current employees to choose a manager (or opt for no manager)
      db.query('SELECT id, CONCAT(first_name, " ", last_name) AS manager_name FROM employee', (err, managers) => {
        if (err) throw err;

        managers.push({ id: null, manager_name: "None" }); // Adding an option for no manager

        inquirer.prompt({
          type: 'list',
          name: 'managerId',
          message: 'Choose the manager for this employee:',
          choices: managers.map(manager => ({
            name: manager.manager_name,
            value: manager.id
          }))
        })
        .then(managerAnswer => {
          const query = 'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)';
          db.query(query, [answer.firstName, answer.lastName, answer.roleId, managerAnswer.managerId || null], (err, result) => {
            if (err) throw err;
            console.log('Added employee successfully!');
            mainMenu();
          });
        });
      });
    });
  });
}


// *updateEmployeeRole functions ...

app.use((req, res) => {
  res.status(404).end();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  mainMenu();
});

