{% import "makina-states/localsettings/nodejs/prefix/prerequisites.sls" as node with context %}
{% import "makina-states/services/monitoring/circus/macros.jinja" as circus with context %}
{% import "makina-states/services/http/nginx/init.sls" as nginx %}

{% set cfg = opts.ms_project %}
{% set data = cfg.data %}
{% set scfg = salt['mc_utils.json_dump'](cfg) %}

include:
  - makina-states.services.http.nginx
  - makina-states.services.monitoring.circus

{{cfg.name}}-www-data:
  user.present:
    - name: www-data
    - optional_groups:
      - {{cfg.group}}
    - remove_groups: false

prepreqs-{{cfg.name}}:
  pkg.installed:
    - names:
      - nginx
      - sqlite3
      - libsqlite3-dev
      - apache2-utils
      - libcurl4-gnutls-dev

{{cfg.name}}-buildout:
  file.managed:
    - name: {{cfg.project_root}}/salt.cfg
    - source: salt://makina-projects/{{cfg.name}}/files/salt.cfg
    - template: jinja
    - user: {{cfg.user}}
    - data: |
            {{scfg}}
    - group: {{cfg.group}}
    - makedirs: true
    - watch:
      - pkg: prepreqs-{{cfg.name}}
      - user: {{cfg.name}}-www-data
  buildout.installed:
    - config: salt.cfg
    - name: {{cfg.project_root}}
    - user: {{cfg.user}}
    - watch:
      - file: {{cfg.name}}-buildout
      - pkg: prepreqs-{{cfg.name}}
      - user: {{cfg.name}}-www-data
    - user: {{cfg.user}}
    - group: {{cfg.group}}

{{cfg.name}}-dirs:
  file.directory:
    - makedirs: true
    - watch:
      - buildout: {{cfg.name}}-buildout
      - pkg: prepreqs-{{cfg.name}}
      - user: {{cfg.name}}-www-data
    - names:
      - {{cfg.data_root}}
      - {{data.CONVERSION_FOLDER}}
      - {{data.EXPORT_FOLDER}}
      - {{data.UPLOAD_FOLDER}}

{{cfg.name}}-config:
  file.managed:
    - name: {{cfg.project_root}}/salt_config.py
    - source: salt://makina-projects/{{cfg.name}}/files/config.py
    - template: jinja
    - user: {{cfg.user}}
    - data: |
            {{scfg}}
    - group: {{cfg.group}}
    - makedirs: true
    - watch:
      - pkg: prepreqs-{{cfg.name}}
      - user: {{cfg.name}}-www-data

dbinstall-{{cfg.name}}:
  cmd.run:
    - name: {{cfg.project_root}}/bin/build_db
    - unless: test $(sqlite3 {{data.DATABASE_FILE}} "select count(*) from user") -gt 0
    - cwd: {{cfg.project_root}}
    - user: {{cfg.user}}
    - watch:
      - buildout: {{cfg.name}}-buildout
      - file: {{cfg.name}}-config
    - watch_in:
      - mc_proxy: circus-post-conf

{% set circus_data = {
  'cmd': 'bin/gunicorn -w {2} -b {0}:{1} app:app'.format(
      data.host, data.port, data.workers,
  ),
  'environment': {'FLASK_MODULE': 'salt_config'},
  'uid': cfg.user,
  'gid': cfg.group,
  'copy_env': True,
  'working_dir': cfg.project_root,
  'warmup_delay': "10",
  'max_age': 24*60*60}%}

{{ circus.circusAddWatcher(cfg.name, **circus_data) }}

{{ nginx.virtualhost(domain=data.domain,
   active=True,
   doc_root=data.static,
   extra=cfg,
   vh_top_source=data.nginx_upstreams,
   vh_content_source=data.nginx_vhost) }}
