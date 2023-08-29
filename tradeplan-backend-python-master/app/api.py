from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.generate_chart import *

app = FastAPI()

ALLOWED_HOSTS = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

timeframe = {'1H': 'day', '4H': 'week', '1D': 'month'}
signal = {'buy': 'bullish', 'sell': 'bearish'}


@app.get("/", tags=["root"])
async def read_root(req: Request) -> dict:
    print(req.client)
    return {"message": "Welcome to your todo list."}


@app.post("/genchart/")
async def get_todos(req: Request) -> dict:
    print("accept request!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    request = await req.json()
    # threading.Thread(target=main, args=(request['assets'], signal[request['action']], request['user_email'])).start()
    main(request['assets'], signal[request['action']], request['user_email'], request['user_name'])
    return {'result': 'ok'}
