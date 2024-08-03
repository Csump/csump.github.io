import csv
import requests
from bs4 import BeautifulSoup

def list_files_from_url(url):
    response = requests.get(url)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, 'html.parser')

    files = []
    for link in soup.find_all('a', href=True):
        href = link['href']
        if href and not href.startswith('/') and not href.endswith('/'):
            files.append(href)

    return files


def find_index(file_path, header):
    with open(file_path, mode='r', newline='', encoding='utf-8') as infile:
        reader = csv.reader(infile)
        header = next(reader)
    
    try:
        index = header.index(header)
    except ValueError:
        raise Exception("The column " + header + " does not exist in the provided CSV file.")
    
    return index

def generate_csv(file_path, new_values):
    with open(file_path, mode='r', newline='', encoding='utf-8') as infile:
        reader = csv.reader(infile)
        header = next(reader)
        rows = list(reader)

    label_index = find_index(file_path, "label")
    image1_index = find_index(file_path, "image1")
    item_count_index = find_index(file_path, "item-count")
    item_key_index = find_index(file_path, "item-key")

    # Update the "item-key" column with new values
    for i, value in enumerate(new_values):
        if i < len(rows):
            rows[i][item_key_index] = value
        else:
            break

    # Write the updated data back to the CSV file
    with open(file_path, mode='w', newline='', encoding='utf-8') as outfile:
        writer = csv.writer(outfile)
        writer.writerow(header)  # Write the header
        writer.writerows(rows)   # Write the modified rows

file_path = "./cards.csv"
new_values = ['A123', 'B456', 'C789']
#generate_csv(file_path, new_values)


base_path = "https://csump.github.io/src/recipe-cards/"
extension = ".png"



files = list_files_from_url(base_path)
print(files)