import io
import os
from datetime import datetime
from flask import Flask, jsonify, send_file
from PIL import Image, ImageDraw
import requests
app = Flask(__name__)
PORT = int(os.getenv('PORT', '8090'))
ORG_CORE_BASE_URL = os.getenv('ORG_CORE_BASE_URL', 'http://org-core:8080')

def fetch_payload():
    try:
        response = requests.get(f'{ORG_CORE_BASE_URL}/api/display/profiles/default', timeout=2)
        response.raise_for_status()
        return response.json()
    except Exception:
        return {'profile': 'default', 'generatedAt': datetime.utcnow().isoformat() + 'Z', 'sections': [{'type': 'calendar', 'title': 'Calendar', 'items': []}, {'type': 'tasks', 'title': 'Tasks', 'items': []}, {'type': 'shopping', 'title': 'Shopping', 'items': []}]}

def build_preview_image():
    payload = fetch_payload()
    image = Image.new('RGB', (800, 480), 'white')
    draw = ImageDraw.Draw(image)
    draw.text((40, 40), 'org-system e-ink preview', fill='black')
    draw.text((40, 80), f'Generated: {payload.get("generatedAt")}', fill='black')
    y = 130
    for section in payload.get('sections', []):
        draw.text((40, y), section.get('title', 'Section'), fill='black')
        y += 30
    buffer = io.BytesIO()
    image.save(buffer, format='PNG')
    buffer.seek(0)
    return buffer, payload

@app.get('/health')
def health():
    return jsonify({'ok': True, 'service': 'eink-client'})
@app.get('/payload')
def payload():
    _, loaded = build_preview_image()
    return jsonify(loaded)
@app.get('/preview')
def preview():
    image, _ = build_preview_image()
    return send_file(image, mimetype='image/png')
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT)
