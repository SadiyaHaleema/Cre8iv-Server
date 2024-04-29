import openai
import json
import sys
from openai import OpenAI

openai_client = OpenAI()
def generate_gpt_response(prompt_data):
    # Call OpenAI GPT-3 API
  
  response = openai_client.chat.completions.create(
    model="gpt-4-turbo",
    messages=[
      {
        "role": "user",
        "content": prompt_data
      }
    ],
    temperature=1,
    max_tokens=256,
    top_p=1,
    frequency_penalty=0,
    presence_penalty=0
  )
  # print("---------chatbot response----------\n", prompt_data)
  # Extract generated response
  generated_postresponse = response.choices[0].message.content.strip()
  # Replace "\n" with newline character "\n"
  # generated_response = generated_postresponse.replace("\\n", "\n")
  print(generated_postresponse)

if __name__ == "__main__":
    prompt_data = sys.argv[1]
    generate_gpt_response(prompt_data)
  
    