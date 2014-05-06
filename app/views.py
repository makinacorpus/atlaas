import os
from flask import render_template, request, redirect, url_for, jsonify, Response
from werkzeug.utils import secure_filename
from app import app
from app.convert import convert
from config import *

@app.route('/')
def index():
	return render_template('index.html')

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        file = request.files['file']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            convert(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            return render_template('filesent.html')
    return render_template('index.html')