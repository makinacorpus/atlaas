atlaas
======

Annuaire Territorial de Liaison des Acteurs, Actions et Services numériques

Convert Excel files to JSON-like elasticsearch importable files
---------------------------------------------------------------

Excel files are supposed to be here:
- ../../data/ATLAAS - Import acteurs.xls
- ../../data/ATLAAS - Import actions V2.xls

Install:
`virtualenv .`
`source bin/activate`
`easy_install xlrd`

Conversion:
`python convert.py`

it will produces enjeux.json and actions.json.

Import files in elasticsearch
-----------------------------

First backup your original data:
`tar -czf /data/nodes.tar.gz /var/lib/elasticsearch/elasticsearch/nodes`

Then launch the import:
`./import.sh`

FYI, this script does the following:

- Clean-up existing index:
`curl -XDELETE 'http://localhost:9200/atlaas/'`

- Setup index:
`curl -XPUT 'http://localhost:9200/atlaas'`

```curl -XPUT 'http://localhost:9200/atlaas/actions/_mapping' -d '
{
    "actions" : {
        "properties" : {
            "lieux": {
                "properties" : {
                    "location" : {"type" : "geo_point"}
                }
            }
        }
    }
}'```

- Import new data:
`curl -s -XPOST localhost:9200/_bulk --data-binary @enjeux.json; echo`
`curl -s -XPOST localhost:9200/_bulk --data-binary @actions.json; echo`
