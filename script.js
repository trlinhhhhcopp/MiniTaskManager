// 1. Khởi tạo dữ liệu 5 công việc mẫu
let tasks = [
    { id: 1, name: "Thiết kế giao diện HTML CSS", date: "2026-10-15", priority: "Cao", status: "Chưa hoàn thành" },
    { id: 2, name: "Viết logic JavaScript", date: "2026-10-16", priority: "Cao", status: "Chưa hoàn thành" },
    { id: 3, name: "Kiểm tra responsive trên điện thoại", date: "2026-10-17", priority: "Trung bình", status: "Đã hoàn thành" },
    { id: 4, name: "Sửa lỗi màu sắc giao diện", date: "2026-10-18", priority: "Thấp", status: "Đã hoàn thành" },
    { id: 5, name: "Nộp bài lên host", date: "2026-10-20", priority: "Cao", status: "Chưa hoàn thành" }
];

// DOM Elements
const taskForm = document.getElementById('taskForm');
const taskNameInput = document.getElementById('taskName');
const taskDateInput = document.getElementById('taskDate');
const taskPriorityInput = document.getElementById('taskPriority');
const errorMsg = document.getElementById('errorMsg');
const dateErrorMsg = document.getElementById('dateErrorMsg');
const taskList = document.getElementById('taskList');
const searchInput = document.getElementById('searchInput');
const filterStatus = document.getElementById('filterStatus');
const taskStats = document.getElementById('taskStats');
const taskCount = document.getElementById('taskCount');

function getLocalDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function updateMinimumTaskDate() {
    taskDateInput.min = getLocalDateString();
}

function formatTaskDate(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
}

updateMinimumTaskDate();

// 2. Hàm Render hiển thị giao diện và cập nhật thống kê
function renderTasks(dataToRender) {
    taskList.innerHTML = ''; // Xóa rỗng list hiện tại

    dataToRender.forEach(task => {
        const isCompleted = task.status === "Đã hoàn thành";
        const li = document.createElement('li');
        li.className = `task-item ${isCompleted ? 'completed' : ''}`;
        
        li.innerHTML = `
            <div class="task-info">
                <span class="task-name">${task.name}</span>
                <span class="task-meta">
                    Hạn: ${task.date ? formatTaskDate(task.date) : 'Không có'} | 
                    Ưu tiên: <span class="priority-tag">${task.priority}</span>
                </span>
            </div>
            <div class="task-actions">
                <button class="btn btn-sm btn-success toggle-btn" data-id="${task.id}">
                    ${isCompleted ? 'Hoàn tác' : 'Hoàn thành'}
                </button>
                <button class="btn btn-sm btn-danger delete-btn" data-id="${task.id}">Xóa</button>
            </div>
        `;
        taskList.appendChild(li);
    });

    updateStats(dataToRender);
}

// Hàm phụ trợ cập nhật số lượng thống kê
function updateStats(currentData) {
    const total = currentData.length;
    const completed = currentData.filter(t => t.status === "Đã hoàn thành").length;
    const uncompleted = total - completed;

    taskStats.textContent = `Tổng số: ${total} | Đã hoàn thành: ${completed} | Chưa hoàn thành: ${uncompleted}`;
    taskCount.textContent = `${total} / ${tasks.length} bản ghi`;
}

// 3. Xử lý Thêm công việc
taskForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Chặn tải lại trang

    const nameValue = taskNameInput.value.trim();
    if (nameValue === "") {
        errorMsg.style.display = 'block';
        taskNameInput.focus();
        return;
    }

    updateMinimumTaskDate();
    const dateValue = taskDateInput.value;
    if (!dateValue) {
        dateErrorMsg.textContent = 'Vui lòng chọn hạn hoàn thành.';
        dateErrorMsg.style.display = 'block';
        taskDateInput.focus();
        return;
    }

    if (dateValue < taskDateInput.min) {
        dateErrorMsg.textContent = 'Hạn hoàn thành không được là ngày trước hôm nay.';
        dateErrorMsg.style.display = 'block';
        taskDateInput.focus();
        return;
    }

    // Nếu hợp lệ
    errorMsg.style.display = 'none';
    dateErrorMsg.style.display = 'none';
    const newTask = {
        id: Date.now(), // Tạo ID ngẫu nhiên bằng timestamp
        name: nameValue,
        date: dateValue,
        priority: taskPriorityInput.value,
        status: "Chưa hoàn thành"
    };

    tasks.push(newTask);
    filterAndSearch(); // Hiển thị lại danh sách
    taskForm.reset(); // Xóa trắng form
    updateMinimumTaskDate();
});

taskNameInput.addEventListener('input', function() {
    if (taskNameInput.value.trim() !== '') {
        errorMsg.style.display = 'none';
    }
});

taskDateInput.addEventListener('input', function() {
    dateErrorMsg.style.display = 'none';
});

taskDateInput.addEventListener('change', function() {
    dateErrorMsg.style.display = 'none';
});

// 4. Xử lý xóa và đổi trạng thái (Dùng Event Delegation)
taskList.addEventListener('click', function(e) {
    const id = parseInt(e.target.getAttribute('data-id'));

    // Bấm nút xóa
    if (e.target.classList.contains('delete-btn')) {
        tasks = tasks.filter(task => task.id !== id);
        filterAndSearch();
    }

    // Bấm nút hoàn thành/hoàn tác
    if (e.target.classList.contains('toggle-btn')) {
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            tasks[taskIndex].status = tasks[taskIndex].status === "Đã hoàn thành" ? "Chưa hoàn thành" : "Đã hoàn thành";
            filterAndSearch();
        }
    }
});

// 5. Xử lý Lọc và Tìm kiếm
function normalizeSearchText(value) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .trim();
}

function filterAndSearch() {
    const keyword = normalizeSearchText(searchInput.value);
    const statusVal = filterStatus.value;

    let filtered = tasks.filter(task => {
        const matchName = normalizeSearchText(task.name).includes(keyword);
        const matchStatus = (statusVal === "Tất cả") || (task.status === statusVal);
        return matchName && matchStatus;
    });

    renderTasks(filtered);
}

searchInput.addEventListener('input', filterAndSearch);
filterStatus.addEventListener('change', filterAndSearch);

// Gọi lần đầu để hiển thị dữ liệu mẫu ngay khi mở file
renderTasks(tasks);