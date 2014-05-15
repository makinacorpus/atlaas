import os.path as op

BASE_DIR = op.dirname(__file__)

SECRET_KEY = 'development key'
UPLOAD_FOLDER = op.join(BASE_DIR,'data')
CONVERSION_FOLDER = op.join(BASE_DIR,'data/conversion')
EXPORT_FOLDER = op.join(BASE_DIR,'data/export')
ALLOWED_EXTENSIONS = set(['xls'])
DATABASE_FILE = 'app.sqlite'
SQLALCHEMY_DATABASE_URI = 'sqlite:///' + DATABASE_FILE
SQLALCHEMY_RECORD_QUERIES = True