from flask import Flask, render_template, request, redirect, jsonify, url_for
import csv
import random
import os

app = Flask(__name__)

# Railway-compatible file path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_FILE = os.path.join(BASE_DIR, 'URLs.csv')

# Get domain from environment variable or use default
DOMAIN = os.environ.get('DOMAIN', 'http://localhost:5000/')

def rand_str():
    list_characters = ('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z')
    return ''.join(random.choice(list_characters) for _ in range(4))

def read_data():
    urls = {}
    if os.path.exists(CSV_FILE):
        try:
            with open(CSV_FILE, mode='r', newline='') as file:
                reader = csv.DictReader(file)
                for row in reader:
                    urls[row['short_code']] = row['long_url']
        except Exception as e:
            print(f"Error reading CSV: {e}")
    else:
        # Create the file with headers if it doesn't exist
        with open(CSV_FILE, mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(['short_code', 'long_url'])
    return urls

def add_data(short_code, long_url):
    with open(CSV_FILE, mode='a', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([short_code, long_url])

def shorten_url(long_url):
    urls = read_data()
    # Check if URL already exists
    for code, url in urls.items():
        if url == long_url:
            return code
    
    # Generate unique short code
    while True:
        short_code = rand_str()
        if short_code not in urls:
            add_data(short_code, long_url)
            return short_code

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/shorten', methods=['POST'])
def shorten():
    data = request.get_json()
    long_url = data.get('url', '').strip()
    
    if not long_url:
        return jsonify({'error': 'URL is required'}), 400
    
    # Add http:// if no protocol specified
    if not long_url.startswith(('http://', 'https://')):
        long_url = 'http://' + long_url
    
    short_code = shorten_url(long_url)
    short_url = DOMAIN + short_code
    
    return jsonify({
        'short_code': short_code,
        'short_url': short_url,
        'long_url': long_url
    })

@app.route('/api/urls')
def get_urls():
    urls = read_data()
    urls_list = [{'short_code': code, 'long_url': url} for code, url in urls.items()]
    return jsonify(urls_list)

@app.route('/<short_code>')
def redirect_to_url(short_code):
    urls = read_data()
    long_url = urls.get(short_code)
    
    if long_url:
        return redirect(long_url)
    else:
        return render_template('404.html', short_code=short_code), 404

if __name__ == '__main__':
    # Get port from environment variable (Railway provides this)
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)

