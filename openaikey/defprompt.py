
import openai
from pymongo import MongoClient
from openai import OpenAI
import json

openai_client = OpenAI()

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/cre8iv')  # Replace 'your_mongo_db_connection_string' with your actual connection string
db = client['cre8iv']  # Replace 'your_database_name' with your actual database name
collection = db['pageinfos']  # Replace 'posts' with your actual collection name

# Fetch data from MongoDB
#data = collection.find()
data = collection.find_one({"pageId":"17841424820010573"})
# Set up OpenAI GPT-3 API key
#openai.api_key = 'your_openai_api_key'
#print(data)
# Define your prompt with placeholders
prompt_msg = f"Create a captivating caption for a brand in the '{data['category']}' category, known for {data['biography']}, presents an image with keywords: {data['keywords']}. Craft a compelling caption for an image which contains these objects:{data['imgObj']}  and this text list {data['imgText']} ."

#Call OpenAI GPT-3 API
# response = openai_client.chat.completions.create(
#     model="gpt-3.5-turbo",
#     messages=[
#         {"role": "system", "content": "You are a helpful assistant."},
#         {"role": "user", "content": prompt_msg},
#     ],
#     max_tokens=50
# )

#print("---------Response----------\n",response)
# Extract generated caption
#generated_caption = response['choices'][0]['message']['content'].strip()
#generated_caption= response.choices[0].message.content
# Print or use the generated caption#
hardcode = "Unlock endless opportunities with GDSC - NUST! Join us for a glimpse into a world of innovative projects, corporate insights, and cutting-edge workshops. Your journey to success starts here. #GDSCNUST #GreatThingsToCome"
print(json.dumps(hardcode))
#print(json.dumps(generated_caption))
# Extract generated caption


