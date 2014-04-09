import xlrd
import json

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

wb = xlrd.open_workbook("../../data/ATLAAS - Import acteurs.xls")

# lieux
mapping_region = {
    '1': '82',
    '2': '22',
    '3': '83',
    '4': '93',
    '5': '93',
    '6': '93',
    '7': '82',
    '8': '21',
    '9': '73',
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
    if not row[4]:
        lieux_errors += 1
        continue
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
        'description': row[3],
        'ville': row[9],
        'adresse': row[7],
        'id_insee': format_int(row[14]),
        'telephone': format_phone(row[10]),
        'adresse_web': row[6],
        'id_lieu': id,
        'location': {
            'lat': row[4],
            'lon': row[5],
        },
        'lon': row[5],
        'courriel': row[12],
        'lat': row[4],
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
wb = xlrd.open_workbook("../../data/ATLAAS - Import actions V2.xls")
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
        'actions': row[5],
        'date': format_int(row[3]),
        'synthese': row[4],
        'liens': row[8],
        'titre': row[1],
        'resultats': row[6],
        'recommandations': row[7],
        'prestataires': row[10],
    }
    actions[id] = infos

# bind lieux
sh = wb.sheet_by_name(u'Liaison Lieux (2)')
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
sh = wb.sheet_by_name(u'Liaison Personnes (2)')
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
sh = wb.sheet_by_name(u'Liaison Services (2)')
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
actions_json = open("actions.json", "wb")
for action in actions.values():
    header = { "index" : { "_index" : "atlaas", "_type" : "actions", "_id" : action['id_action'] } }
    actions_json.write(bytes(json.dumps(header) + '\n', 'UTF-8'))
    actions_json.write(bytes(json.dumps(action) + '\n', 'UTF-8'))
actions_json.close()

# export enjeux
enjeux = {}
for service in services.values():
    enjeu_id = service['axe'][0] + service['enjeu_de_developpement'][0]
    usage_id = enjeu_id + service['usage'][0]
    enjeu = enjeux.setdefault(enjeu_id, {
        'enjeu': service['enjeu_de_developpement'][3:],
        'id_enjeu': enjeu_id,
        'usages': {},
    })
    usages = enjeu['usages']
    usage = usages.setdefault(usage_id, {
        'usage': service['usage'][3:],
        'services': [],
    })
    usage['services'].append(service)
    usages[usage_id] = usage
    enjeu['usages'] = usages
    enjeux[enjeu_id] = enjeu

enjeux_json = open("enjeux.json", "wb")
for enjeu in enjeux.values():
    header = { "index" : { "_index" : "atlaas", "_type" : "actions", "_id" : enjeu['id_enjeu'] } }
    enjeux_json.write(bytes(json.dumps(header) + '\n', 'UTF-8'))
    enjeux_json.write(bytes(json.dumps(enjeu) + '\n', 'UTF-8'))
enjeux_json.close()