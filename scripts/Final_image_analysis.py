#!/usr/bin/env python
# coding: utf-8

# In[2]:


import nltk
import string
import sys
import json
import shutil
# Clear NLTK data cache
#nltk.data.clear_cache()
nltk.download('words')
nltk.download('punkt')
from nltk.corpus import words
from nltk.tokenize import word_tokenize
from nltk.stem import PorterStemmer
english_word_set = set(words.words())
import cv2
import numpy as np
import pytesseract
import easyocr
from PIL import Image



def is_english(text):
    # Remove punctuation
    translator = str.maketrans("", "", string.punctuation)
    text_without_punctuation = text.translate(translator)
    stemmed_words = [PorterStemmer().stem(word) for word in text_without_punctuation.split()]
    stemmed_text = ' '.join(stemmed_words)
    #print(stemmed_text)
    tokens = word_tokenize(stemmed_text.lower())
    # Filter out empty strings from the list
    tokens_new= [text for text in tokens if text.strip()]
   # print(tokens)
    if(tokens_new):
        english_word_count = sum(1 for token in tokens_new if token in english_word_set)
        english_percentage = english_word_count / len(tokens_new)
        return english_percentage > 0.5  # Adjust threshold as needed
    
def detect_text(image_path):
    # Load the image
    #image_path = "objtxt.png"
    image = Image.open(image_path)

    # Convert the PIL Image to a NumPy array
    image_np = np.array(image)

    # Perform text recognition using EasyOCR
    reader = easyocr.Reader(["en"])
    result = reader.readtext(image_np)

    # Save all detected text in one variable
    easyocr_all_detected_text = []

    # Display the results and save the detected text
    for detection in result:
        text = detection[1]
        easyocr_all_detected_text.append(text)

    # Configure Tesseract OCR
    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract'  # Adjust the path based on your installation
    
    # Get Tesseract path dynamically
    #tesseract_path = pytesseract.pytesseract.get_tesseract_version()[0]
    # Set the Tesseract path
    #pytesseract.pytesseract.tesseract_cmd = tesseract_path
    
    # Find Tesseract executable path
    # tesseract_path = shutil.which('tesseract')
    # print("Tesseract Path: ", tesseract_path)

    # # Set the Tesseract path
    # if tesseract_path:
    #     pytesseract.pytesseract.tesseract_cmd = tesseract_path
    # else:
    #     print("Tesseract executable not found. Please specify the path manually.")

    # Load an image using OpenCV
    image = cv2.imread(image_path)

    # Convert the image to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Use pytesseract to do OCR on the image
    text = pytesseract.image_to_string(gray)

    # Save all detected text in the same output variable
    tssrct_all_detected_text = text.splitlines()

    # Filter out empty strings from the list
    tssrct_all_detected_text = [text for text in tssrct_all_detected_text if text.strip()]

    # After running Tesseract and EasyOCR, you have a list of detected texts

    #first find score easyocr
    detected_texts = easyocr_all_detected_text
    total_easyocr=1
    correct_easyocr=0
    for text in detected_texts:
        is_english_result = is_english(text)
        total_easyocr+=1
        if is_english_result:
            correct_easyocr+=1
        else:
            detected_texts.remove(text)

    score_easyocr=   correct_easyocr/total_easyocr              

    #Secondly, finding score from tesseract
    detected_texts = tssrct_all_detected_text
    #print("Detected text tesseract: " , detected_texts)
    total_tssrct=1
    correct_tssrct=0
    for text in detected_texts:
        is_english_result = is_english(text)
        total_tssrct+=1
        if is_english_result:
            correct_tssrct+=1
        else:
            detected_texts.remove(text)
    score_tssrct=   correct_tssrct/total_tssrct            
    if(score_easyocr>score_tssrct):
        detected_texts=easyocr_all_detected_text
    separator = ','    
    text_string = separator.join(detected_texts)
    #print(detected_texts)
    return(text_string)

def detect_obj(image_path):
    # Load YOLOv4 model and configuration files
    net = cv2.dnn.readNet("./yolo/yolov4.weights", "./yolo/yolov4.cfg")

    # Load YOLOv4 class names
    with open("./yolo/coco.names", "r") as f:
        classes = f.read().strip().split("\n")

    # Load image
    image = cv2.imread(image_path)

    # Get image dimensions
    height, width = image.shape[:2]

    # Preprocess image (resize and normalize)
    blob = cv2.dnn.blobFromImage(image, 1/255.0, (416, 416), swapRB=True, crop=False)

    # Set input to the network
    net.setInput(blob)

    # Get output layer names
    output_layer_names = net.getUnconnectedOutLayersNames()

    # Run forward pass
    detections = net.forward(output_layer_names)

    # Initialize lists to store detected objects' information
    class_ids = []
    confidences = []
    bounding_boxes = []

    # Iterate over each detection
    for detection in detections:
        for obj in detection:
            scores = obj[5:]
            class_id = np.argmax(scores)
            confidence = scores[class_id]

            # Filter out weak detections by confidence threshold
            if confidence > 0.5:
                # Scale bounding box coordinates to the original image size
                center_x = int(obj[0] * width)
                center_y = int(obj[1] * height)
                w = int(obj[2] * width)
                h = int(obj[3] * height)

                # Calculate coordinates for the top-left corner of the bounding box
                x = int(center_x - (w / 2))
                y = int(center_y - (h / 2))

                class_ids.append(class_id)
                confidences.append(float(confidence))
                bounding_boxes.append([x, y, w, h])

    # Non-maximum suppression to remove duplicate and low-confidence bounding boxes
    indices = cv2.dnn.NMSBoxes(bounding_boxes, confidences, 0.5, 0.4)
    detected_objects=[]
    # Loop over the remaining indices
    for i in indices:
        x, y, w, h = bounding_boxes[i]
        label = str(classes[class_ids[i]])
        confidence = confidences[i]

        # Draw bounding box and label on the image
        color = (0, 255, 0)  # BGR color for the bounding box (green in this case)
        cv2.rectangle(image, (x, y), (x + w, y + h), color, 2)
        cv2.putText(image, f"{label}: {confidence:.2f}", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

        # Print the name of the detected object
        #print(f"Detected object: {label}")
        detected_objects.append(label)
    separator = ','

    obj_string = separator.join(detected_objects)
    

    #print( detected_objects)
    return obj_string
    #return detected_objects

# def analyze_img(image_path):
#     separator = ','

#     obj_list = detect_obj(image_path)
#     obj_string = separator.join(obj_list)
    
#     text_list = detect_text(image_path)
#     text_string = separator.join(text_list)

#     #results = obj_string + text_string
#     #results =  text_string
#     results = {
#             "obj_string": obj_string,
#             "text_string": text_string
#         }
#     return results

    
if __name__ == "__main__":
   

    image_data = sys.argv[1]
    obj_list = detect_obj(image_data)
    text_list = detect_text(image_data)
    result_dict = {
    "obj_list": obj_list,
    "text_list": text_list
    }
    #final_result = analyze_img(image_data)
    # Perform image analysis
    print((json.dumps(result_dict,ensure_ascii=False)))  

    


