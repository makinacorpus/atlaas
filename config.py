import os.path as op

ADMIN='admin'
PASSWORD='admin'
BASE_DIR = op.dirname(__file__)

SECRET_KEY = 'development key'
UPLOAD_FOLDER = op.join(BASE_DIR, 'data')
CONVERSION_FOLDER = op.join(BASE_DIR, 'data/conversion')
EXPORT_FOLDER = op.join(BASE_DIR, 'data/export')
ALLOWED_EXTENSIONS = set(['xls'])
DATABASE_FILE = 'app.sqlite'
SQLALCHEMY_DATABASE_URI = 'sqlite:///' + DATABASE_FILE
SQLALCHEMY_RECORD_QUERIES = True
ERROR_MAIL_FROM = 'foo@a.com'
ERROR_MAIL_TO = 'foo@abcom'
ELASTICSEARCH = 'http://elastic.foo.net/atlaas'


MAIL_SERVER = ''
MAIL_PORT = 465
MAIL_USE_TLS = False
MAIL_USE_SSL = True
MAIL_USERNAME = ''
MAIL_PASSWORD = ''
MAIL_DEBUG = False
MAIL_DEFAULT_SENDER = 'astreinte@a.com'
MAIL_MAX_EMAILS = None
TESTING = True
