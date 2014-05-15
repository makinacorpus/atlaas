import os
from flask import Flask, url_for, redirect, render_template, request
from flask.ext.sqlalchemy import SQLAlchemy
from wtforms import form, fields, validators
from flask.ext import admin, login
from flask.ext.admin.contrib import sqla
from flask.ext.admin import helpers, expose
from config import *


# Create Flask application
app = Flask(__name__)
app.config.from_object('config')

# Create in-memory database
db = SQLAlchemy(app)

from app import auth
from app.models import *


def build_sample_db():
    """
    Populate a small db with some example entries.
    """

    import string

    db.drop_all()
    db.create_all()
    admin_user = User(login="admin", password="admin")
    db.session.add(admin_user)

    db.session.commit()
    return

build_sample_db()

from app import views