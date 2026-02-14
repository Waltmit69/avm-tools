const fs = require('fs');
const path = require('path');
const sidebar = document.querySelector('.sidebar');
const togglebtn = document.querySelector('.toggle-btn');
togglebtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});
const jsonFilePath = path.join(__dirname, 'checkbox.json');
function saveCheckboxStatesToFile() {
    const checkboxes = document.querySelectorAll('.checkbox-item input[type="checkbox"]');
    const states = {};
    checkboxes.forEach(checkbox => {
        states[checkbox.id] = checkbox.checked;
    });
    fs.writeFile(jsonFilePath, JSON.stringify(states, null, 2), (err) => {
        if (err) {
            console.error('Error writing to checkbox.json:', err);
        } else {
            console.log('Checkbox states saved to file:', states);
        }
    });
}
function loadCheckboxStatesFromFile() {
    try {
        const data = fs.readFileSync(jsonFilePath, 'utf8');
        const states = JSON.parse(data);
        console.log('Checkbox states loaded from file:', states);
        const checkboxes = document.querySelectorAll('.checkbox-item input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = states[checkbox.id] || false;
        });
    } catch (err) {
        console.error('Error reading checkbox.json file:', err);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    function saveCheckboxStates() {
        const checkboxes = document.querySelectorAll('.checkbox-item input[type="checkbox"]');
        const states = {};
        checkboxes.forEach(checkbox => {
            states[checkbox.id] = checkbox.checked;
        });
        localStorage.setItem('checkboxStates', JSON.stringify(states));
        saveCheckboxStatesToFile();
    }
    function loadCheckboxStates() {
        const states = JSON.parse(localStorage.getItem('checkboxStates')) || {};
        console.log('Checkbox states loaded from localStorage:', states);
        const checkboxes = document.querySelectorAll('.checkbox-item input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = states[checkbox.id] || false;
        });
    }
    function updateToggleButton() {
        const checkboxes = document.querySelectorAll('.checkbox-item input[type="checkbox"]');
        const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
        document.getElementById('toggleButton').textContent = allChecked ? 'Uncheck All' : 'Check All';
    }
    function toggleAllCheckboxes() {
        const checkboxes = document.querySelectorAll('.checkbox-item input[type="checkbox"]');
        const checkAll = document.getElementById('toggleButton').textContent === 'Check All';
        checkboxes.forEach(checkbox => {
            checkbox.checked = checkAll;
        });
        saveCheckboxStates();
        updateToggleButton();
    }
    loadCheckboxStates();
    loadCheckboxStatesFromFile();
    updateToggleButton();
    document.querySelectorAll('.checkbox-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            saveCheckboxStates();
            updateToggleButton();
        });
    });
    document.getElementById('toggleButton').addEventListener('click', toggleAllCheckboxes);
});
