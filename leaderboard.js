document.addEventListener('DOMContentLoaded', () => {
  const CSV_URL = 'https://docs.google.com/spreadsheets/d/1C3nNTx1Q9Bwer5AgK8N_4ZDiAbq7BGAh-wC2-puXjNQ/export?format=csv';
  const leaderboardBody = document.getElementById('leaderboard-body');

  // Load and parse CSV
  Papa.parse(CSV_URL, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      renderLeaderboard(results.data);
    },
    error: function(err) {
      console.error('Error fetching CSV:', err);
      if (leaderboardBody) {
        leaderboardBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">Failed to load leaderboard data.</td></tr>';
      }
    }
  });

  function renderLeaderboard(data) {
    if (!leaderboardBody) return;

    let totalKarma = 0;

    // Filter and transform data
    let students = data
      .filter(row => row.rank && !isNaN(parseInt(row.rank))) // Ensure valid rank
      .map(row => {
        const karma = parseInt(row.karma) || 0;
        totalKarma += karma;
        return {
          fullName: row.full_name || 'Unknown',
          muid: row.muid || '-',
          karma: karma,
          rank: parseInt(row.rank) || 999999,
          level: parseLevel(row.level)
        };
      });

    // Sort by rank ascending
    students.sort((a, b) => a.rank - b.rank);

    // Generate HTML
    let html = '';
    students.forEach((student, index) => {
      // Determine Rank formatting
      let rankHtml = '';
      if (student.rank === 1) {
        rankHtml = '<div class="rank-badge badge-gold">🥇</div>';
      } else if (student.rank === 2) {
        rankHtml = '<div class="rank-badge badge-silver">🥈</div>';
      } else if (student.rank === 3) {
        rankHtml = '<div class="rank-badge badge-bronze">🥉</div>';
      } else {
        rankHtml = `<div class="rank-number">${student.rank}</div>`;
      }

      // Determine initials for Avatar
      const initials = getInitials(student.fullName);
      // Randomize background color between 1 and 5
      const bgIndex = (index % 5) + 1; 

      // Formatting Karma points class
      const pointsClass = student.rank <= 3 ? 'lb-points points-top' : 'lb-points';

      html += `
        <tr class="leaderboard-row">
          <td>
            ${rankHtml}
          </td>
          <td>
            <div class="lb-member-info">
              <div class="lb-avatar bg-avatar-${bgIndex}">${initials}</div>
              <div class="lb-details">
                <span class="lb-name">${escapeHTML(student.fullName)}</span>
                <span class="lb-level">${escapeHTML(student.level)}</span>
              </div>
            </div>
          </td>
          <td>
            <span class="col-muid" style="font-family: monospace; font-size: 0.85rem;">${escapeHTML(student.muid)}</span>
          </td>
          <td>
            <span class="${pointsClass}">${student.karma.toLocaleString()}</span>
          </td>
        </tr>
      `;
    });

    leaderboardBody.innerHTML = html;

    // Refresh GSAP ScrollTrigger to account for the newly added DOM height
    if (window.ScrollTrigger) {
      ScrollTrigger.refresh();
    }

    // Update Total Karma
    const totalKarmaEl = document.getElementById('stats-total-karma');
    if (totalKarmaEl && window.animateCountUp) {
      totalKarmaEl.innerText = totalKarma;
      window.animateCountUp(totalKarmaEl);
    }
  }

  // Helper to parse 'lvl1' to 'Level 1'
  function parseLevel(levelStr) {
    if (!levelStr) return 'Level 0';
    const match = levelStr.match(/\d+/);
    if (match) {
      return `Level ${match[0]}`;
    }
    return levelStr;
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
    const div = document.createElement('div');
    div.innerText = str;
    return div.innerHTML;
  }
});
