import firebase_admin
from firebase_admin import firestore

import requests
from bs4 import BeautifulSoup

# Application Default credentials are automatically created (with above gcloud commands)
# simple firebase initialization
app = firebase_admin.initialize_app()
db = firestore.client()

# think of the collection as the database and a document as an entry in that database
# bunch of sample document setting
fantasy_league_name = "2025split1"
fantasy_leagues_collection_ref = db.collection("fantasyleagues")

applicable_tournament_urls = ["https://www.vlr.gg/event/stats/2347/champions-tour-2025-americas-stage-1?exclude=&min_rounds=0&agent=all",
                              "https://www.vlr.gg/event/stats/2379/champions-tour-2025-pacific-stage-1?exclude=&min_rounds=0&agent=all",
                              "https://www.vlr.gg/event/stats/2380/champions-tour-2025-emea-stage-1?exclude=&min_rounds=0&agent=all"]

for applicable_tournament_url in applicable_tournament_urls:
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(applicable_tournament_url, headers=headers)
    soup = BeautifulSoup(response.content, "html.parser")
    player_stats_rows = soup.select("table.wf-table.mod-stats.mod-scroll tbody tr")
    # print(player_stats_rows)
    for player_stats_row in player_stats_rows:
        player_name = player_stats_row.select_one("div.text-of").text.strip()
        player_shorthandTeamName = player_stats_row.select_one("div.stats-player-country").text.strip()
        
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
        player_doc_ref.update({"agents": player_agents,
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