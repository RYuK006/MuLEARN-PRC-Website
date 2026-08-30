document.addEventListener('DOMContentLoaded', () => {
  const CSV_URL = 'https://docs.google.com/spreadsheets/d/1ZYYd6idMVJYUhMfbvNtAL3jiyHmxmERQHcVTI2ybyZQ/export?format=csv';
  const execomContainer = document.getElementById('execom-cards-container');

  if (!execomContainer) return;

  // Load and parse CSV
  Papa.parse(CSV_URL, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      renderExecomMembers(results.data);
    },
    error: function(err) {
      console.error('Error fetching Execom CSV:', err);
      execomContainer.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 20px;">Failed to load Execom members data.</div>';
    }
  });

  function renderExecomMembers(data) {
    // Update hardcoded numbers in the UI dynamically
    const heroCount = document.getElementById('hero-member-count');
    const statsCount = document.getElementById('stats-member-count');
    
    if (heroCount) heroCount.innerText = data.length;
    if (statsCount) statsCount.innerText = data.length;

    let html = '';
    
    data.forEach((member, index) => {
      const name = member['Name'] || 'Unknown';
      const role = member['Role'] || '';
      const photoLink = member['Photo Link'] ? member['Photo Link'].trim() : '';
      
      const initials = getInitials(name);
      
      // We can use a random color for the background if no photo
      const bgColors = ['#7c3aed', '#be185d', '#4338ca', '#d97706', '#059669', '#dc2626', '#475569', '#9333ea', '#2563eb'];
      const bgColor = bgColors[index % bgColors.length];

      let avatarHtml = '';
      if (photoLink) {
        // Transform Google Drive links to lh3.googleusercontent.com to avoid browser blocking
        let optimizedLink = photoLink;
        if (photoLink.includes('drive.google.com/uc?id=')) {
          optimizedLink = photoLink.replace('drive.google.com/uc?id=', 'lh3.googleusercontent.com/d/');
        } else if (photoLink.includes('drive.google.com/file/d/')) {
          const match = photoLink.match(/d\/([a-zA-Z0-9_-]+)/);
          if (match && match[1]) {
            optimizedLink = `https://lh3.googleusercontent.com/d/${match[1]}`;
          }
        }
        
        avatarHtml = `<img src="${escapeHTML(optimizedLink)}" alt="${escapeHTML(name)}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                      <div style="width: 100%; height: 100%; border-radius: 50%; display: none; align-items: center; justify-content: center; background-color: ${bgColor}; color: white; font-weight: 700; font-size: 1.5rem;">${initials}</div>`;
      } else {
        avatarHtml = `<div style="width: 100%; height: 100%; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: ${bgColor}; color: white; font-weight: 700; font-size: 1.5rem;">${initials}</div>`;
      }

      html += `
        <div class="member-card">
          <div class="avatar-wrapper">
            ${avatarHtml}
          </div>
          <h3 class="member-name">${escapeHTML(name)}</h3>
          <p class="member-role">${escapeHTML(role)}</p>
        </div>
      `;
    });

    execomContainer.innerHTML = html;

    // Refresh GSAP ScrollTrigger to account for the newly added DOM height
    if (window.ScrollTrigger) {
      ScrollTrigger.refresh();
    }
  }

  // Helper to extract initials from full name
  function getInitials(name) {
    if (!name) return '??';
    const words = name.trim().split(/[\s.]+/);
    if (words.length === 0) return '??';
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  // Helper to escape HTML to prevent XSS
  function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.innerText = str;
    return div.innerHTML;
  }
});
