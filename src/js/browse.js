import { loadPromptsIndex, getUrlParam, setUrlParam, truncate } from './main.js';

let allPrompts = [];
let filteredPrompts = [];
let currentPage = 1;
const PROMPTS_PER_PAGE = 50;

async function init() {
  const index = await loadPromptsIndex();
  if (!index) {
    showError('Failed to load prompts');
    return;
  }

  allPrompts = index.prompts;

  // Populate department filter
  populateDepartmentFilter(index.departments);

  // Get initial filters from URL
  const department = getUrlParam('department');
  const search = getUrlParam('search');

  if (department) {
    document.getElementById('departmentFilter').value = department;
  }
  if (search) {
    document.getElementById('searchInput').value = search;
  }

  // Apply filters
  applyFilters();

  // Event listeners
  document.getElementById('searchInput').addEventListener('input', handleSearch);
  document.getElementById('departmentFilter').addEventListener('change', handleDepartmentChange);
  document.getElementById('sortBy').addEventListener('change', applyFilters);
  document.getElementById('clearFilters').addEventListener('click', clearFilters);
}

function populateDepartmentFilter(departments) {
  const select = document.getElementById('departmentFilter');
  departments.forEach(dept => {
    const option = document.createElement('option');
    option.value = dept.name;
    option.textContent = `${dept.icon} ${dept.name}`;
    select.appendChild(option);
  });
}

function handleSearch() {
  const query = document.getElementById('searchInput').value.trim();
  if (query) {
    setUrlParam('search', query);
  } else {
    const url = new URL(window.location);
    url.searchParams.delete('search');
    window.history.pushState({}, '', url);
  }
  currentPage = 1;
  applyFilters();
}

function handleDepartmentChange() {
  const dept = document.getElementById('departmentFilter').value;
  if (dept) {
    setUrlParam('department', dept);
  } else {
    const url = new URL(window.location);
    url.searchParams.delete('department');
    window.history.pushState({}, '', url);
  }
  currentPage = 1;
  applyFilters();
}

function clearFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('departmentFilter').value = '';
  document.getElementById('sortBy').value = 'title';
  window.history.pushState({}, '', window.location.pathname);
  currentPage = 1;
  applyFilters();
}

function applyFilters() {
  const search = document.getElementById('searchInput').value.toLowerCase().trim();
  const department = document.getElementById('departmentFilter').value;
  const sortBy = document.getElementById('sortBy').value;

  // Filter
  filteredPrompts = allPrompts.filter(prompt => {
    const matchesSearch = !search ||
      prompt.title.toLowerCase().includes(search) ||
      prompt.description.toLowerCase().includes(search) ||
      prompt.subcategory.toLowerCase().includes(search) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(search));

    const matchesDepartment = !department || prompt.department === department;

    return matchesSearch && matchesDepartment;
  });

  // Sort
  filteredPrompts.sort((a, b) => {
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    } else if (sortBy === 'date') {
      return new Date(b.date) - new Date(a.date);
    } else if (sortBy === 'department') {
      return a.department.localeCompare(b.department) || a.title.localeCompare(b.title);
    }
    return 0;
  });

  // Update UI
  updateResultsCount();
  renderPrompts();
  renderPagination();
}

function updateResultsCount() {
  const search = document.getElementById('searchInput').value.trim();
  const department = document.getElementById('departmentFilter').value;
  const isFiltered = search || department;

  // Show "2000+" when not filtered, otherwise show actual count
  document.getElementById('resultsCount').textContent = isFiltered
    ? filteredPrompts.length.toLocaleString()
    : '2000+';
}

function renderPrompts() {
  const grid = document.getElementById('promptsGrid');
  const start = (currentPage - 1) * PROMPTS_PER_PAGE;
  const end = start + PROMPTS_PER_PAGE;
  const pagePrompts = filteredPrompts.slice(start, end);

  if (pagePrompts.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-12">
        <div class="text-6xl mb-4">🔍</div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">No prompts found</h3>
        <p class="text-gray-600 dark:text-gray-400">Try adjusting your filters</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = pagePrompts.map(prompt => `
    <a href="/view.html?id=${prompt.id}" class="prompt-card group animate-fade-in">
      <div class="relative">
        <div class="flex items-start gap-4 mb-4">
          <span class="text-4xl">${prompt.icon}</span>
          <div class="flex-1 min-w-0">
            <div class="badge badge-primary text-xs mb-2">
              ${prompt.department}
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 tracking-tight">
              ${prompt.title}
            </h3>
          </div>
        </div>

        <p class="text-gray-600 dark:text-gray-400 mb-5 line-clamp-3 leading-relaxed">
          ${truncate(prompt.description, 150)}
        </p>

        ${prompt.tags.length > 0 ? `
          <div class="flex flex-wrap gap-2 mb-5">
            ${prompt.tags.slice(0, 3).map(tag => `
              <span class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-lg font-medium">
                ${tag}
              </span>
            `).join('')}
          </div>
        ` : ''}

        <div class="flex items-center justify-between pt-5 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 font-medium">
            ${prompt.images.length > 0 ? '<span>📷</span>' : ''}
            <span>${prompt.word_count} words</span>
          </div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="text-primary-600 dark:text-primary-400 transform group-hover:translate-x-2 transition-transform">
            <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </a>
  `).join('');
}

function renderPagination() {
  const pagination = document.getElementById('pagination');
  const totalPages = Math.ceil(filteredPrompts.length / PROMPTS_PER_PAGE);

  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  let buttons = [];

  // Previous button
  buttons.push(`
    <button class="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold
                   ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-500 dark:hover:border-primary-400'}
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            ${currentPage === 1 ? 'disabled' : ''}
            onclick="window.goToPage(${currentPage - 1})">
      ← Previous
    </button>
  `);

  // Page numbers (show max 7)
  let startPage = Math.max(1, currentPage - 3);
  let endPage = Math.min(totalPages, startPage + 6);

  if (endPage - startPage < 6) {
    startPage = Math.max(1, endPage - 6);
  }

  if (startPage > 1) {
    buttons.push(`<button class="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-primary-500 dark:hover:border-primary-400" onclick="window.goToPage(1)">1</button>`);
    if (startPage > 2) buttons.push('<span class="px-2 text-gray-500">...</span>');
  }

  for (let i = startPage; i <= endPage; i++) {
    buttons.push(`
      <button class="px-4 py-2 border-2 rounded-lg font-semibold transition-colors
                     ${i === currentPage
                       ? 'bg-primary-600 dark:bg-primary-500 border-primary-600 dark:border-primary-500 text-white'
                       : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-primary-500 dark:hover:border-primary-400'}"
              onclick="window.goToPage(${i})">
        ${i}
      </button>
    `);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) buttons.push('<span class="px-2 text-gray-500">...</span>');
    buttons.push(`<button class="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-primary-500 dark:hover:border-primary-400" onclick="window.goToPage(${totalPages})">${totalPages}</button>`);
  }

  // Next button
  buttons.push(`
    <button class="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold
                   ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-500 dark:hover:border-primary-400'}
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            ${currentPage === totalPages ? 'disabled' : ''}
            onclick="window.goToPage(${currentPage + 1})">
      Next →
    </button>
  `);

  pagination.innerHTML = buttons.join('');
}

window.goToPage = function(page) {
  currentPage = page;
  renderPrompts();
  renderPagination();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

function showError(message) {
  document.getElementById('promptsGrid').innerHTML = `
    <div class="col-span-full text-center py-12">
      <div class="text-6xl mb-4">⚠️</div>
      <h3 class="text-2xl font-bold text-red-600 mb-2">Error</h3>
      <p class="text-gray-600 dark:text-gray-400">${message}</p>
    </div>
  `;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
