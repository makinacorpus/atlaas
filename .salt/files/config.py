#!/usr/bin/env python
{% set cfg = salt['mc_utils.json_load'](data) %}
{% set data = cfg.data %}
ADMIN='{{data.ADMIN}}'
PASSWORD='{{data.PASSWORD}}'
BASE_DIR = "{{data.appdata_root}}"
SECRET_KEY = "{{data.SECRET_KEY}}"
UPLOAD_FOLDER = "{{data.UPLOAD_FOLDER}}"
CONVERSION_FOLDER = "{{data.CONVERSION_FOLDER}}"
EXPORT_FOLDER = "{{data.EXPORT_FOLDER}}"
ALLOWED_EXTENSIONS = set(['xls'])
DATABASE_FILE = "{{data.DATABASE_FILE}}"
SQLALCHEMY_DATABASE_URI = "{{data.SQLALCHEMY_DATABASE_URI}}"
{% if data.SQLALCHEMY_RECORD_QUERIES %}
SQLALCHEMY_RECORD_QUERIES = True
{% else %}
SQLALCHEMY_RECORD_QUERIES = False
{% endif %}
ERROR_MAIL_FROM = "{{data.ERROR_MAIL_FROM}}"
ERROR_MAIL_TO = "{{data.ERROR_MAIL_TO}}"
# vim:set et sts=4 ts=4 tw=80:
