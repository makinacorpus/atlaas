# -*- coding: utf-8 -*-

from xlwt import *
import json
import re
import os
import sys
import requests
from app import app

def export():

#import pdb; pdb.set_trace()

    w = Workbook()

    # Services

    # Initialize services
    ws_Services = w.add_sheet('Services')
    ws_Services.write(0, 0, u'Id_Service')
    ws_Services.write(0, 1, u'Axe')
    ws_Services.write(0, 2, u'Enjeu de développement ')
    ws_Services.write(0, 3, u'Usage')
    ws_Services.write(0, 4, u'Service')

    # Parse services
    r = requests.get("http://localhost:9200/atlaas/enjeux/_search")
    hits = json.loads(r.content)["hits"]["hits"]
    i = 1
    for enjeu in hits:
        enjeu_name = enjeu["_source"]["id_enjeu"][1:2] + '. ' + enjeu["_source"]["enjeu"]
        for usages_id in enjeu["_source"]["usages"]:
            usage_name = usages_id[2:3] + enjeu["_source"]["usages"][usages_id]["usage"]
            services =  enjeu["_source"]["usages"][usages_id]["services"]
            for service in services:
                id_service = service["id_service"]
                service_name = service["service"]
                ws_Services.write(i, 0, id_service)
                ws_Services.write(i, 2, enjeu_name)
                ws_Services.write(i, 3, usage_name)
                ws_Services.write(i, 4, service_name)
                i += 1

    # Actions

    # Initialize actions
    ws_Actions = w.add_sheet('Actions')
    ws_Actions.write(0, 0, u'Id_Service')
    ws_Actions.write(0, 1, u'Titre')
    ws_Actions.write(0, 2, u'Sous-titre ')
    ws_Actions.write(0, 3, u'Date')
    ws_Actions.write(0, 4, u'Synthèse')
    ws_Actions.write(0, 5, u'Actions')
    ws_Actions.write(0, 6, u'Résultats')
    ws_Actions.write(0, 7, u'Recommandations ')
    ws_Actions.write(0, 8, u'Liens')
    ws_Actions.write(0, 9, u'Outils')
    ws_Actions.write(0, 10, u'Prestataires')
    ws_Actions.write(0, 11, u'Videos')
    ws_Actions.write(0, 12, u'Photos ')


    # Save the xls doc
    w.save(os.path.join(app.config['UPLOAD_FOLDER'], 'ATLAAS-EXPORT.xls'))

