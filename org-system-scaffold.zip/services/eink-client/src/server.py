import io
import os
from datetime import datetime
from flask import Flask, jsonify, send_file
from PIL import Image, ImageDraw

app = Flask(__name__)
PORT = int(os.getenv('PORT', '8090'))


def build_preview_image():
    image = Image.new('RGB', (800, 480), 'white')
    draw = ImageDraw.Draw(image)
    draw.rectangle((20, 20, 780, 80), outline='black', width=2)
    draw.text((40, 40), 'org-system e-ink preview', fill='black')
    draw.text((40, 110), f'Generated: {datetime.utcnow().isoformat()}Z', fill='black')
    draw.text((40, 150), 'Calendar', fill='black')
    draw.text((40, 180), '09:00 Sample event', fill='black')
    draw.text((40, 215), '14:00 Sample follow-up', fill='black')
    draw.text((40, 280), 'Tasks', fill='black')
    draw.text((40, 310), '- Sample task', fill='black')
    draw.text((40, 345), '- Completed sample', fill='black')
    buffer = io.BytesIO()
    image.save(buffer, format='PNG')
    buffer.seek(0)
    return buffer


@app.get('/health')
def health():
    return jsonify({'ok': True, 'service': 'eink-client', 'mode': os.getenv('DISPLAY_MODE', 'preview')})


@app.get('/preview')
def preview():
    return send_file(build_preview_image(), mimetype='image/png')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT)
