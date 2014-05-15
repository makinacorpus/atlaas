import os
from sqlalchemy.orm import synonym
from flask import Flask, url_for, redirect, render_template, request
from flask.ext.sqlalchemy import SQLAlchemy
from wtforms import form, fields, validators
from werkzeug.security import generate_password_hash, check_password_hash
from flask.ext import admin, login
from flask.ext.admin.contrib import sqla
from flask.ext.login import login_required
from flask.ext.admin import helpers, expose, Admin, BaseView
from app import app, db

# Create user model. For simplicity, it will store passwords in plain text.
# Obviously that's not right thing to do in real world application.
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    login = db.Column(db.String(80), unique=True)
    email = db.Column(db.String(120))
    _password = db.Column(db.String(64))

    def _get_password(self):
        return self._password
    
    def _set_password(self, password):
        self._password = generate_password_hash(password)

    password = synonym('_password', descriptor=property(_get_password,
                                                        _set_password))

    def check_password(self, password):
        return check_password_hash(self._password, password)

    # Flask-Login integration
    def is_authenticated(self):
        return True

    def is_active(self):
        return True

    def is_anonymous(self):
        return False

    def get_id(self):
        return self.id

    # Required for administrative interface
    def __unicode__(self):
        return self.username


# Define login and registration forms (for flask-login)
class LoginForm(form.Form):
    login = fields.TextField(validators=[validators.required()])
    password = fields.PasswordField(validators=[validators.required()])

    def validate_login(self, field):
        user = self.get_user()

        if user is None:
            raise validators.ValidationError('Invalid user')

        if not user.check_password(self.password.data):
            raise validators.ValidationError('Invalid password')

    def get_user(self):
        return db.session.query(User).filter_by(login=self.login.data).first()


class RegistrationForm(form.Form):
    login = fields.TextField(validators=[validators.required()])
    email = fields.TextField()
    password = fields.PasswordField(validators=[validators.required()])

    def validate_login(self, field):
        if db.session.query(User).filter_by(login=self.login.data).count() > 0:
            raise validators.ValidationError('Duplicate username')

class ConvertView(BaseView):
    @expose('/')
    @login_required
    def index(self):
        return self.render('admin/convert.html')

class DumpView(BaseView):
    @expose('/')
    @login_required
    def index(self):
        return self.render('admin/dump.html')