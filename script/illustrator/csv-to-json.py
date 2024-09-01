import csv
import json

def replace_first_occurrence(headers, header_mapping):
    seen = set()
    updated_headers = []
    print(headers)
    for header in headers:
        if header in header_mapping and header not in seen:
            updated_headers.append(header_mapping[header])
            seen.add(header)
        else:
            updated_headers.append(header)
    return updated_headers

def csv_to_json(csv_file_path, json_file_path, key_mapping, header_mapping):
    data = []

    with open(csv_file_path, encoding='utf-8') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=';')
        
        original_headers = next(csv_reader)
        updated_headers = replace_first_occurrence(original_headers, header_mapping)
        
        csv_file.seek(0)
        next(csv_reader)  
        
        for row in csv_reader:
            relevant_columns = row[0:16]
            filtered_row = {updated_headers[i]: relevant_columns[i] for i in range(len(relevant_columns))}
            
            new_row = {key_mapping.get(k, k): v for k, v in filtered_row.items()}
            
            if not new_row.get("name"):
                break
            
            data.append(new_row)
    
    with open(json_file_path, 'w', encoding='utf-8') as json_file:
        json.dump(data, json_file, ensure_ascii=False, indent=4)

csv_file_path = 'receptstat.csv'
json_file_path = 'receptstat.json'

key_mapping = {
    "Étek": "name",
    "Képesség": "power",
    "Kategória": "category",
    "Bónusz": "bonus",
    "Típus": "type",
    "Pont": "points"
}

header_mapping = {
    "🍖": "meat",
    "🍎": "fruit",
    "🥕": "vegetable",
    "🥛": "milk",
    "🍞": "bread",
    "🪨": "stone",
    "🍷": "wine",
    "🪙": "coin",
}

csv_to_json(csv_file_path, json_file_path, key_mapping, header_mapping)
