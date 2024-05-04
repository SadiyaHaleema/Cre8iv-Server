
import openai
from pymongo import MongoClient
from openai import OpenAI
import json
import sys
import re
openai_client = OpenAI()

# Define the updated remove_unwanted_text function
def remove_unwanted_text(text):
     # Regular expression to match unwanted patterns
    patterns_to_remove = [
    r'\d+',                      # Match digits
    r'[^#\.,\w\s]',              # Match non-alphanumeric characters except hashtags, full stops, and necessary commas
    r'\b\w{1,2}\b',              # Match words with 1 or 2 characters
    r'\b(?:a|an|the)\b'         # Match common stop words (optional)
]

    
    # Combine all patterns into a single regular expression
    combined_pattern = '|'.join(patterns_to_remove)
    # Remove excessive whitespace while preserving spaces between words
    # Apply the combined regular expression to remove unwanted text
    cleaned_text = re.sub(combined_pattern, '', text)
    
    # Remove excessive whitespace while preserving spaces between words
    cleaned_text = re.sub(r'\s+', ' ', cleaned_text)
    
    return cleaned_text.strip()  # Strip leading and trailing whitespace

def captiongenerator(instaaccountusername):
    # Connect to MongoDB
    client = MongoClient('mongodb+srv://cre8iv:cre8iv#2023@cluster0.uxwdbzv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')  # Replace 'your_mongo_db_connection_string' with your actual connection string
    db = client['cre8iv']  # Replace 'your_database_name' with your actual database name
    collection = db['pageinfos']  # Replace 'posts' with your actual collection name

    # Fetch data from MongoDB

    data = collection.find_one({"insta_username":instaaccountusername})

    # Construct a compelling prompt message
    prompt_msg = f"Craft a captivating caption for our brand, known for {data['biography']}.\n\n"

    prompt_msg += f"Our brand operates in the '{data['category']}' category, offering unique {data['keywords']}.\n\n"
    prompt_msg += f"Generate a captivating caption based on the content of the uploaded image:\n\nThe image includes the following objects: {', '.join(data['imgObj'])} and text: '{data['imgText']}'\n\n"

    prompt_msg += f"Generate a captivating caption that resonates with our audience and drives engagement.\n\n"
    
    prompt_msg+= f"Also add suitable emojis & hashtags if they are suitable with the caption.\n\n"
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
    # Remove unwanted text from the generated caption
    filtered_response = remove_unwanted_text(generated_caption)
    # hardcode = "Unlock endless opportunities with GDSC - NUST! Join us for a glimpse into a world of innovative projects, corporate insights, and cutting-edge workshops. Your journey to success starts here. #GDSCNUST #GreatThingsToCome"
    #print(json.dumps(hardcode))
    
    
      
    print(json.dumps(filtered_response))
  
if __name__ == "__main__":
   

    instaaccountusername = sys.argv[1]
    captiongenerator(instaaccountusername)