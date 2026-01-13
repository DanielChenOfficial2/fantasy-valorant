import firebase_admin
from firebase_admin import firestore

import requests
from bs4 import BeautifulSoup

from google.api_core.exceptions import NotFound

player_roles = {
    # start MIBR
    "aspas": "Duelist",
    "Verno": "Initiator",
    "xenom": "Smokes",
    "cortezia": "Sentinel",
    "artzin": "Flex",
    # end MIBR
    # start SEN
    "zekken": "Duelist",
    "johnqt": "Initiator",
    "N4RRATE": "Initiator",
    "bang": "Smokes",
    "Zellsis": "Sentinel",
    # end SEN
    # start BLG
    "whzy": "Duelist",
    "Knight": "Initiator",
    "nephh": "Initiator",
    "rushia": "Smokes",
    "Levius": "Sentinel",
    # end BLG
    # start Wolves
    "Juicy": "Duelist",
    "SiuFatBB": "Initiator",
    "Spring": "Smokes",
    "Lysoar": "Sentinel",
    "Yuicaw": "Flex",
    # end Wolves
    # start GENG
    "t3xture": "Duelist",
    "Ash": "Initiator",
    "Karon": "Smokes",
    "Foxy9": "Sentinel",
    "Munchkin": "Flex",
    # end GENG
    # start PRX
    "s0mething": "Duelist",
    "Jinggg": "Duelist",
    "PatMen": "Initiator",
    "d4v41": "Sentinel",
    "f0rsakeN": "Flex",
    # end PRX
    # start TH
    "MiniBoo": "Duelist",
    "RieNs": "Initiator",
    "Boo": "Smokes",
    "benjyfishy": "Sentinel",
    "Wo0t": "Flex",
    # end TH
    # start TL
    "kamo": "Duelist",
    "paTiTek": "Initiator",
    "Serial": "Sentinel",
    "Keiko": "Flex",
    "Wo0t": "Flex",
}

# Application Default credentials are automatically created (with above gcloud commands)
# simple firebase initialization
app = firebase_admin.initialize_app()
db = firestore.client()

# think of the collection as the database and a document as an entry in that database
# bunch of sample document setting
fantasy_league_name = "2025_toronto_groups"
fantasy_leagues_collection_ref = db.collection("fantasy_leagues")

applicable_tournament_urls = ["https://www.vlr.gg/event/stats/2347/champions-tour-2025-americas-stage-1?exclude=29969.29970.29971.29972.29973&min_rounds=0&agent=all",
                              "https://www.vlr.gg/event/stats/2380/champions-tour-2025-emea-stage-1?exclude=29986.29987.29988.29989.29990&min_rounds=0&agent=all",
                              "https://www.vlr.gg/event/stats/2379/champions-tour-2025-pacific-stage-1?exclude=29912.29913.29914.29915.29916&min_rounds=0&agent=all",
                              "https://www.vlr.gg/event/stats/2359/champions-tour-2025-china-stage-1?exclude=29562.29563.29564.29565.29566&min_rounds=0&agent=all"]

for applicable_tournament_url in applicable_tournament_urls:
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(applicable_tournament_url, headers=headers)
    soup = BeautifulSoup(response.content, "html.parser")
    player_stats_rows = soup.select("table.wf-table.mod-stats.mod-scroll tbody tr")
    # print(player_stats_rows)
    eligible_players = {"johnqt", "N4RRATE", "bang", "Zellsis", "zekken",
                        "artzin", "xenom", "cortezia", "Verno", "aspas",
                        "whzy", "Levius", "rushia", "nephh", "Knight",
                        "Spring", "Lysoar", "Yuicaw", "Juicy", "SiuFatBB",
                        "Munchkin", "Foxy9", "Ash", "t3xture", "Karon",
                        "Jinggg", "f0rsakeN", "d4v41", "something", "PatMen",
                        "Boo", "MiniBoo", "Wo0t", "RieNs", "benjyfishy",
                        "nAts", "paTiTek", "Keiko", "kamo", "Serial"}
    
    for player_stats_row in player_stats_rows:
        player_name = player_stats_row.select_one("div.text-of").text.strip()
        
        if player_name not in eligible_players:
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
