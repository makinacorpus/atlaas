{% set cfg = opts['ms_project'] %}
{% set dest = '{0}/project'.format(cfg['current_archive_dir']) %}
{{cfg.name}}-sav-project-dir:
  cmd.run:
    - name: |
            if [ ! -d "{{dest}}" ];then
              mkdir -p "{{dest}}";
            fi;
            rsync -Aa --delete "{{cfg.project_root}}/" "{{dest}}/"
    - user: root

{{cfg.name}}-backup-db:
  cmd.run:
    - name: rsync -Aa "{{cfg.data_root}}/" "{{cfg.current_archive_dir}}/data/"
    - user: root
    - watch:
      - cmd: {{cfg.name}}-sav-project-dir

