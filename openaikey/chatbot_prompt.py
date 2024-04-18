
import openai
from pymongo import MongoClient
from openai import OpenAI
import json
import sys

openai_client = OpenAI()


def generate_gpt_response(prompt_data):
    # Set up OpenAI GPT-3 API key
    #openai.api_key = 'your_openai_api_key'
    #print(data)
   
    #Call OpenAI GPT-3 API
    # response = openai_client.chat.completions.create(
    #     model="gpt-3.5-turbo",
    #     messages=[
    #         {"role": "system", "content": "You are a helpful assistant."},
    #         {"role": "user", "content": prompt_data},
    #     ],
    #     max_tokens=50
    # )

    print("---------chatbot response----------\n",prompt_data)
    # Extract generated caption
    # generated_caption = response['choices'][0]['message']['content'].strip()
    # generated_caption= response.choices[0].message.content
  
    # print(json.dumps(generated_caption))
    

if __name__ == "__main__":
  prompt_data = sys.argv[1]
  generate_gpt_response(prompt_data)