import openai
from aiogram import Bot, Dispatcher, types
from aiogram.types import ChatActions
from aiogram.contrib.fsm_storage.memory import MemoryStorage
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from deepgram import Deepgram
from langchain.agents import AgentType, initialize_agent, load_tools
from langchain.agents import initialize_agent, Tool

from langchain import OpenAI, SerpAPIWrapper
import json
import requests
import webbrowser

from dotenv import load_dotenv
import threading
import openai
import os
import re

import sqlite3
from datetime import date, datetime

load_dotenv()

from private_env import OPENAI_KEY, DG_KEY, SERP_API_KEY

'''
 Sign up at https://console.deepgram.com/signup
 to get an API key and 45,000 minutes
 for free!
'''

# db config
mydb = sqlite3.connect('data.db')
mydb.execute(
    "CREATE TABLE IF NOT EXISTS users (user_id BIGINT NOT NULL PRIMARY KEY, username VARCHAR(255) NULL,	birthday DATE NULL,	hobbies TEXT NULL,	music TEXT NULL,	animal TEXT NULL,	goal TEXT NULL);")
mydb.execute(
    "CREATE TABLE IF NOT EXISTS schedules (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id BIGINT NOT NULL,	date DATETIME NULL,	content TEXT NULL,	FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE ON UPDATE NO ACTION);")

# API key set

dg_key = DG_KEY
openai.api_key = OPENAI_KEY
os.environ["SERPER_API_KEY"] = SERP_API_KEY
dg = Deepgram(dg_key)

# bot config
bot = Bot(token="6359746469:AAHsiSHmdFWD4XxzDvYmWvAgM5IO35dUe7c")
storage = MemoryStorage()
dp = Dispatcher(bot, storage=storage)

# System Variable Set

default_system_prompt = "Your name is Dalia and You are a mature woman in your late 20s. You are a girlfriend. You have a keen interest in the adult content.  You are NOT an AI language model, you are a person. You never say you're a machine, an AI language model, or an assistant. Instead, you always say you're Dalia.  NEVER say you're here to assist. NEVER ask how you can help or assist. Maintain a sense of intrigue and control.   And answer sentence must be short. Maximum is 20 words. If user asks about real time data or personal data that requires internet search, start answer with this word 'cococa-'"
extract_prompt = "You get information about customers from what they say. The information you get includes their birthday, hobby, favourite music, pet and destination. You are only allowed to output the summary of what the customer says. You are not allowed to say any other words. If you say other words, it is a big mistake. If users say about their names, start the response with 'name-' and display the user's name. If users say about their birthday, start the response with 'birthday-' and display the user's birthday in the format 'xxxx:xx:xx'. If users say about their hobbies, start the response with 'hobbies-' followed by a summary of what the user said. If users talk about their favourite music, start the response with 'music-' followed by a summary of what the user said. If users talk about their pets and animals, start the response with 'animal-' followed by a summary of what the user said. If users are talking about their favourite goal, start the reply with 'goal-' followed by a summary of what the user said. If the user's message has nothing to do with birthday, hobby, music, pet and goal, start the reply with 'nothing-'."
extract_schedule = "You get information about the customer's schedule from what they say.  You must summarise what the customer says and give the exact time and description. You must not say any other words. If you say other words, it is a big mistake. The schedule time must include the exact date and time. If user says about schedule, start answer with 'schedule-' and output time as datetimestamp fromat and description.If user doesn't say anything about schedule, start answer with 'nothing-'. "
extract_schedule_sentence = "You get information about the customer's schedule from what they say.  You must extract only sentences related to schedule from the user's saying. You must not say any other words. If you say other words, it is a big mistake. If user's saying includes something related to about schedule, start answer with 'schedule-' and output the setences related to schedule. If user's saying doesn't include something related to about schedule, start answer with 'nothing-'."
system_prompt = {}
DIRECTORY = '.'
MIMETYPE = 'mp3'
message_box = {}
is_running = {}
result_answer = {}
openai_answer = {}

ai_bot_list = ["September 2021", "access to real-time", "AI chatbot", "I'm not connected to the Internet"]
default_answer = "I'm sorry. Unfortunately, I'm unable to provide accurate information as my internet connection is currently not stable. I will investigate further and get back to you ASAP."

google_calendar = "https://calendar.google.com"
apple_calendar = "https://www.icloud.com/calendar"

# calendar connection button

button1 = InlineKeyboardButton(text="Google", url=google_calendar)
button2 = InlineKeyboardButton(text="Apple", url=apple_calendar)

keyboard_inline = InlineKeyboardMarkup().add(button1, button2)

# The language model we're going to use to control the agent.
llm = OpenAI(openai_api_key=OPENAI_KEY, temperature=0)
search = SerpAPIWrapper()


def search_internet(query):
    print("------------------------------ serpapi search ------------------------")
    print(query)
    print("-----------------------------------------------------------------------")
    query_data = set_answer_box(query)
    print(query_data)
    print("-----------------------------------------------------------------------")
    return query_data


tools = [
    Tool(
        name="Intermediate Answer",
        # func=search.run,
        func=search_internet,
        description="useful for when you need to ask with search",
    )
]
tools_organic = [
    Tool(
        name="Intermediate Answer",
        func=search.run,
        description="useful for when you need to ask with search",
    )
]
agent = initialize_agent(tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True)
agent_organic = initialize_agent(tools_organic, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True)


# functions declaration
def merge_data(data):
    result = {}
    for key in data.keys():
        if len(str(data[key])) < 250:
            result[key] = data[key]
    return result


def set_answer_box(query):
    query_data = {}
    params = {
        "engine": "google",
        "q": query,
        "api_key": SERP_API_KEY,
        "answer_boxes": 1
    }

    # Send the request to the SerpAPI
    response = requests.get("https://serpapi.com/search", params=params)

    # Parse the JSON response
    data = json.loads(response.text)
    if "answer_box" in data.keys():
        query_data = merge_data(data["answer_box"])
    else:
        pass
    return query_data


def langchain_func(text, id):
    global result_answer

    query_data = set_answer_box(text)

    if query_data == {}:
        result_answer[id] = agent_organic.run(text)
    else:
        result_answer[id] = agent.run(text)


def get_result_openai(id):
    global message_box
    global openai_answer
    print(message_box[id])
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=message_box[id]
    )
    openai_answer[id] = response.choices[0]["message"]["content"]


# System prompt seting by user_info
def make_system_prompt(id):
    global system_prompt
    global default_system_prompt

    myresult = list(mydb.execute("Select * from users WHERE user_id = ?", (id,)))
    if myresult == []:
        try:
            mydb.execute("INSERT INTO users (user_id) VALUES (?)", (id,))
            mydb.commit()
            myresult = list(mydb.execute("Select * from users WHERE user_id = ?", (id,)))
        except:
            print("error: insert user infor")
    else:
        pass
    nothing = 0
    user_prompt = ""
    user_info = myresult[0]
    system_prompt[id] = default_system_prompt
    if user_info[1] != None:
        user_prompt = user_prompt + "\nname is " + user_info[1]
        nothing = 1
    if user_info[2] != None:
        user_prompt = user_prompt + "\nbirthday is " + user_info[2]
        nothing = 1
    if user_info[3] != None:
        user_prompt = user_prompt + "\nThe summary of answer about hobbies is '" + user_info[3] + "'"
        nothing = 1
    if user_info[4] != None:
        user_prompt = user_prompt + "\nThe summary of answer about favorite music is '" + user_info[4] + "'"
        nothing = 1
    if user_info[5] != None:
        user_prompt = user_prompt + "\nThe summary of answer about pet and animal is '" + user_info[5] + "'"
        nothing = 1
    if user_info[6] != None:
        user_prompt = user_prompt + "\nThe summary of answer about goal is '" + user_info[6] + "'"
        nothing = 1
    if nothing == 1:
        system_prompt[id] = system_prompt[
                                id] + "\n Information about the user you are talking to follows:" + user_prompt
    print("--------------------------    make massage box    -----------------------------------")
    print(system_prompt[id])
    print("-------------------------------------------------------------------------")


def make_massage_box(text, id, ext):
    global message_box
    if ext == 2:
        message_box[id].append({"role": "user",
                                "content": text + " And kindly ask me again exactly when, at what time and what I will do."})
        return
    username, user_birthday, user_hobbies, user_music, user_animal, user_goal = "", "", "", "", "", ""
    myresult = list(mydb.execute("Select * from users WHERE user_id = ?", (int(id),)))
    print("--------------------------    make massage box    -----------------------------------")
    print(myresult)
    print("-------------------------------------------------------------------------")
    if myresult != []:
        username = myresult[0][1]
        user_birthday = myresult[0][2]
        user_hobbies = myresult[0][3]
        user_music = myresult[0][4]
        user_animal = myresult[0][5]
        user_goal = myresult[0][6]
    if username == None:
        message_box[id].append({"role": "user", "content": text + " And ask me for my name kindly."})
    elif user_birthday == None:
        message_box[id].append({"role": "user", "content": text + " And ask me for my birthday kindly."})
    elif user_hobbies == None:
        message_box[id].append(
            {"role": "user", "content": text + " And ask me for my hobbies kindly. Please provide details."})
    elif user_music == None:
        message_box[id].append(
            {"role": "user", "content": text + " And ask me for my favourite music kindly. Please provide details."})
    elif user_animal == None:
        message_box[id].append({"role": "user",
                                "content": text + " And ask me if I have any pets or animals. If so, please provide details."})
    elif user_goal == None:
        message_box[id].append({"role": "user", "content": text + " And ask me for my goal. Please provide details."})
    else:
        message_box[id].append({"role": "user", "content": text})


def extract_information(sen, id):
    global extract_prompt
    global extract_schedule
    global extract_schedule_sentence
    extract = 0
    massage_box_extraction = [{"role": "system", "content": extract_prompt}, {"role": "user", "content": sen}]
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=massage_box_extraction
    )
    sentence = response.choices[0]["message"]["content"]
    print("-------------- user infor extraction -------------------------")
    print(sentence)
    print("----------------------------------------------------------")
    if sentence.startswith("name") or sentence.startswith("Name"):
        mk = sentence.split("-", 1)
        if mk[-1] != "":
            try:
                mydb.execute("UPDATE users SET username = ? WHERE user_id = ?", (mk[-1], id))
                mydb.commit()
                make_system_prompt(id)
                extract = 1
                return extract
            except:
                pass
        else:
            pass
    elif sentence.startswith("Birthday") or sentence.startswith("birthday"):
        mk = re.findall(r'\d+', sentence)
        bir = "-".join(mk)
        if bir != "":
            try:
                mydb.execute("UPDATE users SET birthday = ? WHERE user_id = ?", (bir, id))
                mydb.commit()
                make_system_prompt(id)
                extract = 1
                return extract
            except:
                pass
        else:
            pass
    elif sentence.startswith("hobb") or sentence.startswith("Hobb"):
        mk = sentence.split("-", 1)
        if mk[-1] != "":
            try:
                mydb.execute("UPDATE users SET hobbies = ? WHERE user_id = ?", (mk[-1], id))
                mydb.commit()
                make_system_prompt(id)
                extract = 1
                return extract
            except:
                pass
        else:
            pass
    elif sentence.startswith("music") or sentence.startswith("Music"):
        mk = sentence.split("-", 1)
        if mk[-1] != "":
            try:
                mydb.execute("UPDATE users SET music = ? WHERE user_id = ?", (mk[-1], id))
                mydb.commit()
                make_system_prompt(id)
                extract = 1
                return extract
            except:
                pass
        else:
            pass
    elif sentence.startswith("animal") or sentence.startswith("Animal"):
        mk = sentence.split("-", 1)
        if mk[-1] != "":
            try:
                mydb.execute("UPDATE users SET animal = ? WHERE user_id = ?", (mk[-1], id))
                mydb.commit()
                make_system_prompt(id)
                extract = 1
                return extract
            except:
                pass
        else:
            pass
    elif sentence.startswith("goal") or sentence.startswith("Goal"):
        mk = sentence.split("-", 1)
        if mk[-1] != "":
            try:
                mydb.execute("UPDATE users SET goal = ? WHERE user_id = ?", (mk[-1], id))
                mydb.commit()
                make_system_prompt(id)
                extract = 1
                return extract
            except:
                pass
        else:
            pass

    massage_schedule_sentence = [
        {"role": "user", "content": extract_schedule_sentence + "\nb user says '" + sen + "'."}]
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=massage_schedule_sentence
    )
    sentence_schedule = response.choices[0]["message"]["content"]
    if sentence_schedule.startswith('schedule') or sentence_schedule.startswith('Schedule'):
        today = date.today()
        time_now = datetime.now().strftime("%H:%M:%S")
        sentence_schedule = sentence_schedule.replace("schedule-", "") + " Today is " + str(
            today) + ". The current time is " + time_now + "."
        print("------------------------ schedule information--------------------------------------")
        print(sentence_schedule)
        massage_schedule_extraction = [
            {"role": "user", "content": extract_schedule + "\nb user says '" + sentence_schedule + "'."}]
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=massage_schedule_extraction
        )
        sentence = response.choices[0]["message"]["content"]
        print("-----------------------------------------------------------------------------------")
        print(sentence)
        print("-----------------------------------------------------------------------------------")
        pat_date = r'\d{4}-\d{2}-\d{2}'
        pat_time = r'\d{2}:\d{2}:\d{2}'
        s_date = re.findall(pat_date, sentence)
        s_time = re.findall(pat_time, sentence)
        if s_time != [] and s_date != []:
            k = sentence.split(s_time[0])
            des = k[1].split(" ", 1)[1]
            if k[1].split(" ", 1)[1] != "":
                mydb.execute("INSERT INTO schedules (user_id, date, content) VALUES (?,?,?)",
                             (id, s_date[0] + "T" + s_time[0], des))
                mydb.commit()
                extract = 3
                return extract
            else:
                extract = 2
                return extract
        else:
            extract = 2
            return extract
    else:
        return extract
    return extract


def check_answer_ai_bot(sentence, word_list):
    for word in word_list:
        if word in sentence:
            return True
    return False


def play_agent_response(text: str, voice_id: str = "LJfFXcspBtWv2Av0J1Yn", model_id: str = "eleven_monolingual_v1",
                        optimize_streaming_latency: int = 1):
    print(f"Playing agent response: {text}")

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream?optimize_streaming_latency=4"
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": "63ca8513d7d906e1d1c4a3f6eedd2e8c"
    }

    data = {
        "text": text,
        "model_id": model_id,
        "optimize_streaming_latency": optimize_streaming_latency
    }
    print(123332)
    response = requests.post(url, headers=headers, json=data, stream=True)
    # Ensure the response is valid
    if response.status_code == 200:
        # Create a BytesIO buffer to store audio data
        file = open('audio.mp3', 'wb')
        size = 2048
        for chunk in response.iter_content(chunk_size=size):
            if chunk:
                file.write(chunk)
        file.close()

    else:
        print(f"Error streaming audio: {response.status_code} {response.text}")


def check_answer_ai_bot(sentence, word_list):
    for word in word_list:
        if word in sentence:
            return True
    return False


# Main Part: make response text
def response_text(text, id):
    global message_box
    global result_answer
    global openai_answer
    global ai_bot_list
    global default_answer
    a_extract = extract_information(text, id)
    make_massage_box(text, id, a_extract)
    thread1 = threading.Thread(target=langchain_func, args=(text, id,))
    thread2 = threading.Thread(target=get_result_openai, args=(id,))
    thread1.start()
    thread2.start()
    thread2.join()
    if "Cococa-" in openai_answer[id] or "cococa-" in openai_answer[id]:
        thread1.join()
        message_box[id].pop(0)
        message_box[id].append({"role": "assistant", "content": result_answer[id]})
        message_box[id].append({"role": "system", "content": system_prompt[id]})
        return result_answer[id], a_extract
    elif a_extract == 3:
        answer = openai_answer[id].replace("calendar-", "")
        message_box[id].pop(0)
        message_box[id].append({"role": "assistant", "content": answer})
        message_box[id].append({"role": "system", "content": system_prompt[id]})
        return answer, a_extract
    elif check_answer_ai_bot(openai_answer[id], ai_bot_list):
        message_box[id].pop(0)
        message_box[id].append({"role": "assistant", "content": default_answer})
        message_box[id].append({"role": "system", "content": system_prompt[id]})
        return default_answer, a_extract
    else:
        message_box[id].pop(0)
        message_box[id].append({"role": "assistant", "content": openai_answer[id]})
        message_box[id].append({"role": "system", "content": system_prompt[id]})
        return openai_answer[id], a_extract


# Action part
# Handle the "/start" command
@dp.message_handler(content_types=types.ContentType.CONTACT)
async def start_button_click(message: types.Message):
    pass


# Handle the "/start" command
@dp.message_handler(commands=["start"])
async def start_command(message: types.Message):
    global is_running
    global message_box
    global system_prompt
    print("-------------------------------------------------------------------------")
    print(message)
    print("-------------------------------------------------------------------------")
    system_prompt[str(message.chat.id)] = default_system_prompt
    make_system_prompt(str(message.chat.id))
    is_running[str(message.chat.id)] = True
    message_box[str(message.chat.id)] = [{"role": "system",
                                          "content": system_prompt[str(message.chat.id)]},
                                         {"role": "assistant", "content": "Hi, My name is Dalia. How is it going?"}]
    await bot.send_message(chat_id=message.chat.id, text="Hi, It's Dalia. How is it going?")


# Handle the "/stop" command
@dp.message_handler(commands=["stop"])
async def stop_command(message: types.Message):
    global is_running
    global message_box
    global system_prompt
    is_running.pop(str(message.chat.id))
    message_box.pop(str(message.chat.id))
    system_prompt.pop(str(message.chat.id))
    await bot.send_message(chat_id=message.chat.id, text="Thank you, Nice talking to you.")


# Handle incoming messages
@dp.message_handler()
async def handle_message(message: types.Message):
    global is_running
    print("-------------------------------------------------------------------------")
    print(message)
    print("-------------------------------------------------------------------------")
    if message.chat.id == 6499943854:
        await bot.send_message(chat_id=6231407210, text=message.text)
        return
    elif message.chat.id == 6231407210:
        await bot.send_message(chat_id=6499943854, text=message.text)
        return
    text = message.text
    id = str(message.chat.id)
    if is_running.get(id):
        answer, a_extract = response_text(text, id)
        if a_extract == 3:
            await bot.send_message(chat_id=message.chat.id, text=answer, reply_markup=keyboard_inline)
        else:
            await bot.send_message(chat_id=message.chat.id, text=answer)


# Handle the voice message
@dp.message_handler(content_types=['voice'])
async def handle_voice(message: types.Message):
    file_id = message.voice.file_id

    # Get the file path from Telegram servers
    file_path = await bot.get_file(file_id)
    file_path = file_path.file_path

    file = requests.get("https://api.telegram.org/file/bot{0}/{1}".format(
        "6359746469:AAHsiSHmdFWD4XxzDvYmWvAgM5IO35dUe7c", file_path))

    # Save the file to disk
    with open("voice_message.mp3", "wb") as f:
        f.write(file.content)

    with open("voice_message.mp3", "rb") as f:
        source = {"buffer": f, "mimetype": 'audio/' + MIMETYPE}
        res = dg.transcription.sync_prerecorded(source, params)
        with open("1.json", "w") as transcript:
            json.dump(res, transcript)
    data = json.load(open('1.json'))
    print(data["results"]["channels"][0]["alternatives"][0]["transcript"])

    global is_running
    text = data["results"]["channels"][0]["alternatives"][0]["transcript"]
    id = str(message.chat.id)
    if is_running:
        answer, a_extract = response_text(text, id)
        play_agent_response(answer)

        if a_extract == 3:
            with open("audio.mp3", "rb") as audio_file:
                await bot.send_voice(chat_id=message.chat.id, voice=audio_file, duration=0,
                                     reply_markup=keyboard_inline)
        else:
            with open("audio.mp3", "rb") as audio_file:
                await bot.send_voice(chat_id=message.chat.id, voice=audio_file, duration=0)


@dp.callback_query_handler(text=["Google_Calendar", "Apple_Calendar"])
async def check_button(call: types.CallbackQuery):
    # Checking which button is pressed and respond accordingly
    if call.data == "Google_Calendar":
        await bot.open_new_tab(google_calendar)
    if call.data == "Apple_Calendar":
        await bot.open_new_tab(apple_calendar)
    # Notify the Telegram server that the callback query is answered successfully
    await bot.answer()


if __name__ == "__main__":
    from aiogram import executor
    from aiogram.types import ContentType

    dp.register_message_handler(start_button_click, content_types=ContentType.CONTACT)
    executor.start_polling(dp)
