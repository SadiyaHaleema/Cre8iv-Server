import openai
import json
import sys
from openai import OpenAI

openai_client = OpenAI()
def generate_gpt_response(prompt_data):
    # Call OpenAI GPT-3 API
  
  # response = openai_client.chat.completions.create(
  #   model="gpt-3.5-turbo",
  #   messages=[
  #     {
  #       "role": "user",
  #       "content": "write me three posts about shoes"
  #     }
  #   ],
  #   temperature=1,
  #   max_tokens=256,
  #   top_p=1,
  #   frequency_penalty=0,
  #   presence_penalty=0
  # )
  #print("---------chatbot response----------\n", prompt_data)
  # Extract generated response
  # generated_postresponse = response.choices[0].message.content.strip()
  # print(json.dumps(generated_postresponse, indent=2))
    hardcode="1.There's nothing quite like finding the perfect pair of shoes that not only look great but feel comfortable too. Whether it's a pair of classic sneakers for everyday wear or a stylish pair of heels for a night out, shoes have the power to elevate any outfit and make us feel confident and put together.\"\n\n2. \"I've always believed that you can never have too many shoes. From boots to sandals, loafers to wedges, each pair offers a unique style and adds a different element to your wardrobe. Plus, shoes are a fun way to express your personality and show off your individual sense of fashion.\"\n\n3. \"Shoes are like the finishing touch to any outfit - they can make or break the entire look. That's why I always make sure to invest in high-quality shoes that not only look great but also provide support and comfort. After all, a great pair of shoes can take you anywhere you want to go, both literally and figuratively."
    print(json.dumps(hardcode))

if __name__ == "__main__":
    prompt_data = sys.argv[1]
    generate_gpt_response(prompt_data)
