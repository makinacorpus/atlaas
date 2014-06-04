# -*- coding: utf-8 -*-

from xlwt import *
import json
import re
import os
import sys
import requests
import time
from app import app

E_SEARCH = app.config['ELASTICSEARCH']


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

    r = requests.get(E_SEARCH + "/axes/_search?size=100000")
    hits = json.loads(r.content)["hits"]["hits"]
    services_list = []
    for axe in hits:
        axe_name = axe["_source"]["id_axe"] + ". " + axe["_source"]["axe"]
        for enjeux_id in axe["_source"]["enjeux"]:
            enjeu_name = enjeux_id[1:2] + ". " + axe["_source"]["enjeux"][enjeux_id]["enjeu"]
            usages =  axe["_source"]["enjeux"][enjeux_id]["usages"]
            for usage_id in usages:
                usage_name = usage_id[2:3] + ". " + usages[usage_id]["usage"]
                services = usages[usage_id]["services"]
                for service in services:
                    service_dict ={}
                    service_dict["id_service"] = service["id_service"]
                    service_dict["axe_name"] = axe_name
                    service_dict["enjeu_name"] = enjeu_name
                    service_dict["usage_name"] = usage_name
                    service_dict["service_name"] = service["service"]
                    services_list.append(service_dict)
    services_list = sorted(services_list, key=lambda k: int(k['id_service'][1:]))
    i = 1
    for service in services_list:
        ws_Services.write(i, 0, service["id_service"])
        ws_Services.write(i, 1, service["axe_name"])
        ws_Services.write(i, 2, service["enjeu_name"])
        ws_Services.write(i, 3, service["usage_name"])
        ws_Services.write(i, 4, service["service_name"])
        i += 1

    # Actions

    r = requests.get(E_SEARCH + "/actions/_search?size=100000")
    hits = json.loads(r.content)["hits"]["hits"]
    i_llieu = 1
    i_lpersonne = 1
    i_lservice = 1
    i_lieu = 1
    i_personne = 1
    actions_list = []
    for action in hits:
        source = action["_source"]
        action_dict ={}
        action_dict["id_action"] = source["id_action"]
        action_dict["titre"] = source["titre"]
        action_dict["sous_titre"] = source["sous_titre"]
        action_dict["date"] = source["date"]
        action_dict["synthese"] = source["synthese"]
        action_dict["actions"] = source["actions"]
        action_dict["resultats"] = source["resultats"]
        action_dict["recommandations"] = source["recommandations"]
        action_dict["liens"] = source["liens"]
        action_dict["outils"] = source["outils"]
        action_dict["prestataires"] = source["prestataires"]
        action_dict["videos"] = source["videos"]
        action_dict["photos"] = source["photos"]
        actions_list.append(action_dict)
        for liaison_lieux in source["lieux"]:
            ws_Liaison_Lieux.write(i_llieu, 0, source["id_action"])
            ws_Liaison_Lieux.write(i_llieu, 1, liaison_lieux["id_lieu"])
            i_llieu += 1
        for liaison_personnes in source["personnes"]:
            ws_Liaison_Personnes.write(i_lpersonne, 0, source["id_action"])
            ws_Liaison_Personnes.write(i_lpersonne, 1, liaison_personnes["id_personne"])
            i_lpersonne += 1
        for liaison_services in source["services"]:
            ws_Liaison_Services.write(i_lservice, 0, source["id_action"])
            ws_Liaison_Services.write(i_lservice, 1, liaison_services["id_service"])
            i_lservice += 1
    actions_list = sorted(actions_list, key=lambda k: int(k['id_action']))
    i = 1
    for action in actions_list:
        ws_Actions.write(i, 0, action["id_action"])
        ws_Actions.write(i, 1, action["titre"])
        ws_Actions.write(i, 2, action["sous_titre"])
        ws_Actions.write(i, 3, action["date"])
        ws_Actions.write(i, 4, action["synthese"])
        ws_Actions.write(i, 5, action["actions"])
        ws_Actions.write(i, 6, action["resultats"])
        ws_Actions.write(i, 7, action["recommandations"])
        ws_Actions.write(i, 8, action["liens"])
        ws_Actions.write(i, 9, action["outils"])
        ws_Actions.write(i, 10, action["prestataires"])
        ws_Actions.write(i, 11, action["videos"])
        ws_Actions.write(i, 12, action["photos"])
        i +=1

    # Lieux

    r = requests.get(E_SEARCH + "/lieux/_search?size=100000")
    hits = json.loads(r.content)["hits"]["hits"]
    lieux_list = []
    for lieu in hits:
        source = lieu["_source"]
        lieu_dict ={}
        lieu_dict["id_lieu"] = source["id_lieu"]
        lieu_dict["type"] = source["type"]
        lieu_dict["nom"] = source["nom"]
        lieu_dict["description"] = source["description"]
        lieu_dict["lat"] = source["lat"]
        lieu_dict["lon"] = source["lon"]
        lieu_dict["adresse_web"] = source["adresse_web"]
        lieu_dict["adresse"] = source["adresse"]
        lieu_dict["code_postal"] = source["code_postal"]
        lieu_dict["ville"] = source["ville"]
        lieu_dict["telephone"] = source["telephone"]
        lieu_dict["fax"] = source["fax"]
        lieu_dict["courriel"] = source["courriel"]
        lieu_dict["population"] = source["population"]
        lieu_dict["id_insee"] = source["id_insee"]
        lieux_list.append(lieu_dict)
    lieux_list = sorted(lieux_list, key=lambda k: k['id_lieu'])
    i = 1
    for lieu in lieux_list:
        ws_Lieux.write(i, 0, lieu["id_lieu"])
        ws_Lieux.write(i, 1, lieu["type"])
        ws_Lieux.write(i, 2, lieu["nom"])
        ws_Lieux.write(i, 3, lieu["description"])
        ws_Lieux.write(i, 4, lieu["lat"])
        ws_Lieux.write(i, 5, lieu["lon"])
        ws_Lieux.write(i, 6, lieu["adresse_web"])
        ws_Lieux.write(i, 7, lieu["adresse"])
        ws_Lieux.write(i, 8, lieu["code_postal"])
        ws_Lieux.write(i, 9, lieu["ville"])
        ws_Lieux.write(i, 10, lieu["telephone"])
        ws_Lieux.write(i, 11, lieu["fax"])
        ws_Lieux.write(i, 12, lieu["courriel"])
        ws_Lieux.write(i, 13, lieu["population"])
        ws_Lieux.write(i, 14, lieu["id_insee"])
        i += 1

    # Personnes

    r = requests.get(E_SEARCH + "/personnes/_search?size=100000")
    hits = json.loads(r.content)["hits"]["hits"]
    personnes_list = []
    for personne in hits:
        source = personne["_source"]
        personne_dict ={}
        personne_dict["id_personne"] = source["id_personne"]
        personne_dict["nom"] = source["nom"]
        personne_dict["titre"] = source["titre"]
        personne_dict["elu"] = source["elu"]
        personne_dict["adresse"] = source["adresse"]
        personne_dict["code_postal"] = source["code_postal"]
        personne_dict["ville"] = source["ville"]
        personne_dict["telephone"] = source["telephone"]
        personne_dict["telephone_mobile"] = source["telephone_mobile"]
        personne_dict["courriel"] = source["courriel"]
        personnes_list.append(personne_dict)
    personnes_list = sorted(personnes_list, key=lambda k: k['id_personne'])
    i = 1
    for personne in personnes_list:
        ws_Personnes.write(i, 0, personne["id_personne"])
        ws_Personnes.write(i, 1, personne["nom"])
        ws_Personnes.write(i, 2, personne["titre"])
        ws_Personnes.write(i, 3, personne["elu"])
        ws_Personnes.write(i, 4, personne["adresse"])
        ws_Personnes.write(i, 5, personne["code_postal"])
        ws_Personnes.write(i, 6, personne["ville"])
        ws_Personnes.write(i, 7, personne["telephone"])
        ws_Personnes.write(i, 8, personne["telephone_mobile"])
        ws_Personnes.write(i, 9, personne["courriel"])
        i += 1

    # Save the xls doc
    datetime = time.strftime("%Y%m%d-%H%M%S")
    filepath = os.path.join(app.config['EXPORT_FOLDER'], 'ATLAAS-EXPORT-' + datetime + '.xls')
    w.save(filepath)

    return filepath
