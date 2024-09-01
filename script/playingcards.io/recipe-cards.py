import csv, os

def list_files_in_directory(directory):
    try:
        files = [f for f in os.listdir(directory) if os.path.isfile(os.path.join(directory, f))]
        return files
    except FileNotFoundError:
        return f"Directory not found: {directory}"
    except PermissionError:
        return f"Permission denied to access directory: {directory}"

def find_index(file_path, head):
    with open(file_path, mode='r', newline='', encoding='utf-8') as infile:
        reader = csv.reader(infile)
        header = next(reader)
    
    try:
        index = header.index(head)
    except ValueError:
        raise Exception("The column " + head + " does not exist in the provided CSV file.")
    
    return index

def generate_csv(file_path, new_values):
    with open(file_path, mode='r', newline='', encoding='utf-8') as infile:
        reader = csv.reader(infile)
        header = next(reader)

    with open(file_path, mode='w', newline='', encoding='utf-8') as outfile:
        writer = csv.writer(outfile)
        writer.writerow(header)

    with open(file_path, mode='r', newline='', encoding='utf-8') as infile:
        reader = csv.reader(infile)
        header = next(reader)
    
    label_index = find_index(file_path, "label")
    image_index = find_index(file_path, "image")
    item_count_index = find_index(file_path, "item-count")
    item_key_index = find_index(file_path, "item-key")

    with open(file_path, mode='a', newline='', encoding='utf-8') as outfile:
        writer = csv.writer(outfile)
        
        for i, value in enumerate(new_values):
            row = [""] * len(header)
            row[label_index] = value.split(".")[0].split("-")[1]
            row[image_index] = base_path + value
            row[item_count_index] = 1
            row[item_key_index] = value.split(".")[0]
            writer.writerow(row)

current_filename = os.path.basename(__file__).split(".")[0]
base_path = "https://csump.github.io/src/" + current_filename + "/"
directory = "../src/" + current_filename + "/"
files = list_files_in_directory(directory)
files = [file for file in files if not ("back" in file)]
file_path =  "./" + current_filename + ".csv"

generate_csv(file_path, files)