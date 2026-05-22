# Quest Arena

A 3D GenLayer mini-game for community gatherings.

Players join a room, answer a short natural-language challenge, and let GenLayer's Intelligent Contract judge the round through validator consensus. The final leaderboard includes XP distribution for community rewards.

## Why GenLayer

Quest Arena uses subjective judging as the core mechanic. `finalize_room` sends all submissions to AI validators with a deterministic rubric, normalizes the returned leaderboard, and stores the result on-chain after consensus.

## Game Rules

- Multiplayer rooms.
- Default round length: 10 minutes.
- Valid round length: 5-15 minutes.
- Weekly replayability through seeded challenge packs.
- Leaderboard includes XP allocation.

## Project Layout

```text
contracts/
  QuestArena.py
frontend/
  src/
```

## Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Set `VITE_CONTRACT_ADDRESS` after deploying `contracts/QuestArena.py` in GenLayer Studio. The contract class shown by Studio is `QuestArena`. Leave `VITE_CONTRACT_ADDRESS` empty to use mock mode.

Current deployed contract:

```text
0x43205EA2541e8AA81131e1B5fB7ABD334c7Fcf15
```

Studio import link: https://studio.genlayer.com/?import-contract=0x43205EA2541e8AA81131e1B5fB7ABD334c7Fcf15

The contract uses a pinned GenLayer runtime:

```python
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
```

Do not replace it with `py-genlayer:test` for public Studio/studionet deploys; current Studio RPC rejects `:test` outside debug mode.

## Assets

The 3D arena uses selected files from Kenney City Kit Roads and Kenney Blocky Characters, licensed CC0. See `frontend/public/assets/licenses.json`.
