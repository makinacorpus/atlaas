# -*- coding: utf-8 -*-

import os
from flask import render_template, request, redirect, url_for, jsonify, Response, send_from_directory, flash
from flask.ext import login
from werkzeug.utils import secure_filename
from app import app
from app.convert import convert
from app.export import export
from app.models import *
from flask.ext.login import login_required
from flask.ext.admin import helpers, expose, Admin, BaseView
from config import *

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

@app.route('/admin/convertview/', methods=['GET', 'POST'])
@login_required
def upload_file():
    if request.method == 'POST':
        file = request.files['file']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            convert(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            flash(u'La base de données a été mise à jour.')
            return redirect('/admin/convertview/')

@app.route('/export')
@login_required
def get_file():
    export()
    return redirect('/admin/dumpview/')