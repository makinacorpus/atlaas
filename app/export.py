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

    ws_Services.write(0, 0, u'Id_Service', style=title_style)
    ws_Services.write(0, 1, u'Axe', style=title_style)
    ws_Services.write(0, 2, u'Enjeu de développement ', style=title_style)
    ws_Services.write(0, 3, u'Usage', style=title_style)
    ws_Services.write(0, 4, u'Service', style=title_style)

    ws_Lieux.write(0, 0, u'Id_Lieu', style=title_style)
    ws_Lieux.write(0, 1, u'Type', style=title_style)
    ws_Lieux.write(0, 2, u'Nom ', style=title_style)
    ws_Lieux.write(0, 3, u'Description', style=title_style)
    ws_Lieux.write(0, 4, u'Latitude', style=title_style)
    ws_Lieux.write(0, 5, u'Longitude', style=title_style)
    ws_Lieux.write(0, 6, u'Adresse web', style=title_style)
    ws_Lieux.write(0, 7, u'Adresse ', style=title_style)
    ws_Lieux.write(0, 8, u'Code postal', style=title_style)
    ws_Lieux.write(0, 9, u'Ville', style=title_style)
    ws_Lieux.write(0, 10, u'Telephone', style=title_style)
    ws_Lieux.write(0, 11, u'Fax', style=title_style)
    ws_Lieux.write(0, 12, u'Courriel ', style=title_style)
    ws_Lieux.write(0, 13, u'Population', style=title_style)
    ws_Lieux.write(0, 14, u'Id_INSEE', style=title_style)

    ws_Personnes.write(0, 0, u'Id_Personne', style=title_style)
    ws_Personnes.write(0, 1, u'Nom', style=title_style)
    ws_Personnes.write(0, 2, u'Titre ', style=title_style)
    ws_Personnes.write(0, 3, u'Elu', style=title_style)
    ws_Personnes.write(0, 4, u'Adresse', style=title_style)
    ws_Personnes.write(0, 5, u'Code postal', style=title_style)
    ws_Personnes.write(0, 6, u'Ville', style=title_style)
    ws_Personnes.write(0, 7, u'Telephone ', style=title_style)
    ws_Personnes.write(0, 8, u'Telephone mobile', style=title_style)
    ws_Personnes.write(0, 9, u'Courriel', style=title_style)

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

    r = requests.get("http://localhost:9200/atlaas/actions/_search?size=10")
    hits = json.loads(r.content)["hits"]["hits"]
    i = 1
    i_llieu = 1
    i_lpersonne = 1
    i_lservice = 1
    i_lieu = 1
    i_personne = 1
    lieux = []
    personnes = []
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
            lieux.append(liaison_lieux)
            ws_Liaison_Lieux.write(i_llieu, 0, source["id_action"])
            ws_Liaison_Lieux.write(i_llieu, 1, liaison_lieux["id_lieu"])
            i_llieu += 1
        for liaison_personnes in source["personnes"]:
            personnes.append(liaison_personnes)
            ws_Liaison_Personnes.write(i_lpersonne, 0, source["id_action"])
            ws_Liaison_Personnes.write(i_lpersonne, 1, liaison_personnes["id_personne"])
            i_lpersonne += 1
        for liaison_services in source["services"]:
            ws_Liaison_Services.write(i_lservice, 0, source["id_action"])
            ws_Liaison_Services.write(i_lservice, 1, liaison_services["id_service"])
            i_lservice += 1
        i += 1
    lieux_uniques = {lieu['id_lieu']:lieu for lieu in lieux}.values()
    lieux_uniques = sorted(lieux_uniques, key=lambda k: int(k['id_lieu']))
    for lieu_unique in lieux_uniques:
        ws_Lieux.write(i_lieu, 0, lieu_unique["id_lieu"])
        ws_Lieux.write(i_lieu, 1, lieu_unique["type"])
        ws_Lieux.write(i_lieu, 2, lieu_unique["nom"])
        ws_Lieux.write(i_lieu, 3, lieu_unique["description"])
        ws_Lieux.write(i_lieu, 4, lieu_unique["lat"])
        ws_Lieux.write(i_lieu, 5, lieu_unique["lon"])
        ws_Lieux.write(i_lieu, 6, lieu_unique["adresse_web"])
        ws_Lieux.write(i_lieu, 7, lieu_unique["adresse"])
        ws_Lieux.write(i_lieu, 8, lieu_unique["code_postal"])
        ws_Lieux.write(i_lieu, 9, lieu_unique["ville"])
        ws_Lieux.write(i_lieu, 10, lieu_unique["telephone"])
        ws_Lieux.write(i_lieu, 11, lieu_unique["fax"])
        ws_Lieux.write(i_lieu, 12, lieu_unique["courriel"])
        ws_Lieux.write(i_lieu, 13, lieu_unique["population"])
        ws_Lieux.write(i_lieu, 14, lieu_unique["id_insee"])
        i_lieu +=1
    personnes_uniques = {personne['id_personne']:personne for personne in personnes}.values()
    personnes_uniques = sorted(personnes_uniques, key=lambda k: int(k['id_personne']))
    for personne_unique in personnes_uniques:
        ws_Personnes.write(i_personne, 0, personne_unique["id_personne"])
        ws_Personnes.write(i_personne, 1, personne_unique["nom"])
        ws_Personnes.write(i_personne, 2, personne_unique["titre"])
        ws_Personnes.write(i_personne, 3, personne_unique["elu"])
        ws_Personnes.write(i_personne, 4, personne_unique["adresse"])
        ws_Personnes.write(i_personne, 5, personne_unique["code_postal"])
        ws_Personnes.write(i_personne, 6, personne_unique["ville"])
        ws_Personnes.write(i_personne, 7, personne_unique["telephone"])
        ws_Personnes.write(i_personne, 8, personne_unique["telephone_mobile"])
        ws_Personnes.write(i_personne, 9, personne_unique["courriel"])
        i_personne +=1



    # Save the xls doc
    w.save(os.path.join(app.config['UPLOAD_FOLDER'], 'ATLAAS-EXPORT.xls'))

