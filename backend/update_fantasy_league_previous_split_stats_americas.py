import firebase_admin
from firebase_admin import firestore

import requests
from bs4 import BeautifulSoup

from google.api_core.exceptions import NotFound

player_roles = {
    # 100 Thieves
    "Asuna": "Flex",
    "bang": "Smokes",
    "vora": "Initiator",
    "Cryocells": "Sentinel",
    "Timotino": "Duelist",

    # Cloud9
    "Zellsis": "Sentinel",
    "penny": "Flex",
    "Xeppaa": "Initiator",
    "v1c": "Smokes",
    "OXY": "Duelist",

    # Evil Geniuses
    "supamen": "Smokes",
    "C0M": "Initiator",
    "bao": "Sentinel",
    "Okeanos": "Flex",
    "dgzin": "Duelist",

    # FURIA
    "nerve": "Smokes",
    "artzin": "Flex",
    "eeiu": "Initiator",
    "koalanoob": "Duelist",
    "alym": "Sentinel",

    # KRÜ Esports
    "saadhak": "Smokes",
    "mwzera": "Initiator",
    "silentzz": "Flex",
    "Less": "Sentinel",
    "Dantedeu5": "Duelist",

    # LEVIATÁN
    "kiNgg": "Smokes",
    "Sato": "Duelist",
    "spike": "Flex",
    "blowz": "Initiator",
    "Neon": "Sentinel",

    # LOUD
    "lukxo": "Sentinel",
    "Darker": "Flex",
    "Virtyy": "Duelist",
    "pANcada": "Smokes",
    "cauanzin": "Initiator",

    # MIBR
    "zekken": "Duelist",
    "Mazino": "Flex",
    "aspas": "Duelist",
    "Verno": "Initiator",
    "tex": "Sentinel",

    # NRG
    "brawk": "Initiator",
    "keiko": "Sentinel",
    "mada": "Duelist",
    "skuba": "Smokes",
    "Ethan": "Flex",

    # Sentinels
    "Reduxx": "Duelist",
    "johnqt": "Flex",
    "Kyu": "Smokes",
    "cortezia": "Sentinel",
    "N4RRATE": "Initiator",

    # G2 Esports
    "valyn": "Smokes",
    "jawgemo": "Duelist",
    "BABYBAY": "Flex",
    "leaf": "Sentinel",
    "trent": "Initiator",

    # ENVY
    "POPPIN": "Initiator",
    "Eggsterr": "Duelist",
    "Inspire": "Sentinel",
    "keznit": "Smokes",
    "Rossy": "Flex",
}

# Application Default credentials are automatically created (with above gcloud commands)
# simple firebase initialization
app = firebase_admin.initialize_app()
db = firestore.client()

# think of the collection as the database and a document as an entry in that database
# bunch of sample document setting
fantasy_league_name = "2026_americas_kickoff"
fantasy_leagues_collection_ref = db.collection("fantasy_leagues")

applicable_tournament_urls = ["https://www.vlr.gg/event/stats/2501/vct-2025-americas-stage-2"]

for applicable_tournament_url in applicable_tournament_urls:
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(applicable_tournament_url, headers=headers)
    soup = BeautifulSoup(response.content, "html.parser")
    player_stats_rows = soup.select("table.wf-table.mod-stats.mod-scroll tbody tr")
    # print(player_stats_rows)
    eligible_players = {"Asuna", "bang", "vora", "Cryocells", "Timotino",
                        "Zellsis", "penny", "Xeppaa", "v1c", "OXY",
                        "supamen", "C0M", "bao", "Okeanos", "dgzin",
                        "nerve", "artzin", "eeiu", "koalanoob", "alym",
                        "saadhak", "mwzera", "silentzz", "Less", "Dantedeu5",
                        "spike", "blowz", "Neon", "kiNgg", "Sato",
                        "lukxo", "Darker", "Virtyy", "pANcada", "cauanzin",
                        "zekken", "Mazino", "aspas", "Verno",
                        "brawk", "keiko", "mada", "skuba", "Ethan",
                        "Reduxx", "johnqt", "Kyu", "cortezia", "N4RRATE",
                        "valyn", "jawgemo", "BABYBAY", "leaf", "trent",
                        "POPPIN", "Eggsterr", "Inspire", "keznit", "Rossy"}
    
    for player_stats_row in player_stats_rows:
        player_name = player_stats_row.select_one("div.text-of").text.strip()
        
        if player_name not in eligible_players:
            print(player_name + " not found in split 2 players")
            continue

        player_shorthandTeamName = player_stats_row.select_one("div.stats-player-country").text.strip()
        player_role = player_roles.get(player_name, None)
        
        player_agent_imgs = player_stats_row.select("td.mod-agents > div > img")
        player_agents = [img['src'].split('/')[-1].split('.')[0].capitalize() for img in player_agent_imgs]
        player_total_rounds = player_stats_row.select_one("td.mod-rnd").text.strip()
        
        colored_cells_values = player_stats_row.select("td.mod-color-sq > div.color-sq > span")
        player_acs = colored_cells_values[1].text.strip()
        player_kd_ratio = colored_cells_values[2].text.strip()
        player_kast_percentage = colored_cells_values[3].text.strip()
        player_adr = colored_cells_values[4].text.strip()
        player_kpr = colored_cells_values[5].text.strip()
        player_apr = colored_cells_values[6].text.strip()
        player_fkpr = colored_cells_values[7].text.strip()
        player_fdpr = colored_cells_values[8].text.strip()
        player_clutch_rate = player_stats_row.select_one("td.mod-cl").text.strip()
        
        total_stat_cells = tds_without_class = [td for td in player_stats_row.find_all('td') if not td.has_attr('class')]
        player_total_k = total_stat_cells[0].text.strip()
        player_total_d = total_stat_cells[1].text.strip()
        player_total_a = total_stat_cells[2].text.strip()
        player_total_fk = total_stat_cells[3].text.strip()
        player_total_fd = total_stat_cells[4].text.strip()
        
        players_collection_ref = fantasy_leagues_collection_ref.document(fantasy_league_name).collection("players")
        player_doc_ref = players_collection_ref.document(player_name)
        try:
            player_doc_ref.update({
                                "role": player_role,
                                "agents": player_agents,
                                "totalRounds": player_total_rounds,
                                "ACS": player_acs,
                                "KDRatio": player_kd_ratio,
                                "KASTPercentage": player_kast_percentage,
                                "ADR": player_adr,
                                "KPR": player_kpr,
                                "APR": player_apr,
                                "FKPR": player_fkpr,
                                "FDPR": player_fdpr,
                                "clutchRate": player_clutch_rate,
                                "totalK": player_total_k,
                                "totalD": player_total_d,
                                "totalA": player_total_a,
                                "totalFK": player_total_fk,
                                "totalFD": player_total_fd})
        except NotFound:
            print(player_name + " not found in existing split 2 players")
            player_doc_ref.set({
                                "role": player_role,
                                "agents": player_agents,
                                "totalRounds": player_total_rounds,
                                "ACS": player_acs,
                                "KDRatio": player_kd_ratio,
                                "KASTPercentage": player_kast_percentage,
                                "ADR": player_adr,
                                "KPR": player_kpr,
                                "APR": player_apr,
                                "FKPR": player_fkpr,
                                "FDPR": player_fdpr,
                                "clutchRate": player_clutch_rate,
                                "totalK": player_total_k,
                                "totalD": player_total_d,
                                "totalA": player_total_a,
                                "totalFK": player_total_fk,
                                "totalFD": player_total_fd})

    # Ensure role field is set for every eligible player in Firestore
    players_collection_ref = fantasy_leagues_collection_ref.document(fantasy_league_name).collection("players")
    for name in eligible_players:
        role = player_roles.get(name, None)
        doc_ref = players_collection_ref.document(name)
        try:
            doc_ref.update({"role": role})
        except NotFound:
            print(name + " not found when updating role; creating doc with role only")
            doc_ref.set({"role": role})
