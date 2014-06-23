# -*- coding: utf-8 -*-

import os
import requests
import json

from flask import request, redirect, jsonify, flash, send_file
from werkzeug.utils import secure_filename
from app import app, mail
from app.convert import convert
from app.export import export
from app.models import *
from flask.ext.login import login_required
from config import *
from flask_mail import Message


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
    response = send_file(export(), as_attachment=True, attachment_filename='ATLAAS-EXPORT.xls')
    return response


@app.route('/notify', methods=['GET', 'POST'])
def notify_user():
    id = request.args.get("id")
    review = requests.get("%s/review/%s" % (app.config["ELASTICSEARCH"], id))

    review_json = json.loads(review.content)
    title = review_json["_source"]["titre"]
    url_frontend = app.config["FRONTEND"]

    msg = Message()
    msg.recipients = [p["courriel"] for p in review_json["_source"]["personnes"]]
    msg.subject = u"Nouvelle modification sur '%s'" % title
    msg.html = u"Bonjour, <br> Des modifications ont été apportées sur la fiche de '%s. <a href='%s'>Page des reviews</a> <br> Cordialement. <br> L'équipe d'atlaas'" % (title, url_frontend)

    try:
        mail.send(msg)
        return jsonify({"status": True})
    except:
        return jsonify({"status": False})
