#!/bin/sh

curl -XDELETE 'http://localhost:9200/atlaas/'
curl -XPUT 'http://localhost:9200/atlaas'
curl -XPUT 'http://localhost:9200/atlaas/actions/_mapping' -d '
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
}'

curl -s -XPOST localhost:9200/_bulk --data-binary @enjeux.json; echo
find . -name "actions*.json" | while read line; do curl -s -XPOST localhost:9200/_bulk --data-binary @$line; echo; done;