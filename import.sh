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
curl -s -XPOST localhost:9200/_bulk --data-binary @actions.json; echo