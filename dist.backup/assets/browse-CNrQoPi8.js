import{t as g,l as b,g as m,s as u}from"./main-M4-12AxP.js";let y=[],d=[],o=1;const l=50;let h="card";async function f(){const e=await b();if(!e){B("Failed to load prompts");return}y=e.prompts,w(e.departments);const t=m("department"),n=m("search");t&&(document.getElementById("departmentFilter").value=t),n&&(document.getElementById("searchInput").value=n),i(),document.getElementById("searchInput").addEventListener("input",k),document.getElementById("departmentFilter").addEventListener("change",E),document.getElementById("sortBy").addEventListener("change",i),document.getElementById("clearFilters").addEventListener("click",L),document.getElementById("viewCard").addEventListener("click",()=>p("card")),document.getElementById("viewList").addEventListener("click",()=>p("list"))}function w(e){const t=document.getElementById("departmentFilter");e.forEach(n=>{const a=document.createElement("option");a.value=n.name,a.textContent=`${n.icon} ${n.name}`,t.appendChild(a)})}function k(){const e=document.getElementById("searchInput").value.trim();if(e)u("search",e);else{const t=new URL(window.location);t.searchParams.delete("search"),window.history.pushState({},"",t)}o=1,i()}function E(){const e=document.getElementById("departmentFilter").value;if(e)u("department",e);else{const t=new URL(window.location);t.searchParams.delete("department"),window.history.pushState({},"",t)}o=1,i()}function L(){document.getElementById("searchInput").value="",document.getElementById("departmentFilter").value="",document.getElementById("sortBy").value="title",window.history.pushState({},"",window.location.pathname),o=1,i()}function i(){const e=document.getElementById("searchInput").value.toLowerCase().trim(),t=document.getElementById("departmentFilter").value,n=document.getElementById("sortBy").value;d=y.filter(a=>{const r=!e||a.title.toLowerCase().includes(e)||a.description.toLowerCase().includes(e)||a.subcategory.toLowerCase().includes(e)||a.tags.some(v=>v.toLowerCase().includes(e)),s=!t||a.department===t;return r&&s}),d.sort((a,r)=>n==="title"?a.title.localeCompare(r.title):n==="date"?new Date(r.date)-new Date(a.date):n==="department"?a.department.localeCompare(r.department)||a.title.localeCompare(r.title):0),I(),c(),x()}function I(){const e=document.getElementById("searchInput").value.trim(),t=document.getElementById("departmentFilter").value,n=e||t;document.getElementById("resultsCount").textContent=n?d.length.toLocaleString():"2000+"}function p(e){h=e,document.getElementById("viewCard").classList.toggle("active",e==="card"),document.getElementById("viewList").classList.toggle("active",e==="list");const t=document.getElementById("promptsGrid");e==="list"?(t.classList.remove("grid","grid-cols-1","md:grid-cols-2","lg:grid-cols-3","gap-6"),t.classList.add("flex","flex-col","gap-3")):(t.classList.remove("flex","flex-col","gap-3"),t.classList.add("grid","grid-cols-1","md:grid-cols-2","lg:grid-cols-3","gap-6")),c()}function c(){const e=document.getElementById("promptsGrid"),t=(o-1)*l,n=t+l,a=d.slice(t,n);if(a.length===0){e.innerHTML=`
      <div class="col-span-full text-center py-12">
        <div class="text-6xl mb-4">🔍</div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">No prompts found</h3>
        <p class="text-gray-600 dark:text-gray-400">Try adjusting your filters</p>
      </div>
    `;return}h==="list"?e.innerHTML=a.map(r=>`
      <a href="/view.html?id=${r.id}" class="prompt-list-item group animate-fade-in">
        <div class="flex items-center gap-4">
          <span class="text-3xl">${r.icon}</span>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-1">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                ${r.title}
              </h3>
              <span class="badge badge-primary text-xs flex-shrink-0">
                ${r.department}
              </span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 truncate">
              ${g(r.description,100)}
            </p>
          </div>

          <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
            ${r.images.length>0?'<span class="text-lg">📷</span>':""}
            <span class="font-medium">${r.word_count} words</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="text-primary-600 dark:text-primary-400 transform group-hover:translate-x-2 transition-transform">
              <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </a>
    `).join(""):e.innerHTML=a.map(r=>`
      <a href="/view.html?id=${r.id}" class="prompt-card group animate-fade-in">
        <div class="relative">
          <div class="flex items-start gap-4 mb-4">
            <span class="text-4xl">${r.icon}</span>
            <div class="flex-1 min-w-0">
              <div class="badge badge-primary text-xs mb-2">
                ${r.department}
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 tracking-tight">
                ${r.title}
              </h3>
            </div>
          </div>

          <p class="text-gray-600 dark:text-gray-400 mb-5 line-clamp-3 leading-relaxed">
            ${g(r.description,150)}
          </p>

          ${r.tags.length>0?`
            <div class="flex flex-wrap gap-2 mb-5">
              ${r.tags.slice(0,3).map(s=>`
                <span class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-lg font-medium">
                  ${s}
                </span>
              `).join("")}
            </div>
          `:""}

          <div class="flex items-center justify-between pt-5 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 font-medium">
              ${r.images.length>0?"<span>📷</span>":""}
              <span>${r.word_count} words</span>
            </div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="text-primary-600 dark:text-primary-400 transform group-hover:translate-x-2 transition-transform">
              <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </a>
    `).join("")}function x(){const e=document.getElementById("pagination"),t=Math.ceil(d.length/l);if(t<=1){e.innerHTML="";return}let n=[];n.push(`
    <button class="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold
                   ${o===1?"opacity-50 cursor-not-allowed":"hover:border-primary-500 dark:hover:border-primary-400"}
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            ${o===1?"disabled":""}
            onclick="window.goToPage(${o-1})">
      ← Previous
    </button>
  `);let a=Math.max(1,o-3),r=Math.min(t,a+6);r-a<6&&(a=Math.max(1,r-6)),a>1&&(n.push('<button class="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-primary-500 dark:hover:border-primary-400" onclick="window.goToPage(1)">1</button>'),a>2&&n.push('<span class="px-2 text-gray-500">...</span>'));for(let s=a;s<=r;s++)n.push(`
      <button class="px-4 py-2 border-2 rounded-lg font-semibold transition-colors
                     ${s===o?"bg-primary-600 dark:bg-primary-500 border-primary-600 dark:border-primary-500 text-white":"border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-primary-500 dark:hover:border-primary-400"}"
              onclick="window.goToPage(${s})">
        ${s}
      </button>
    `);r<t&&(r<t-1&&n.push('<span class="px-2 text-gray-500">...</span>'),n.push(`<button class="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-primary-500 dark:hover:border-primary-400" onclick="window.goToPage(${t})">${t}</button>`)),n.push(`
    <button class="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold
                   ${o===t?"opacity-50 cursor-not-allowed":"hover:border-primary-500 dark:hover:border-primary-400"}
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            ${o===t?"disabled":""}
            onclick="window.goToPage(${o+1})">
      Next →
    </button>
  `),e.innerHTML=n.join("")}window.goToPage=function(e){o=e,c(),x(),window.scrollTo({top:0,behavior:"smooth"})};function B(e){document.getElementById("promptsGrid").innerHTML=`
    <div class="col-span-full text-center py-12">
      <div class="text-6xl mb-4">⚠️</div>
      <h3 class="text-2xl font-bold text-red-600 mb-2">Error</h3>
      <p class="text-gray-600 dark:text-gray-400">${e}</p>
    </div>
  `}document.addEventListener("DOMContentLoaded",f);
