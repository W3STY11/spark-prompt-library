import{l as s,b as n,t as i}from"./main-M4-12AxP.js";async function d(){const e=await s();if(!e){c("Failed to load prompts");return}const r=n();if(r.length===0){l();return}const t=e.prompts.filter(a=>r.includes(a.id));o(t)}function o(e){const r=document.getElementById("favoritesGrid");r.innerHTML=e.map(t=>`
    <a href="/view.html?id=${t.id}" class="prompt-card group animate-fade-in">
      <div class="flex items-start gap-3 mb-3">
        <span class="text-3xl">${t.icon}</span>
        <div class="flex-1 min-w-0">
          <div class="badge badge-primary text-xs mb-2">
            ${t.department}
          </div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
            ${t.title}
          </h3>
        </div>
      </div>

      <p class="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 text-sm leading-relaxed">
        ${i(t.description,150)}
      </p>

      <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span class="text-yellow-500">★</span>
          <span>${t.word_count} words</span>
        </div>
        <span class="text-xl text-primary-600 dark:text-primary-400 transform group-hover:translate-x-1 transition-transform">
          →
        </span>
      </div>
    </a>
  `).join("")}function l(){document.getElementById("favoritesGrid").innerHTML="",document.getElementById("emptyState").classList.remove("hidden")}function c(e){document.getElementById("favoritesGrid").innerHTML=`
    <div class="col-span-full text-center py-12">
      <div class="text-6xl mb-4">⚠️</div>
      <h3 class="text-2xl font-bold text-red-600 mb-2">Error</h3>
      <p class="text-gray-600 dark:text-gray-400">${e}</p>
    </div>
  `}document.addEventListener("DOMContentLoaded",d);
