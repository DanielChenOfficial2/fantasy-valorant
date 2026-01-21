# Relevant Stats Per Postmatch:
# Player
# Individual Match (add each to individual week info)
# All Maps 
# - Agents (add to array if doesn't exist)
# - Increment Overall Match Count
# - Increment Individual Week Match Count
#
# Individual Maps (add each to individual match info)
# - Map Name
# - ACS
# - K
# - D
# - A
# - FK
# - FD
# - Increment Overall Map Count
# - Increment Individual Week Map Count
#
# Fantasy Score Calc (Per Week)
# - Sum ACS, K, D, A, FK, FD individually for all maps in that week
# - Calculate Fantasy Score: (3.0×K)+(1.5×A)−(2.0×D)+(2.5×FK)−(2.0×FD)+(0.04×ACS)

# Player
# - Number of Matches Played
# - Number of Maps Played
# - Number of Rounds Played
# - Total ACS
# - Total K
# - Total D
# - Total A
# - Total FK
# - Total FD
# - Total Fantasy Score
# - Avg ACS
# - Avg K
# - Avg D
# - Avg A
# - Avg FK
# - Avg FD
#
# - Week x
#   - Number of Matches Played
#   - Number of Maps Played
#   - Number of Rounds Played
#   - Total ACS
#   - Total K
#   - Total D
#   - Total A
#   - Total FK
#   - Total FD
#   - Total Fantasy Score
#   - Avg ACS
#   - Avg K
#   - Avg D
#   - Avg A
#   - Avg FK
#   - Avg FD
#   - Match x
#     - Number of Maps Played
#     - Number of Rounds Played
#     - Total ACS
#     - Total K
#     - Total D
#     - Total A
#     - Total FK
#     - Total FD
#     - Total Fantasy Score
#     - Map x (maybe also do per halves?)
#       - Map name
#       - Number of Rounds Played
#       - ACS
#       - K
#       - D
#       - A
#       - FK
#       - FD
#       - Fantasy Score
import firebase_admin
from firebase_admin import firestore

import requests
from bs4 import BeautifulSoup

from google.api_core.exceptions import NotFound

def calculate_fantasy_score(acs, k, a, d, fk, fd):
    return 3.0 * k + 1.5 * a - 2.0 * d + 2.5 * fk - 2.0 * fd + 0.04 * acs

# Application Default credentials are automatically created (with above gcloud commands)
# simple firebase initialization
app = firebase_admin.initialize_app()
db = firestore.client()

# think of the collection as the database and a document as an entry in that database
# bunch of sample document setting
fantasy_league_name = "2026_americas_kickoff"
fantasy_leagues_collection_ref = db.collection("fantasy_leagues")
reset_player_stats = False
current_week = 1

applicable_tournament_urls = ["https://www.vlr.gg/596399/envy-vs-evil-geniuses-vct-2026-americas-kickoff-ur1",
                              "https://www.vlr.gg/596398/loud-vs-cloud9-vct-2026-americas-kickoff-ur1",
                              "https://www.vlr.gg/596400/kr-esports-vs-furia-vct-2026-americas-kickoff-ur1",
                              "https://www.vlr.gg/596401/100-thieves-vs-leviat-n-vct-2026-americas-kickoff-ur1",
                              "https://www.vlr.gg/596402/nrg-vs-cloud9-vct-2026-americas-kickoff-ur2",
                              "https://www.vlr.gg/596403/mibr-vs-envy-vct-2026-americas-kickoff-ur2",
                              "https://www.vlr.gg/596404/sentinels-vs-furia-vct-2026-americas-kickoff-ur2",
                              "https://www.vlr.gg/596405/g2-esports-vs-100-thieves-vct-2026-americas-kickoff-ur2"]
playerInfoArr = []
for applicable_tournament_url in applicable_tournament_urls:
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(applicable_tournament_url, headers=headers)
    soup = BeautifulSoup(response.content, "html.parser")
    player_stats_rows = soup.select("div.vm-stats-game.mod-active table.wf-table-inset.mod-overview tbody tr")
    for player_stats_row in player_stats_rows:
        player_name = player_stats_row.select_one("td.mod-player div.text-of").text.strip()
        print(player_name)
        player_shorthandTeamName = player_stats_row.select_one("td.mod-player div.ge-text-light").text.strip()
        # print(player_shorthandTeamName)

        stat_cells_values = player_stats_row.select("td.mod-stat span span.side.mod-both")
        player_acs = stat_cells_values[1].text.strip()
        player_k = stat_cells_values[2].text.strip()
        player_d = stat_cells_values[3].text.strip()
        player_a = stat_cells_values[4].text.strip()
        player_fk = stat_cells_values[9].text.strip()
        player_fd = stat_cells_values[10].text.strip()
        # print(player_acs)
        # print(player_k)
        # print(player_d)
        # print(player_a)
        # print(player_fk)
        # print(player_fd)

        players_collection_ref = fantasy_leagues_collection_ref.document(fantasy_league_name).collection("players")
        player_doc_ref = players_collection_ref.document(player_name)
        
        # Fetch existing player document and read stats if present
        player_current_acs = 0
        player_current_k = 0
        player_current_d = 0
        player_current_a = 0
        player_current_fk = 0
        player_current_fd = 0
        player_current_fantasy_score = 0
        
        try:
            player_snapshot = player_doc_ref.get()
            if player_snapshot.exists:
                player_current_acs = player_snapshot.get("ACS")
                player_current_k = player_snapshot.get("K")
                player_current_d = player_snapshot.get("D")
                player_current_a = player_snapshot.get("A")
                player_current_fk = player_snapshot.get("FK")
                player_current_fd = player_snapshot.get("FD")
                player_current_fantasy_score = player_snapshot.get("fantasyScore")
                print(f"Existing stats for {player_name}: ACS={player_current_acs}, K={player_current_k}, D={player_current_d}, A={player_current_a}, FK={player_current_fk}, FD={player_current_fd}")
            else:
                print(f"No existing document for {player_name}")
        except Exception as e:
            print(f"Error fetching document for {player_name}: {e}")

        player_updated_acs = float(player_current_acs) + float(player_acs)
        player_updated_k = int(player_current_k) + int(player_k)
        player_updated_d = int(player_current_d) + int(player_d)
        player_updated_a = int(player_current_a) + int(player_a)
        player_updated_fk = int(player_current_fk) + int(player_fk)
        player_updated_fd = int(player_current_fd) + int(player_fd)
        player_updated_fantasy_score = float(player_current_fantasy_score) + float(calculate_fantasy_score(player_updated_acs, player_updated_k, player_updated_a, player_updated_d, player_updated_fk, player_updated_fd))
        print(f"Updated stats for {player_name}: ACS={player_updated_acs}, K={player_updated_k}, D={player_updated_d}, A={player_updated_a}, FK={player_updated_fk}, FD={player_updated_fd}, fantasyScore={player_updated_fantasy_score}")
        print("-----")

        # Create weeks collection and a document for the current week
        weeks_collection_ref = player_doc_ref.collection("weeks")
        week_doc_ref = weeks_collection_ref.document(f"week{current_week}")
        try:
            week_doc_ref.set({
                "weekNumber": current_week,
                "ACS": float(player_updated_acs),
                "K": int(player_updated_k),
                "D": int(player_updated_d),
                "A": int(player_updated_a),
                "FK": int(player_updated_fk),
                "FD": int(player_updated_fd),
                "fantasyScore": float(player_updated_fantasy_score)
            })
            print(f"Created/updated week document: week{current_week}")
        except Exception as e:
            print(f"Error creating week document week{current_week}: {e}")

        if (reset_player_stats):
            try:
                player_doc_ref.update({
                                    "ACS": 0.0,
                                    "K": 0,
                                    "D": 0,
                                    "A": 0,
                                    "FK": 0,
                                    "FD": 0,
                                    "fantasyScore": 0.0})
            except Exception as e:
                print(f"Update Error: {e}")
                player_doc_ref.set({
                                    "shorthandTeamName": player_shorthandTeamName,
                                    "owner": None,
                                    "ACS": 0.0,
                                    "K": 0,
                                    "D": 0,
                                    "A": 0,
                                    "FK": 0,
                                    "FD": 0,
                                    "fantasyScore": 0.0})
        else:
            try:
                player_doc_ref.update({
                                    "ACS": float(player_updated_acs),
                                    "K": int(player_updated_k),
                                    "D": int(player_updated_d),
                                    "A": int(player_updated_a),
                                    "FK": int(player_updated_fk),
                                    "FD": int(player_updated_fd),
                                    "fantasyScore": float(player_updated_fantasy_score)})
            except Exception as e:
                print(f"Update Error: {e}")
                player_doc_ref.set({
                                    "shorthandTeamName": player_shorthandTeamName,
                                    "owner": None,
                                    "ACS": float(player_updated_acs),
                                    "K": int(player_updated_k),
                                    "D": int(player_updated_d),
                                    "A": int(player_updated_a),
                                    "FK": int(player_updated_fk),
                                    "FD": int(player_updated_fd),
                                    "fantasyScore": float(player_updated_fantasy_score)})

        # print(player_doc_ref)
        # try:
        #     player_doc_ref.update({
        #                         # "role": player_role,
        #                         # "agents": player_agents,
        #                         # "totalRounds": player_total_rounds,
        #                         "ACS": player_acs,
        #                         # "KDRatio": player_kd_ratio,
        #                         # "KASTPercentage": player_kast_percentage,
        #                         # "ADR": player_adr,
        #                         # "KPR": player_kpr,
        #                         # "APR": player_apr,
        #                         # "FKPR": player_fkpr,
        #                         # "FDPR": player_fdpr,
        #                         # "clutchRate": player_clutch_rate,
        #                         "totalK": player_total_k,
        #                         "totalD": player_total_d,
        #                         "totalA": player_total_a,
        #                         "totalFK": player_total_fk,
        #                         "totalFD": player_total_fd})
        # except NotFound:
        #     print(player_name + " not found in existing split 2 players")
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

