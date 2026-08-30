document.addEventListener('DOMContentLoaded', () => {
  const galleryContainer = document.getElementById('dynamic-gallery');
  const csvUrl = 'https://docs.google.com/spreadsheets/d/11JIQggHbJm7CDhUfpGlbMKMutcmV6PsINDIS-M9bK78/export?format=csv';

  // Create loading state with 3 scrolling wrappers
  let skeletonsHtml = '';
  for (let i = 0; i < 3; i++) {
    const animationDir = i % 2 === 0 ? 'scrollLeft' : 'scrollRight';
    skeletonsHtml += `
      <div class="scrolling-wrapper">
        <div class="scrolling-track" style="animation-name: ${animationDir}; animation-duration: 40s;">
          <div class="photo-col col-lg"><div class="photo-frame" style="height: 100%;">Loading...</div></div>
          <div class="photo-col col-md"><div class="photo-frame" style="height: 100%;">Loading...</div></div>
          <div class="photo-col col-sm"><div class="photo-frame" style="height: 100%;">Loading...</div></div>
          <div class="photo-col col-lg"><div class="photo-frame" style="height: 100%;">Loading...</div></div>
          <div class="photo-col col-md"><div class="photo-frame" style="height: 100%;">Loading...</div></div>
        </div>
      </div>
    `;
  }
  galleryContainer.innerHTML = skeletonsHtml;

  Papa.parse(csvUrl, {
    download: true,
    header: false,
    complete: function(results) {
      const rows = results.data;
      let validUrls = [];

      rows.forEach((row) => {
        const rawUrl = row[0];
        if (!rawUrl || typeof rawUrl !== 'string') return;
        const match = rawUrl.match(/d\/([a-zA-Z0-9_-]+)\/view/);
        if (match && match[1]) {
          // Use the lh3.googleusercontent.com workaround instead of thumbnail to avoid 302 redirect tracking blocks
          validUrls.push(`https://lh3.googleusercontent.com/d/${match[1]}`);
        }
      });

      if (validUrls.length === 0) {
        galleryContainer.innerHTML = '<p style="text-align: center; color: var(--color-muted);">No images found in gallery.</p>';
        return;
      }

      // Split the URLs into 3 chunks for the 3 horizontal rows
      const chunk1 = [];
      const chunk2 = [];
      const chunk3 = [];
      
      validUrls.forEach((url, i) => {
        if (i % 3 === 0) chunk1.push(url);
        else if (i % 3 === 1) chunk2.push(url);
        else chunk3.push(url);
      });

      galleryContainer.innerHTML = ''; // Clear skeletons

      // Helper function to build a scrolling track's HTML given an array of URLs
      const buildTrackHtml = (urls, animationName, duration) => {
        let trackHtml = `<div class="scrolling-wrapper">
                          <div class="scrolling-track" style="animation-name: ${animationName}; animation-duration: ${duration}s;">`;
        
        // We build the set of images, and then duplicate it once inside the track for infinite seamless scrolling
        const buildSet = () => {
          let setHtml = '';
          urls.forEach((url, index) => {
            // Apply varied widths based on index to mimic the Bento/Masonry feel horizontally
            let colClass = 'col-md';
            if (index % 4 === 0) colClass = 'col-lg';
            else if (index % 3 === 0) colClass = 'col-sm';

            setHtml += `
              <div class="photo-col ${colClass}">
                <div class="photo-frame" style="height: 100%;">
                  <img src="${url}" loading="lazy" alt="Gallery Image" onerror="this.style.display='none'">
                </div>
              </div>
            `;
          });
          return setHtml;
        };

        const imageSet = buildSet();
        trackHtml += imageSet;
        trackHtml += imageSet; // Duplicated for seamless infinite scroll
        
        trackHtml += `</div></div>`;
        return trackHtml;
      };

      // Add the 3 tracks: Top scrolls left, Middle scrolls right, Bottom scrolls left
      galleryContainer.innerHTML += buildTrackHtml(chunk1, 'scrollLeft', 60);
      galleryContainer.innerHTML += buildTrackHtml(chunk2, 'scrollRight', 50);
      galleryContainer.innerHTML += buildTrackHtml(chunk3, 'scrollLeft', 55);

      // Refresh ScrollTrigger since DOM height might have changed
      if (window.ScrollTrigger) {
        setTimeout(() => ScrollTrigger.refresh(), 500);
      }
    },
    error: function(err) {
      console.error('Failed to load gallery CSV:', err);
      galleryContainer.innerHTML = '<p style="text-align: center; color: var(--color-muted);">Failed to load gallery images.</p>';
    }
  });
});
