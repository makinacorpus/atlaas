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
 
    admins = [adm for adm in app.config["MAIL_DEFAULT_TO"].split(",")]
    #persons = [p["courriel"] for p in review_json["_source"]["personnes"]]

    title = review_json["_source"]["titre"]
    url_frontend = "%s/#login" % app.config["FRONTEND"]

    msg = Message()
    msg.subject = u"Nouvelle modification sur '%s'" % title
    
    for emails in [admins]:#, persons]:
       if emails is admins:
          msg.html = u"Bonjour, <br> Des modifications ont été apportées sur la fiche <a href='%s'>%s</a> <br> Cordialement. <br> L'équipe d'atlaas" % (url_frontend, title)
       else:
          msg.html = u"Bonjour, <br> Des modifications ont été apportées sur la fiche '%s'. <br> La fiche est en cours de modération.<br> Cordialement <br> L'équipe d'atlaas" % title
       for email in emails:
          msg.recipients = [email]
          try:
             mail.send(msg)
          except Exception as e:
	     return jsonify({"status": False})

    return jsonify({"status": True})

