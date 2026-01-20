import firebase_admin
from firebase_admin import firestore

import requests
from bs4 import BeautifulSoup

from google.api_core.exceptions import NotFound

player_roles = {
    # start 100T
    "Cryocells": "Duelist",
    "eeiu": "Initiator",
    "zander": "Smokes",
    "Boostio": "Sentinel",
    "Asuna": "Flex",
    # end 100T
    # start FURIA
    "Loss": "Duelist",
    "tuyz": "Smokes",
    "heat": "Sentinel",
    "Urango": "Flex",
    # end FURIA
    # start LEV
    "Sato": "Duelist",
    "C0M": "Initiator",
    "kiNgg": "Smokes",
    "tex": "Sentinel",
    "Okeanos": "Flex",
    # end LEV
    # start NRG
    "mada": "Duelist",
    "brawk": "Initiator",
    "skuba": "Smokes",
    "s0m": "Sentinel",
    "Ethan": "Flex",
    # end NRG
    # start C9
    "OXY": "Duelist",
    "Xeppaa": "Initiator",
    "v1c": "Smokes",
    "neT": "Sentinel",
    "mitch": "Flex",
    # end C9
    # start 2G
    "gobera": "Flex",
    "spike": "Duelist",
    "lz": "Smokes",
    "silentzz": "Flex",
    # end 2G
    # start MIBR
    "aspas": "Duelist",
    "Verno": "Initiator",
    "xenom": "Smokes",
    "cortezia": "Sentinel",
    "artzin": "Flex",
    # end MIBR
    # start EG
    "icy": "Duelist",
    "Derrek": "Initiator",
    "NaturE": "Initiator",
    "supamen": "Smokes",
    "yay": "Flex",
    # end EG
    # start KRU
    "keznit": "Duelist",
    "adverso": "Initiator",
    "Melser": "Smokes",
    "Shyy": "Sentinel",
    "Mazino": "Flex",
    # end KRU
    # start SEN
    "zekken": "Duelist",
    "johnqt": "Initiator",
    "N4RRATE": "Initiator",
    "bang": "Smokes",
    "Zellsis": "Sentinel",
    # end SEN
    # start G2
    "jawgemo": "Duelist",
    "trent": "Initiator",
    "JonahP": "Initiator",
    "valyn": "Smokes",
    "leaf": "Sentinel",
    # end G2
    # start LOUD
    "pANcada": "Smokes",
    "Virtyy": "",
    "RobbieBk": "",
    "cauanzin": "Initiator",
    # end LOUD
}

# Application Default credentials are automatically created (with above gcloud commands)
# simple firebase initialization
app = firebase_admin.initialize_app()
db = firestore.client()

# think of the collection as the database and a document as an entry in that database
# bunch of sample document setting
fantasy_league_name = "2025_americas_split2"
fantasy_leagues_collection_ref = db.collection("fantasy_leagues")

applicable_tournament_urls = ["https://www.vlr.gg/509801/cloud9-vs-furia-vct-2025-americas-stage-2-w1",
                              "https://www.vlr.gg/509802/leviat-n-vs-loud-vct-2025-americas-stage-2-w1"
                             ]

eligible_players =  {   "johnqt", "N4RRATE", "bang", "Zellsis", "zekken",
                        "artzin", "xenom", "cortezia", "Verno", "aspas",
                        "Asuna", "Boostio", "eeiu", "Cryocells", "zander",
                        "mitch", "neT", "Xeppaa", "v1c", "OXY",
                        "supamen", "yay", "Derrek", "NaturE", "icy",
                        "tuyz", "Urango", "heat", "Loss", "Palla",
                        "Melser", "keznit", "adverso", "Mazino", "Shyy",
                        "C0M", "tex", "Okeanos", "kiNgg", "Sato",
                        "pANcada", "Virtyy", "RobbieBk", "cauanzin", "lukxo",
                        "brawk", "s0m", "mada", "skuba", "Ethan",
                        "valyn", "jawgemo", "JonahP", "leaf", "trent",
                        "lz", "silentzz", "gobera", "spike"
                    }

for applicable_tournament_url in applicable_tournament_urls:
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(applicable_tournament_url, headers=headers)
    soup = BeautifulSoup(response.content, "html.parser")
    
    match_total_maps = (int)(soup.select_one("span.match-header-vs-score-winner").text.strip()) + int(soup.select_one("span.match-header-vs-score-loser").text.strip())
    match_total_rounds = 0

    for roundCount in soup.select("div.vm-stats-game-header div.team div.score"):
        match_total_rounds += (int)(roundCount.text.strip())

    player_stats_rows = soup.select("div.vm-stats-game.mod-active table.wf-table-inset.mod-overview tbody tr")
    for player_stats_row in player_stats_rows:
        player_name = player_stats_row.select_one("div.text-of").text.strip()
        # print(player_name)
        
        if player_name not in eligible_players:
            print("ERROR: " + player_name + " not found in split 2 players")
            exit()

        player_shorthandTeamName = player_stats_row.select_one("div.ge-text-light").text.strip()
        player_role = player_roles.get(player_name, None)
        
        player_agents = [img['title'] for img in player_stats_row.select("td.mod-agents img")]
        
        stat_cells_values = player_stats_row.select("td")
        player_acs = stat_cells_values[3].select_one("span span.side.mod-side.mod-both").text.strip()
        player_k = stat_cells_values[4].select_one("span span.side.mod-side.mod-both").text.strip()
        player_d = stat_cells_values[5].select_one("span span span.side.mod-both").text.strip()
        player_a = stat_cells_values[6].select_one("span span.side.mod-both").text.strip()
        player_adr = stat_cells_values[9].select_one("span span.side.mod-both").text.strip()
        player_fk = stat_cells_values[11].select_one("span span.side.mod-both").text.strip()
        player_fd = stat_cells_values[12].select_one("span span.side.mod-both").text.strip()
        
        # players_collection_ref = fantasy_leagues_collection_ref.document(fantasy_league_name).collection("players")
        # player_doc_ref = players_collection_ref.document(player_name)
        
        # try:
        #     player_doc_ref.update({
        #         "role": player_role,
        #         "agents": firestore.arrayUnion(player_agents),
        #         "totalRounds": player_total_rounds,
        #         "ACS": player_acs,
        #         "KDRatio": player_kd_ratio,
        #         "KASTPercentage": player_kast_percentage,
        #         "ADR": player_adr,
        #         "KPR": player_kpr,
        #         "APR": player_apr,
        #         "FKPR": player_fkpr,
        #         "FDPR": player_fdpr,
        #         "clutchRate": player_clutch_rate,
        #         "totalK": player_total_k,
        #         "totalD": player_total_d,
        #         "totalA": player_total_a,
        #         "totalFK": player_total_fk,
        #         "totalFD": player_total_fd
        #     })
        # except NotFound:
        #     print(player_name + "not found in existing split 2 players")
        #     player_doc_ref.set({
        #                         "role": player_role,
        #                         "agents": player_agents,
        #                         "totalRounds": player_total_rounds,
        #                         "ACS": player_acs,
        #                         "KDRatio": player_kd_ratio,
        #                         "KASTPercentage": player_kast_percentage,
        #                         "ADR": player_adr,
        #                         "KPR": player_kpr,
        #                         "APR": player_apr,
        #                         "FKPR": player_fkpr,
        #                         "FDPR": player_fdpr,
        #                         "clutchRate": player_clutch_rate,
        #                         "totalK": player_total_k,
        #                         "totalD": player_total_d,
        #                         "totalA": player_total_a,
        #                         "totalFK": player_total_fk,
        #                         "totalFD": player_total_fd})
