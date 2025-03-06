dfx deps deploy
dfx canister create vetkd_system_api --specified-id s55qq-oqaaa-aaaaa-aaakq-cai
dfx deploy vetkd_system_api
dfx deploy testc_backend
dfx generate testc_backend
dfx deploy testc_frontend
