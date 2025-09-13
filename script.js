// To-Do List 应用核心功能

// DOM 元素引用
const taskInput = document.getElementById('taskInput');
const taskDueDate = document.getElementById('taskDueDate');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const completedCountEl = document.getElementById('completedCount');
const totalCountEl = document.getElementById('totalCount');

// 任务数据存储
let tasks = [];
let currentFilter = 'all';

// 初始化应用
function initApp() {
  // 从本地存储加载任务
  loadTasks();
  
  // 渲染任务列表
  renderTasks();
  
  // 更新任务统计
  updateTaskStats();
  
  // 绑定事件监听器
  bindEventListeners();
}

// 从本地存储加载任务
function loadTasks() {
  const savedTasks = localStorage.getItem('todoTasks');
  if (savedTasks) {
    try {
      tasks = JSON.parse(savedTasks);
    } catch (error) {
      console.error('加载任务失败:', error);
      tasks = [];
    }
  } else {
    // 如果本地存储中没有任务，添加一些示例任务
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const inTwoHours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    
    tasks = [
      {
        id: Date.now() - 4, 
        text: '完成项目报告',
        completed: false,
        createdAt: yesterday.toISOString(),
        dueDate: yesterday.toISOString() // 已过期任务
      },
      {
        id: Date.now() - 3, 
        text: '回复重要邮件',
        completed: false,
        createdAt: yesterday.toISOString(),
        dueDate: inTwoHours.toISOString() // 即将到期任务
      },
      {
        id: Date.now() - 2, 
        text: '参加团队会议',
        completed: true,
        createdAt: yesterday.toISOString(),
        dueDate: yesterday.toISOString() // 已完成的过期任务
      },
      {
        id: Date.now() - 1, 
        text: '购买办公用品',
        completed: false,
        createdAt: now.toISOString(),
        dueDate: tomorrow.toISOString() // 未来任务
      },
      {
        id: Date.now(), 
        text: '学习新技术',
        completed: false,
        createdAt: now.toISOString(),
        dueDate: null // 没有截止日期的任务
      }
    ];
    
    // 保存示例任务到本地存储
    saveTasks();
  }
}

// 保存任务到本地存储
function saveTasks() {
  localStorage.setItem('todoTasks', JSON.stringify(tasks));
}

// 绑定事件监听器
function bindEventListeners() {
  // 添加任务按钮点击事件
  addTaskBtn.addEventListener('click', addTask);
  
  // 输入框回车事件
  taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  });
  
  // 筛选按钮点击事件
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // 更新当前筛选器
      currentFilter = btn.getAttribute('data-filter');
      
      // 更新筛选按钮样式
      filterBtns.forEach(b => {
        b.classList.remove('active', 'bg-primary', 'text-white');
        b.classList.add('bg-gray-200', 'text-neutral');
      });
      btn.classList.add('active', 'bg-primary', 'text-white');
      btn.classList.remove('bg-gray-200', 'text-neutral');
      
      // 重新渲染任务列表
      renderTasks();
    });
  });
  
  // 清除已完成任务按钮点击事件
  clearCompletedBtn.addEventListener('click', clearCompletedTasks);
}
//
// 添加新任务
function addTask() {
  const taskText = taskInput.value.trim();
  
  // 验证输入
  if (taskText === '') {
    // 添加输入框抖动动画
    taskInput.classList.add('border-danger', 'animate-shake');
    setTimeout(() => {
      taskInput.classList.remove('border-danger', 'animate-shake');
    }, 500);
    return;
  }
  
  // 创建新任务对象
  const newTask = {
    id: Date.now(), // 使用时间戳作为唯一ID
    text: taskText,
    completed: false,
    createdAt: new Date().toISOString(),
    dueDate: taskDueDate.value ? new Date(taskDueDate.value).toISOString() : null
  };
  
  // 添加到任务数组
  tasks.unshift(newTask);
  
  // 保存到本地存储
  saveTasks();
  
  // 重新渲染任务列表
  renderTasks();
  
  // 更新任务统计
  updateTaskStats();
  
  // 清空输入框
  taskInput.value = '';
  taskDueDate.value = '';
  
  // 聚焦输入框
  taskInput.focus();
}

// 渲染任务列表
function renderTasks() {
  // 清空任务列表
  taskList.innerHTML = '';
  
  // 根据当前筛选器过滤任务
  const filteredTasks = tasks.filter(task => {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    if (currentFilter === 'expired') {
      // 只显示已过期且未完成的任务
      if (!task.dueDate || task.completed) return false;
      const dueDate = new Date(task.dueDate);
      const now = new Date();
      return dueDate < now;
    }
    if (currentFilter === 'upcoming') {
      // 只显示即将到期（24小时内）且未完成的任务
      if (!task.dueDate || task.completed) return false;
      const dueDate = new Date(task.dueDate);
      const now = new Date();
      const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      return dueDate >= now && dueDate <= twentyFourHoursLater;
    }
    return true; // 'all' 筛选器
  });
  
  // 检查是否有任务显示
  if (filteredTasks.length === 0) {
    emptyState.style.display = 'block';
    return;
  } else {
    emptyState.style.display = 'none';
  }
  
  // 创建并添加任务项
  filteredTasks.forEach(task => {
    const taskItem = createTaskElement(task);
    taskList.appendChild(taskItem);
  });
}

// 创建单个任务元素
function createTaskElement(task) {
  const taskItem = document.createElement('div');
  
  // 检查任务是否已过期
  let isExpired = false;
  if (task.dueDate && !task.completed) {
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    isExpired = dueDate < now;
  }
  
  // 设置任务项的类名
  let taskItemClass = `task-item ${task.completed ? 'completed' : ''}`;
  if (isExpired) {
    taskItemClass += ' expired';
  }
  taskItem.className = taskItemClass;
  taskItem.setAttribute('data-id', task.id);
  
  // 格式化截止日期
  let dueDateHtml = '';
  if (task.dueDate) {
    const formattedDate = formatDate(new Date(task.dueDate));
    const dateClass = isExpired ? 'text-danger' : 'text-neutral';
    dueDateHtml = `<div class="task-due-date ${dateClass} text-sm mt-1">
                    <i class="fa fa-clock-o mr-1" aria-hidden="true"></i>
                    截止时间: ${formattedDate}
                  </div>`;
  }
  
  // 构建任务项HTML内容
  taskItem.innerHTML = `
    <input 
      type="checkbox" 
      class="task-checkbox" 
      ${task.completed ? 'checked' : ''}
    >
    <div class="task-content">
      <span class="task-text">${escapeHTML(task.text)}</span>
      ${dueDateHtml}
    </div>
    <div class="task-actions">
      <button class="task-action-btn edit-btn" title="编辑任务">
        <i class="fa fa-pencil" aria-hidden="true"></i>
      </button>
      <button class="task-action-btn delete-btn" title="删除任务">
        <i class="fa fa-trash" aria-hidden="true"></i>
      </button>
    </div>
  `;
  
  // 获取任务项内的元素引用
  const checkbox = taskItem.querySelector('.task-checkbox');
  const editBtn = taskItem.querySelector('.edit-btn');
  const deleteBtn = taskItem.querySelector('.delete-btn');
  
  // 绑定任务项内元素的事件监听器
  checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));
  editBtn.addEventListener('click', () => editTask(task.id));
  deleteBtn.addEventListener('click', () => deleteTask(task.id));
  
  return taskItem;
}

// 切换任务完成状态
function toggleTaskCompletion(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
    updateTaskStats();
  }
}

// 编辑任务
function editTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  
  // 找到对应的任务元素
  const taskElement = document.querySelector(`.task-item[data-id="${taskId}"]`);
  if (!taskElement) return;
  
  // 准备编辑表单HTML
  const editHtml = `
    <div class="task-edit-form flex flex-col gap-2 w-full">
      <input
        type="text"
        class="task-edit-input"
        value="${escapeHTML(task.text)}"
        placeholder="任务内容..."
      >
      <input
        type="datetime-local"
        class="task-edit-due-date px-3 py-2 border border-gray-300 rounded-md"
        ${task.dueDate ? `value="${formatDateTimeLocal(new Date(task.dueDate))}"` : ''}
      >
      <div class="task-edit-actions flex gap-2 justify-end">
        <button class="task-edit-cancel px-3 py-1 border border-gray-300 rounded-md text-neutral hover:bg-gray-100">
          取消
        </button>
        <button class="task-edit-save px-3 py-1 bg-primary text-white rounded-md hover:bg-primary/90">
          保存
        </button>
      </div>
    </div>
  `;
  
  // 保存原始任务内容
  const originalContent = taskElement.innerHTML;
  
  // 替换任务内容为编辑表单
  taskElement.innerHTML = editHtml;
  
  // 获取编辑表单元素
  const editInput = taskElement.querySelector('.task-edit-input');
  const editDueDate = taskElement.querySelector('.task-edit-due-date');
  const saveBtn = taskElement.querySelector('.task-edit-save');
  const cancelBtn = taskElement.querySelector('.task-edit-cancel');
  
  // 聚焦输入框并选中所有文本
  editInput.focus();
  editInput.select();
  
  // 处理保存事件
  function handleSave() {
    const newText = editInput.value.trim();
    const newDueDate = editDueDate.value ? new Date(editDueDate.value).toISOString() : null;
    
    if (newText !== '') {
      task.text = newText;
      task.dueDate = newDueDate;
      saveTasks();
    }
    
    renderTasks();
  }
  
  // 处理取消事件
  function handleCancel() {
    renderTasks();
  }
  
  // 绑定事件监听器
  saveBtn.addEventListener('click', handleSave);
  cancelBtn.addEventListener('click', handleCancel);
  
  // 绑定键盘事件
  editInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  });
  
  // 点击编辑表单外部取消编辑
  document.addEventListener('click', function handleClickOutside(event) {
    if (!taskElement.contains(event.target)) {
      renderTasks();
      document.removeEventListener('click', handleClickOutside);
    }
  });
}

// 删除任务
function deleteTask(taskId) {
  // 显示确认对话框
  if (confirm('确定要删除这个任务吗？')) {
    tasks = tasks.filter(t => t.id !== taskId);
    saveTasks();
    renderTasks();
    updateTaskStats();
  }
}

// 清除已完成任务
function clearCompletedTasks() {
  const completedTasks = tasks.filter(t => t.completed);
  
  // 如果没有已完成的任务，不执行任何操作
  if (completedTasks.length === 0) {
    return;
  }
  
  // 显示确认对话框
  if (confirm(`确定要清除所有 ${completedTasks.length} 个已完成的任务吗？`)) {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    renderTasks();
    updateTaskStats();
  }
}

// 更新任务统计信息
function updateTaskStats() {
  const totalCount = tasks.length;
  const completedCount = tasks.filter(task => task.completed).length;
  
  completedCountEl.textContent = completedCount;
  totalCountEl.textContent = totalCount;
}

// HTML转义函数，防止XSS攻击
function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 日期格式化函数
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 格式化日期为datetime-local输入框格式
function formatDateTimeLocal(date) {
  // 移除时区信息，仅保留年月日时分
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// 添加动画类
document.head.insertAdjacentHTML('beforeend', `
  <style>
    .animate-shake {
      animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
      transform: translate3d(0, 0, 0);
      backface-visibility: hidden;
      perspective: 1000px;
    }
    
    @keyframes shake {
      10%, 90% { transform: translate3d(-1px, 0, 0); }
      20%, 80% { transform: translate3d(2px, 0, 0); }
      30%, 50%, 70% { transform: translate3d(-3px, 0, 0); }
      40%, 60% { transform: translate3d(3px, 0, 0); }
    }
  </style>
`);

// 当DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', initApp);