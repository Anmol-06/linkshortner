document.addEventListener('DOMContentLoaded', function() {
    const urlInput = document.getElementById('urlInput');
    const shortenBtn = document.getElementById('shortenBtn');
    const result = document.getElementById('result');
    const error = document.getElementById('error');
    const shortUrl = document.getElementById('shortUrl');
    const copyBtn = document.getElementById('copyBtn');
    const originalUrl = document.getElementById('originalUrl');
    const showUrlsBtn = document.getElementById('showUrlsBtn');
    const urlsList = document.getElementById('urlsList');
    const urlsTable = document.getElementById('urlsTable');

    shortenBtn.addEventListener('click', shortenUrl);
    urlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            shortenUrl();
        }
    });

    copyBtn.addEventListener('click', function() {
        shortUrl.select();
        document.execCommand('copy');
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = 'Copy';
        }, 2000);
    });

    showUrlsBtn.addEventListener('click', function() {
        if (urlsList.classList.contains('hidden')) {
            loadAllUrls();
            urlsList.classList.remove('hidden');
            showUrlsBtn.textContent = 'Hide URLs';
        } else {
            urlsList.classList.add('hidden');
            showUrlsBtn.textContent = 'View All URLs';
        }
    });

    function shortenUrl() {
        const url = urlInput.value.trim();
        
        if (!url) {
            showError('Please enter a URL');
            return;
        }

        shortenBtn.disabled = true;
        shortenBtn.textContent = 'Shortening...';

        fetch('/shorten', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showError(data.error);
            } else {
                showResult(data.short_url, data.long_url);
            }
        })
        .catch(err => {
            showError('An error occurred. Please try again.');
        })
        .finally(() => {
            shortenBtn.disabled = false;
            shortenBtn.textContent = 'Shorten URL';
        });
    }

    function showResult(short, original) {
        error.classList.add('hidden');
        shortUrl.value = short;
        originalUrl.textContent = original;
        result.classList.remove('hidden');
    }

    function showError(message) {
        result.classList.add('hidden');
        error.textContent = message;
        error.classList.remove('hidden');
    }

    function loadAllUrls() {
        fetch('/api/urls')
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                urlsTable.innerHTML = '<p style="color: #666;">No URLs shortened yet.</p>';
            } else {
                let html = '';
                data.forEach(item => {
                    html += `
                        <div class="url-item">
                            <span class="url-item-code">${item.short_code}</span>
                            <span class="url-item-long">${item.long_url}</span>
                        </div>
                    `;
                });
                urlsTable.innerHTML = html;
            }
        })
        .catch(err => {
            urlsTable.innerHTML = '<p style="color: #dc3545;">Error loading URLs.</p>';
        });
    }
});
