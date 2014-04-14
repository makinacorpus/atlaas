atlaas
======

Annuaire Territorial de Liaison des Acteurs, Actions et Services numériques

This project is generated using Yeoman (http://yeoman.io/)

### Requirements
- npm (version > 1.2.10)
- grunt (`npm install -g grunt-cli`)

####Note : You should name your project folder 'atlaas' to let Yeoman generator CLI be able to automatically generate Backbone views/models/collections... (`yo backbone:view myview`)

### Install
- `$ npm install`
- `$ bower install`
- `$ grunt serve`
- look your browser

### NGINX configuration

Install nginx-extras package:

`sudo apt-get install nginx-extras`

Create a htpasswd file.

Vhost::

    server {
        listen 80;
        server_name elastic.makina-corpus.net;

            
        add_header 'Access-Control-Allow-Headers' 'Authorization,DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type';

        location / {
            if ( $request_method !~ ^(GET|HEAD)$ ) {
                return 403;
            }
            proxy_pass        http://localhost:9200;
        }

        location /atlaas/review {
            proxy_pass        http://localhost:9200;
        }

    }
    server {
        listen 80;
        server_name secured-elastic.makina-corpus.net;

        location / {
         if ($request_method = 'OPTIONS') {
            more_set_headers 'Access-Control-Allow-Origin: *';

            #
            # Om nom nom cookies
            #
     
            add_header 'Access-Control-Allow-Credentials' 'true';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT';
            
            #
            # Custom headers and headers various browsers *should* be OK with but aren't
            #
     
            add_header 'Access-Control-Allow-Headers' 'Authorization,DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type';
            
            #
            # Tell client that this pre-flight info is valid for 20 days
            #
     
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' 0;
     
            return 204;
         }

        more_set_headers 'Access-Control-Allow-Origin: *';
        add_header 'Access-Control-Allow-Credentials' 'true';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT';
        add_header 'Access-Control-Allow-Headers' 'Authorization,DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type';

        limit_except OPTIONS {
            auth_basic "Restricted";
            auth_basic_user_file /home/ebr/tmp/htpasswd;
        }

        proxy_pass        http://localhost:9200;
        proxy_set_header  X-Real-IP  $remote_addr;
        }

    }


### Changelog
####0.2
- Edit/Add new action with /#edit and /#new
- New Edit button on action detail page
- New Share buttons (Facebook/Twitter) on action detail page
- New "Download as CSV" button on action detail page
- Performance optimisation on markers display (lighten server request and rendering)

####0.1 Beta version
