document.addEventListener('DOMContentLoaded', () => {
  const taskInput = document.getElementById('task-input');
  const tasksList = document.getElementById('tasks');
  const addTaskBtn = document.getElementById('add-task-btn');
  const taskTemplate = document.getElementById('task-template');

  // Save the template in memory and remove it from the DOM
    const taskTemplateContent = taskTemplate.cloneNode(true);
    taskTemplate.remove();

  function debounce(func, wait) {
    let timeout;

    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };

      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function taskElementFromJson(task) {
    const taskElement = taskTemplateContent.cloneNode(true);
    taskElement.removeAttribute('id'); // Remove the 'id' since it's no longer a template
    taskElement.setAttribute('data-task-id', task._id); // Add the task ID as an attribute
    taskElement.setAttribute('data-task-rev', task._rev); // Add the task revision as an attribute

    // Loop through each attribute in the task object
    Object.keys(task).forEach(attr => {
      const selector = `[data-task-attr="${attr}"]`;
      const elements = taskElement.querySelectorAll(selector);

      elements.forEach(el => {
        // If the element is an input, set the value
        if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') {
          el.value = task[attr];
          if(!el.classList.contains('hide-with-value') && task[attr] !== 0 && task[attr] !== '') {
            el.classList.remove('hidden-expanded');
          }
        }
        // Otherwise, set the textContent
        else {
          el.textContent = task[attr];
        }
      });
    });

    // show the complete button if there's repetition
    if(task.repeat_mode && task.repeat_mode !== 'none') {
      taskElement.querySelector('.complete').classList.remove('hidden-expanded');
    }

    return taskElement;
  }

  async function fetchTasks(searchTerm = '') {
    try {
      const url = searchTerm ? `/api/tasks?search_term=${encodeURIComponent(searchTerm)}` : '/api/tasks';
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const tasks = await response.json();
      tasksList.innerHTML = '';

      console.log("tasks:", tasks);

      tasks.rows.forEach(task => {
        const taskElement = taskElementFromJson(task.doc);
        tasksList.appendChild(taskElement);
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }

  }

  async function sendTaskUpdate(task, updateData, keepFocus) {
    let taskData = {
      "_id": task.getAttribute('data-task-id'),
      "_rev": task.getAttribute('data-task-rev'),
      "description": task.querySelector('input.edit-description').value,
      "completions": [],
      "repeat_mode": task.querySelector('[name="repeat-mode"]').value,
      "repeat_number": parseInt(task.querySelector('.number').value),
      "repeat_unit": task.querySelector('.unit').value
    }

    console.log("taskData", taskData);

    let url = `/api/task`;

    // Merge the existing task data with the update data
    taskData = { ...taskData, ...updateData };

    console.log("sending task update", taskData);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedJson = await response.json();
      if (updatedJson._deleted || taskData.completed) {
        tasksList.removeChild(task);
      } else {
        console.log("updated json:", updatedJson);
        const updatedTaskElement = taskElementFromJson(updatedJson);
        tasksList.replaceChild(updatedTaskElement, task);
        if(keepFocus) {
          updatedTaskElement.classList.add('focused');
        }
      }
    } catch (error) {
      console.error(`Error`, error);
    }
  }

  // Task actions
    tasksList.addEventListener('click', async (event) => {
      const taskDiv = event.target.closest('.task');

      if (!taskDiv) {
        tasksList.querySelectorAll('.task').forEach(task => task.classList.remove('focused'));
        return; // If the clicked element is not inside a task, do nothing
      }

      if (event.target.matches('.description-text')) {
        if(taskDiv.classList.contains('focused')) {
          tasksList.querySelectorAll('.task').forEach(task => task.classList.remove('focused'));
        } else {
          tasksList.querySelectorAll('.task').forEach(task => task.classList.remove('focused'));
          taskDiv.classList.add('focused');
        }
      } else if (event.target.matches('.edit-description')) {
        taskDiv.querySelector('.description-text').classList.add('hidden-expanded'); // Hide the description
        taskDiv.querySelector('input.edit-description').classList.remove('hidden-expanded'); // Show the edit description input
        taskDiv.querySelector('input.edit-description').focus(); // Focus on the edit description input
        taskDiv.querySelector('button.edit-description').classList.add('hidden-expanded'); // hide the edit description button
        taskDiv.querySelector('.update-description').classList.remove('hidden-expanded'); // show the update description button
      } else if (event.target.matches(".update-description")) {
        sendTaskUpdate(taskDiv,{ description: taskDiv.querySelector('input.edit-description').value });
      } else if (event.target.matches('.complete')) {
        sendTaskUpdate(taskDiv, { completed: true });
      } else if (event.target.matches('.delete')) {
        if(confirm("Are you sure you want to delete this task?")) {
          sendTaskUpdate(taskDiv, { _deleted: true });
        }
      }
    });

  tasksList.addEventListener('change', async (event) => {
    console.log("change event", event.target);
    const taskDiv = event.target.closest('.task');
    const target = event.target;

    if (target.matches('[name="repeat-mode"]')) {
      console.log(target.value);
      if(target.value === 'none') {
        taskDiv.querySelector('[name="repeat-number"]').value = 0;
        taskDiv.querySelector('[name="repeat-unit"]').value = '';
        sendTaskUpdate(taskDiv, { repeatMode: 'None' });
      } else if (target.value === 'after-completion') {
        taskDiv.querySelectorAll('.repeat-reveal').forEach(el => el.classList.remove('hidden-expanded'));
      }
    } else if (target.matches('.repeat-reveal')) {
      if(taskDiv.querySelector('.number').value !== '' &&
         taskDiv.querySelector('.unit').value !== '') {
        sendTaskUpdate(taskDiv, {
          repeat_mode: 'after-completion',
          repeat_number: parseInt(taskDiv.querySelector('.number').value),
          repeat_unit: taskDiv.querySelector('.unit').value
        }, true);
      }
    } else if (target.matches('.number')) {
      alert("number changed");
    } else {
      console.log("change event not handled: ", target);
    }
  });

  // Adding a new task
    addTaskBtn.addEventListener('click', async () => {
      if (taskInput.value) {
        try {
          const response = await fetch('/api/task', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ description: taskInput.value, completions: [] }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          await fetchTasks(); // re-fetch tasks because new task will have incidentally performed a query
          let newTaskJson = await response.json();
          const newTask = tasksList.querySelector('.task[data-task-id="'+newTaskJson._id+'"]');
          newTask.classList.add('focused'); // focus the new task
          taskInput.value = '';
        } catch (error) {
          console.error('Error adding task:', error);
        }
      } else {
        alert('Please enter a task description');
      }
    });

  const debouncedSearch = debounce(() => fetchTasks(taskInput.value), 300);
  taskInput.addEventListener('input', debouncedSearch);

  fetchTasks();
});
