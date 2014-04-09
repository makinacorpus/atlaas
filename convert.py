import xlrd

wb = xlrd.open_workbook("../../data/ATLAAS - Import acteurs.xls")

# lieux
lieux = {}
lieux_errors = 0
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

# fields = 
# Id_Lieu Type    Nom Description Latitude    Longitude   Adresse web Adresse Code postal Ville   Telephone   Fax Courriel    Population  Id_INSEE


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
    info = {
        'nom': row[2],
        'fax': row[11],
        'code_postal': row[8],
        'description': row[3],
        'ville': row[9],
        'adresse': row[7],
        'id_insee': str(row[14]),
        'telephone': row[10],
        'adresse_web': row[6],
        'id_lieu': str(row[0]),
        'location': {
            'lat': row[4],
            'lon': row[5],
        },
        'lon': row[5],
        'courriel': row[12],
        'lat': row[4],
        'type': row[1],
        'population': str(row[13]),
        'departement': departement,
        'region': mapping_region.get(departement, ''),
    }
    print(info)

print(lieux_errors)