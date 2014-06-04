import os
import sys
from flask import Flask, url_for, redirect, render_template, request
from flask.ext.sqlalchemy import SQLAlchemy
from wtforms import form, fields, validators
from flask.ext import admin, login
from flask.ext.admin.contrib import sqla
from flask.ext.admin import helpers, expose
from config import *
import logging
from logging.handlers import SMTPHandler
from logging import StreamHandler
CONFIG_MODULE = os.environ.get('FLASK_MODULE', 'config')
# Create Flask application
app = Flask(__name__)
app.config.from_object(CONFIG_MODULE)

# Create in-memory database
import sqlalchemy.exc
db = SQLAlchemy(app)

from app import auth
from app.models import *
from logging import Formatter

ADMINS = app.config['ERROR_MAIL_TO'].split(',')
if not app.debug:
    mail_handler = SMTPHandler(
        '127.0.0.1',
        app.config['ERROR_MAIL_FROM'],
        ADMINS, '[flask atlaas_backend ERROR]')
    mail_handler.setLevel(logging.ERROR)
    mail_handler.setFormatter(Formatter(
'''
Message type:       %(levelname)s
Location:           %(pathname)s:%(lineno)d
Module:             %(module)s
Function:           %(funcName)s
Time:               %(asctime)s

Message:

%(message)s
'''))

    err_handler = StreamHandler(sys.stderr)
    err_handler.setLevel(logging.ERROR)
    err_handler.setFormatter(Formatter(
        '%(asctime)s %(levelname)s: %(message)s '
        '[in %(pathname)s:%(lineno)d]'))
    app.logger.addHandler(mail_handler)
    app.logger.addHandler(err_handler)






def build_sample_db():
    """
    Populate a small db with some example entries.
    """
    import string

    try:
        db.drop_all()
    except sqlalchemy.exc.OperationalError, exc:
        if 'unable to open database file' in exc.message:
            pass
        else:
            raise
    db.create_all()
    admin_user = User(login=app.config['ADMIN'],
                      password=app.config['PASSWORD'])
    db.session.add(admin_user)

    db.session.commit()
    return

build_sample_db()

from app import views
