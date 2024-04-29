
import openai
from pymongo import MongoClient
from openai import OpenAI
import json
import sys
openai_client = OpenAI()


def captiongenerator(instaaccountusername):
    # Connect to MongoDB
    client = MongoClient('mongodb://localhost:27017/cre8iv')  # Replace 'your_mongo_db_connection_string' with your actual connection string
    db = client['cre8iv']  # Replace 'your_database_name' with your actual database name
    collection = db['pageinfos']  # Replace 'posts' with your actual collection name

    # Fetch data from MongoDB

    data = collection.find_one({"insta_username":instaaccountusername})

    # Construct a compelling prompt message
    prompt_msg = f"Craft a captivating caption for our brand, known for {data['biography']}.\n\n"

    prompt_msg += f"Our brand operates in the '{data['category']}' category, offering unique {data['keywords']}.\n\n"
    prompt_msg += f"Generate a captivating caption based on the content of the uploaded image:\n\nThe image includes the following objects: {', '.join(data['imgObj'])} and text: '{data['imgText']}'\n\n"

    prompt_msg += "Generate a captivating caption that resonates with our audience and drives engagement.\n\n"
    
    # Define your prompt with placeholders
    # prompt_msg = f"Create a captivating caption for a brand in the '{data['category']}' category, known for {data['biography']}, presents an image with keywords: {data['keywords']}. Craft a compelling caption for an image which contains these objects:{data['imgObj']}  and this text list {data['imgText']} ."
  
    #print(prompt_msg)
    #Call OpenAI GPT-3 API
    response = openai_client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a marketing expert helping create engaging captions."},
            {"role": "user", "content": prompt_msg},
        ],
        max_tokens=50
    )

    
 
    generated_caption= response.choices[0].message.content.strip()
  
    # hardcode = "Unlock endless opportunities with GDSC - NUST! Join us for a glimpse into a world of innovative projects, corporate insights, and cutting-edge workshops. Your journey to success starts here. #GDSCNUST #GreatThingsToCome"
    #print(json.dumps(hardcode))
    
    
      
    print(json.dumps(generated_caption))
  
if __name__ == "__main__":
   

    instaaccountusername = sys.argv[1]
    captiongenerator(instaaccountusername)