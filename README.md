# Google Sheets Clone

## Overview

This project is a web-based spreadsheet application that mimics core functionalities of Google Sheets. It focuses on mathematical operations, data quality functions, and provides an intuitive user interface for data entry and manipulation.

## Features

### Spreadsheet Interface
- Toolbar with formatting options
- Formula bar for input and display
- Cell structure using CSS Grid
- Drag-and-drop functionality
- Cell dependency management
- Dynamic cell formatting
- Row and column management

### Mathematical Functions
- SUM
- AVERAGE
- MAX
- MIN
- COUNT

### Data Quality Functions
- TRIM
- UPPER
- LOWER
- REMOVE_DUPLICATES
- FIND_AND_REPLACE

### Data Entry and Validation
- Input handlers for various data types
- Real-time validation checks

### Testing
- User testing interface
- Automated unit and integration tests

### Non-Functional Improvements
- Performance optimization with virtual scrolling
- Responsive design
- Accessibility features

### Bonus Features
- Additional functions: CONCATENATE, IF, VLOOKUP
- Support for complex formulas
- Save and load functionality
- Data visualization with Chart.js

## Tech Stack

- Frontend: HTML5, CSS3, JavaScript (ES6+)
- Framework: React.js
- State Management: Redux
- Data Visualization: Chart.js
- Testing: Jest, React Testing Library
- Version Control: Git
- Build Tools: Webpack, Babel

## Data Structures

- 2D array for spreadsheet grid
- Directed Acyclic Graph (DAG) for cell dependencies
- Trie for formula parsing and auto-completion
- Set for handling unique values
