import xlrd
import json
import re
import os
import sys
import requests
from app import app
from app.export import export

def convert(file):
    def format_phone(val):
        if type(val) is float:
            return '0' + str(int(val))
        else:
            return val

    def format_int(val):
        if type(val) is float:
            return str(int(val))
        else:
            return val

    def cleanup_text(val, only_replace_double=True):
        if not type(val) is basestring:
            val = unicode(val)
        val = re.sub('^\n+', '', val)
        val = re.sub('\n+^', '', val)
        if only_replace_double:
            val = re.sub('\n{2}', '<br/>', val)
        else:
            val = re.sub('\n', '<br/>', val)
        return val

    # First backup the current data
    export()

    wb = xlrd.open_workbook(file)

    # lieux
    mapping_region = {
        '01': '82',
        '02': '22',
        '03': '83',
        '04': '93',
        '05': '93',
        '06': '93',
        '07': '82',
        '08': '21',
        '09': '73',
        '10': '21',
        '11': '91',
        '12': '73',
        '13': '93',
        '14': '25',
        '15': '83',
        '16': '54',
        '17': '54',
        '18': '24',
        '19': '74',
        '21': '26',
        '22': '53',
        '23': '74',
        '24': '72',
        '25': '43',
        '26': '82',
        '27': '23',
        '28': '24',
        '29': '53',
        '2A': '94',
        '2B': '94',
        '30': '91',
        '31': '73',
        '32': '73',
        '33': '72',
        '34': '91',
        '35': '53',
        '36': '24',
        '37': '24',
        '38': '82',
        '39': '43',
        '40': '72',
        '41': '24',
        '42': '82',
        '43': '83',
        '44': '52',
        '45': '24',
        '46': '73',
        '47': '72',
        '48': '91',
        '49': '52',
        '50': '25',
        '51': '21',
        '52': '21',
        '53': '52',
        '54': '41',
        '55': '41',
        '56': '53',
        '57': '41',
        '58': '26',
        '59': '31',
        '60': '22',
        '61': '25',
        '62': '31',
        '63': '83',
        '64': '72',
        '65': '73',
        '66': '91',
        '67': '42',
        '68': '42',
        '69': '82',
        '70': '43',
        '71': '26',
        '72': '52',
        '73': '82',
        '74': '82',
        '75': '11',
        '76': '23',
        '77': '11',
        '78': '11',
        '79': '54',
        '80': '22',
        '81': '73',
        '82': '73',
        '83': '93',
        '84': '93',
        '85': '52',
        '86': '54',
        '87': '74',
        '88': '41',
        '89': '26',
        '90': '43',
        '91': '11',
        '92': '11',
        '93': '11',
        '94': '11',
        '95': '11',
        '971': '1',
        '972': '2',
        '973': '3',
        '974': '4',
    }
    lieux = {}
    lieux_errors = 0
    sh = wb.sheet_by_name(u'Lieux')
    for rownum in range(1, sh.nrows):
        row = sh.row_values(rownum)
        if (type(row[4]) is str) or (type(row[5]) is str): 
            lieux_errors += 1
            lat = ''
            lon = ''
        else:
            lat = float(row[4])
            lon = float(row[5])
        guess_departement = str(row[14])
        if not guess_departement:
            guess_departement = str(row[8])
        if len(guess_departement) < 4:
            lieux_errors += 1
            continue
        if len(guess_departement) == 4:
            guess_departement = "0" + guess_departement
        if guess_departement.startswith("97"):
            departement = guess_departement[:3]
        else:
            departement = guess_departement[:2]
        id = format_int(row[0])
        infos = {
            'nom': row[2],
            'fax': row[11],
            'code_postal': format_int(row[8]),
            'description': cleanup_text(row[3]),
            'ville': row[9],
            'adresse': row[7],
            'id_insee': format_int(row[14]),
            'telephone': format_phone(row[10]),
            'adresse_web': row[6],
            'id_lieu': id,
            'location': {
                'lat': lat,
                'lon': lon,
            },
            'lon': lon,
            'lat': lat,
            'courriel': row[12],
            'type': row[1],
            'population': format_int(row[13]),
            'departement': departement,
            'region': mapping_region.get(departement, ''),
        }
        lieux[id] = infos
    print("Erreur lieux: %d" % lieux_errors)

    # Personnes
    sh = wb.sheet_by_name(u'Personnes')
    personnes = {}
    for rownum in range(1, sh.nrows):
        row = sh.row_values(rownum)
        id = format_int(row[0])
        infos ={
            'ville': row[6],
            'code_postal': format_int(row[5]),
            'id_personne': id,
            'adresse': row[4],
            'telephone': format_phone(row[7]),
            'titre': row[2],
            'nom': row[1],
            'courriel': row[9],
            'telephone_mobile': format_phone(row[8]),
            'elu': row[3],
        }
        personnes[id] = infos

    # Services
    sh = wb.sheet_by_name(u'Services')
    services = {}
    for rownum in range(1, sh.nrows):
        row = sh.row_values(rownum)
        id = format_int(row[0])
        infos ={
            'usage': row[3],
            'enjeu_de_developpement': row[2],
            'id_service': id,
            'service': row[4],
            'axe': row[1],
        }
        services[id] = infos

    # actions
    sh = wb.sheet_by_name(u'Actions')
    actions = {}
    for rownum in range(1, sh.nrows):
        row = sh.row_values(rownum)
        id = format_int(row[0])
        infos ={
            'outils': row[9],
            'sous_titre': row[2],
            'id_action': id,
            'actions': cleanup_text(row[5]),
            'date': format_int(row[3]),
            'synthese': cleanup_text(row[4]),
            'liens': cleanup_text(row[8], False),
            'titre': row[1],
            'resultats': cleanup_text(row[6]),
            'recommandations': cleanup_text(row[7]),
            'prestataires': cleanup_text(row[10]),
            'videos': cleanup_text(row[11]),
            'photos': cleanup_text(row[12]),
        }
        actions[id] = infos

    # bind lieux
    sh = wb.sheet_by_name(u'Liaison Lieux')
    for rownum in range(1, sh.nrows):
        row = sh.row_values(rownum)
        (action_id, lieu_id) = (format_int(row[0]), format_int(row[1]))
        action = actions.get(action_id)
        lieu = lieux.get(lieu_id)
        if not(action and lieu):
            continue
        action_lieux = action.get('lieux', [])
        action_lieux.append(lieux[lieu_id])
        actions[action_id]['lieux'] = action_lieux

    # bind personnes
    sh = wb.sheet_by_name(u'Liaison Personnes')
    for rownum in range(1, sh.nrows):
        row = sh.row_values(rownum)
        (action_id, personne_id) = (format_int(row[0]), format_int(row[1]))
        action = actions.get(action_id)
        personne = personnes.get(personne_id)
        if not(action and personne):
            continue
        action_personnes = action.get('personnes', [])
        action_personnes.append(personnes[personne_id])
        actions[action_id]['personnes'] = action_personnes

    # bind services
    sh = wb.sheet_by_name(u'Liaison Services')
    for rownum in range(1, sh.nrows):
        row = sh.row_values(rownum)
        (action_id, service_id) = (format_int(row[0]), format_int(row[1]))
        action = actions.get(action_id)
        service = services.get(service_id)
        if not(action and service):
            continue
        action_services = action.get('services', [])
        action_services.append(services[service_id])
        actions[action_id]['services'] = action_services

    # export actions to json
    index = 1
    count = 0
    actions_json = open(os.path.join(app.config['CONVERSION_FOLDER'], "actions-%d.json" % index), "wb")
    for action in actions.values():
        header = { "index" : { "_index" : "atlaas", "_type" : "actions", "_id" : action['id_action'] } }
        actions_json.write(json.dumps(header).encode('UTF-8') + '\n')
        actions_json.write(json.dumps(action).encode('UTF-8') + '\n')
        count += 1
        if count > 1000:
            index += 1
            actions_json.close()
            actions_json = open(os.path.join(app.config['CONVERSION_FOLDER'], "actions-%d.json" % index), "wb")
            count = 0
    actions_json.close()

    # export axes
    axes = {}
    for service in services.values():
        axe_id = service['axe'][0]
        enjeu_id = axe_id + service['enjeu_de_developpement'][0]
        usage_id = enjeu_id + service['usage'][0]
        axe = axes.setdefault(axe_id, {
            'id_axe' : axe_id,
            'axe': service['axe'][3:],
            'enjeux': {}
            })
        enjeux = axe['enjeux']
        enjeu = enjeux.setdefault(enjeu_id, {
            'enjeu': service['enjeu_de_developpement'][3:],
            'id_enjeu': enjeu_id,
            'axe': service['axe'][3:],
            'usages': {},
        })
        usages = enjeu['usages']
        usage = usages.setdefault(usage_id, {
            'usage': service['usage'][3:],
            'services': [],
        })
        usage['services'].append({
            'id_service': service['id_service'],
            'service': service['service'],
        })
        usages[usage_id] = usage
        enjeu['usages'] = usages
        enjeux[enjeu_id] = enjeu
        axe['enjeux'] = enjeux
        axes[axe_id] = axe

    axes_json = open(os.path.join(app.config['CONVERSION_FOLDER'], "axes.json"), "wb")
    for axe in axes.values():
        header = { "index" : { "_index" : "atlaas", "_type": "axes", "_id" : axe['id_axe'] } }
        axes_json.write(json.dumps(header).encode('UTF-8') + '\n')
        axes_json.write(json.dumps(axe).encode('UTF-8') + '\n')
    axes_json.close()

    lieux_json = open(os.path.join(app.config['CONVERSION_FOLDER'], "lieux.json"), "wb")
    for lieu in lieux.values():
        header = { "index" : { "_index" : "atlaas", "_type": "lieux", "_id" : lieu['id_lieu'] } }
        lieux_json.write(json.dumps(header).encode('UTF-8') + '\n')
        lieux_json.write(json.dumps(lieu).encode('UTF-8') + '\n')
    lieux_json.close()

    personnes_json = open(os.path.join(app.config['CONVERSION_FOLDER'], "personnes.json"), "wb")
    for personne in personnes.values():
        header = { "index" : { "_index" : "atlaas", "_type": "personnes", "_id" : personne['id_personne'] } }
        personnes_json.write(json.dumps(header).encode('UTF-8') + '\n')
        personnes_json.write(json.dumps(personne).encode('UTF-8') + '\n')
    personnes_json.close()

    r = requests.delete("http://localhost:9200/atlaas/")

    r = requests.put("http://localhost:9200/atlaas/")

    r = requests.put("http://localhost:9200/atlaas/actions/_mapping", data='{ \
        "actions" : { \
            "properties" : { \
                "lieux": { \
                    "properties" : { \
                        "location" : {"type" : "geo_point"} \
                    } \
                } \
            } \
        } \
    }')

    axes_json = open(os.path.join(app.config['CONVERSION_FOLDER'], "axes.json"), "rb")
    r = requests.post("http://localhost:9200/atlaas/_bulk", data=axes_json)
    axes_json.close()

    lieux_json = open(os.path.join(app.config['CONVERSION_FOLDER'], "lieux.json"), "rb")
    r = requests.post("http://localhost:9200/atlaas/_bulk", data=lieux_json)
    lieux_json.close()

    personnes_json = open(os.path.join(app.config['CONVERSION_FOLDER'], "personnes.json"), "rb")
    r = requests.post("http://localhost:9200/atlaas/_bulk", data=personnes_json)
    personnes_json.close()

    for i in range (1, index+1):
        actions_json = open(os.path.join(app.config['CONVERSION_FOLDER'], "actions-%d.json" % i), "rb")
        r = requests.post("http://localhost:9200/atlaas/_bulk", data=actions_json)
        actions_json.close()
