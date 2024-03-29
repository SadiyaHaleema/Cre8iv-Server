#!/usr/bin/env python
# coding: utf-8

# # Keyword Extraction Using LDA Algorithm

#*****************************************************************#
#Cleaning the Data ----Preprocessing
#*****************************************************************#

import pandas as pd
import numpy as np
import string
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import LatentDirichletAllocation
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from collections import Counter
import execjs
import json
from bson.json_util import dumps
from pymongo import MongoClient

# Load the JavaScript code from posts.js
# with open('./models/post.js', 'r') as file:
#     js_code = file.read()

# Execute the JavaScript code
# context = execjs.compile(js_code)

# Access the exported variable or function
# post_model = context.call('require')  # Adjust based on your model export
# # Access the Mongoose model from the exported object
# post = post_model.model('post')
# # Fetch data from MongoDB using Mongoose model
# posts = post.find()

# # Convert Mongoose documents to a list of dictionaries
# data = json.loads(dumps(posts))

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/cre8iv')  # Replace 'your_mongo_db_connection_string' with your actual connection string
db = client['cre8iv']  # Replace 'your_database_name' with your actual database name
collection = db['posts']  # Replace 'posts' with your actual collection name

# Fetch data from MongoDB
cursor = collection.find()

#def keyword_extraction():

df = pd.DataFrame(list(cursor))

# Create a DataFrame from the fetched data
#df = pd.DataFrame(data)

# Remove irrelevant columns

df = df[['instaPageId', 'captionText']]

# Handle missing values
df.dropna(inplace=True)

# Handle missing values
df.dropna(inplace=True)

# Remove punctuation and special characters
df['captionText'] = df['captionText'].apply(lambda x: x.translate(str.maketrans('', '', string.punctuation)))


# Define the pattern to match numeric values
pattern = r'\d+'

# Remove numeric values from Message column
df['captionText'] = df['captionText'].apply(lambda x: re.sub(pattern, '', x))


# Convert text to lowercase
df['captionText'] = df['captionText'].apply(lambda x: x.lower())



# Remove stop words
stop_words = set(stopwords.words('english'))
df['captionText'] = df['captionText'].apply(lambda x: ' '.join([word for word in x.split() if word not in stop_words]))

#print(df)
# Lemmatize the text
lemmatizer = WordNetLemmatizer()
df['captionText'] = df['captionText'].apply(lambda x: ' '.join([lemmatizer.lemmatize(word) for word in x.split()]))

# Create a corpus for each page separately
corpora = []
pages = df['instaPageId'].unique()
keyword_results_dict = {}

for page in pages:
    page_df = df[df['instaPageId'] == page]
    page_corpus = page_df['captionText'] 

    corpora.append(page_corpus)

#*****************************************************************#
#Performing Topic Modelling ---LDA to get the keywords per page 
#*****************************************************************#
    
# Apply LDA per page
num_topics =  8 # Specify the number of topics to extract for each page
keyword_results = []
for corpus in corpora:
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(corpus)
    feature_names = vectorizer.get_feature_names_out()

    lda_model = LatentDirichletAllocation(n_components=num_topics)
    lda_matrix = lda_model.fit_transform(tfidf_matrix)
    #print(lda_matrix)
    top_keywords = []
    for topic_idx, topic in enumerate(lda_model.components_):
        #print(lda_model.components_)
        #print("--------------------Topicidx")
        #print(topic_idx)
        topic_keywords = [feature_names[i] for i in topic.argsort()[:-6:-1]]  # Get top 5 keywords
        top_keywords.extend(topic_keywords)
        #top_keywords.append((topic_keywords, lda_model.transform(tfidf_matrix)))

    #keyword_results.extend(top_keywords)
    keyword_results_dict[page] = top_keywords
    
print (json.dumps(keyword_results_dict))    
#return keyword_results_dict

  
# if __name__ == "__main__":
    
#     # Perform image analysis
#     keyword_extraction()