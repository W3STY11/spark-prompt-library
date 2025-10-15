import{l as n}from"./main-M4-12AxP.js";async function a(){const e=await n();if(!e){document.getElementById("departmentsGrid").innerHTML='<div class="col-span-full text-center text-red-600">Failed to load prompts index</div>';return}const t=document.getElementById("totalPromptsCount");t&&(t.textContent="2000+"),o(e.departments)}function o(e){const t=document.getElementById("departmentsGrid");t&&(t.innerHTML=e.map(r=>`
    <a href="/browse.html?department=${encodeURIComponent(r.name)}"
       class="department-card group animate-fade-in">
      <div class="relative">
        <div class="flex items-center gap-5 mb-5">
          <div class="text-6xl">${r.icon}</div>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors tracking-tight">
            ${r.name}
          </h3>
        </div>
        <p class="text-gray-600 dark:text-gray-400 mb-6 text-lg leading-relaxed">
          ${r.description.replace(/professional /gi,"").replace(/\d+\s+\w+\s+prompts/gi,"").trim()}
        </p>
        <div class="flex items-center justify-between pt-5 border-t border-gray-200 dark:border-gray-700">
          <span class="text-gray-600 dark:text-gray-400 font-medium">Browse</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="text-primary-600 dark:text-primary-400 transform group-hover:translate-x-2 transition-transform">
            <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </a>
  `).join(""))}document.addEventListener("DOMContentLoaded",a);
