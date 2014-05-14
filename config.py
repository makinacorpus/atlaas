import os.path as op

SECRET_KEY = 'development key'
UPLOAD_FOLDER = 'data'
CONVERSION_FOLDER = 'data/conversion'
ALLOWED_EXTENSIONS = set(['xls'])
DATABASE_FILE = 'app.sqlite'
SQLALCHEMY_DATABASE_URI = 'sqlite:///' + DATABASE_FILE
SQLALCHEMY_RECORD_QUERIES = True