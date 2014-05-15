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

    title_style = XFStyle()
    font = Font()
    font.bold = True
    title_style.font = font

    ws_Actions = w.add_sheet('Actions')
    ws_Services = w.add_sheet('Services')
    ws_Lieux = w.add_sheet('Lieux')
    ws_Personnes = w.add_sheet('Personnes')
    ws_Liaison_Lieux = w.add_sheet('Liaison Lieux')
    ws_Liaison_Personnes = w.add_sheet('Liaison Personnes')
    ws_Liaison_Services = w.add_sheet('Liaison Services')

    ws_Services.write(0, 0, u'Id_Service', style=title_style)
    ws_Services.write(0, 1, u'Axe', style=title_style)
    ws_Services.write(0, 2, u'Enjeu de développement ', style=title_style)
    ws_Services.write(0, 3, u'Usage', style=title_style)
    ws_Services.write(0, 4, u'Service', style=title_style)

    ws_Actions.write(0, 0, u'Id_Action', style=title_style)
    ws_Actions.write(0, 1, u'Titre', style=title_style)
    ws_Actions.write(0, 2, u'Sous-titre ', style=title_style)
    ws_Actions.write(0, 3, u'Date', style=title_style)
    ws_Actions.write(0, 4, u'Synthèse', style=title_style)
    ws_Actions.write(0, 5, u'Actions', style=title_style)
    ws_Actions.write(0, 6, u'Résultats', style=title_style)
    ws_Actions.write(0, 7, u'Recommandations ', style=title_style)
    ws_Actions.write(0, 8, u'Liens', style=title_style)
    ws_Actions.write(0, 9, u'Outils', style=title_style)
    ws_Actions.write(0, 10, u'Prestataires', style=title_style)
    ws_Actions.write(0, 11, u'Videos', style=title_style)
    ws_Actions.write(0, 12, u'Photos ', style=title_style)

    ws_Liaison_Lieux.write(0, 0, u'Id_Action', style=title_style)
    ws_Liaison_Lieux.write(0, 1, u'Id_Lieu', style=title_style)

    ws_Liaison_Personnes.write(0, 0, u'Id_Action', style=title_style)
    ws_Liaison_Personnes.write(0, 1, u'Id_Personne', style=title_style)

    ws_Liaison_Services.write(0, 0, u'Id_Action', style=title_style)
    ws_Liaison_Services.write(0, 1, u'Id_Service', style=title_style)

    # Services

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

    r = requests.get("http://localhost:9200/atlaas/actions/_search")
    hits = json.loads(r.content)["hits"]["hits"]
    i = 1
    i_lieu = 1
    i_personne = 1
    i_service = 1
    for action in hits:
        source = action["_source"]
        ws_Actions.write(i, 0, source["id_action"])
        ws_Actions.write(i, 1, source["titre"])
        ws_Actions.write(i, 2, source["sous_titre"])
        ws_Actions.write(i, 3, source["date"])
        ws_Actions.write(i, 4, source["synthese"])
        ws_Actions.write(i, 5, source["actions"])
        ws_Actions.write(i, 6, source["resultats"])
        ws_Actions.write(i, 7, source["recommandations"])
        ws_Actions.write(i, 8, source["liens"])
        ws_Actions.write(i, 9, source["outils"])
        ws_Actions.write(i, 10, source["prestataires"])
        ws_Actions.write(i, 11, source["videos"])
        ws_Actions.write(i, 12, source["photos"])
        for liaison_lieux in source["lieux"]:
            ws_Liaison_Lieux.write(i_lieu, 0, source["id_action"])
            ws_Liaison_Lieux.write(i_lieu, 1, liaison_lieux["id_lieu"])
            i_lieu += 1
        for liaison_personnes in source["personnes"]:
            ws_Liaison_Personnes.write(i_personne, 0, source["id_action"])
            ws_Liaison_Personnes.write(i_personne, 1, liaison_personnes["id_personne"])
            i_personne += 1
        for liaison_services in source["services"]:
            ws_Liaison_Services.write(i_service, 0, source["id_action"])
            ws_Liaison_Services.write(i_service, 1, liaison_services["id_service"])
            i_service += 1
        i += 1



    # Save the xls doc
    w.save(os.path.join(app.config['UPLOAD_FOLDER'], 'ATLAAS-EXPORT.xls'))

