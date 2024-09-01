import csv, os

def list_files_in_directory(directory):
    if not directory:
        raise ValueError("Directory cannot be None or empty.")

    try:
        files = [f for f in os.listdir(directory) if os.path.isfile(os.path.join(directory, f))]
        return files
    except FileNotFoundError:
        return f"Directory not found: {directory}"
    except PermissionError:
        return f"Permission denied to access directory: {directory}"
    except Exception as e:
        return f"An error occurred while listing files in directory: {directory}. Error: {str(e)}"

def find_index(file_path, head):
    with open(file_path, mode='r', newline='', encoding='utf-8') as infile:
        header = next(csv.reader(infile))
    return header.index(head) if head in header else None

def generate_csv(csv_file_path, new_values):
    if not csv_file_path:
        raise ValueError("Invalid argument: csv_file_path cannot be None or empty.")

    if not new_values:
        raise ValueError("Invalid argument: new_values cannot be None or empty.")

    if not os.path.isfile(csv_file_path):
        raise FileNotFoundError(f"File not found: {csv_file_path}")

    with open(csv_file_path, mode='r', newline='', encoding='utf-8') as csv_file:
        csv_reader = csv.reader(csv_file)
        header = next(csv_reader)

    if not header:
        raise Exception("Invalid CSV file: header not found.")

    with open(csv_file_path, mode='w', newline='', encoding='utf-8') as csv_file:
        csv_writer = csv.writer(csv_file)
        csv_writer.writerow(header)

    label_index = find_index(csv_file_path, "label")
    image_index = find_index(csv_file_path, "image")
    image_back_index = find_index(csv_file_path, "image-back")
    item_count_index = find_index(csv_file_path, "item-count")
    item_key_index = find_index(csv_file_path, "item-key")

    with open(csv_file_path, mode='a', newline='', encoding='utf-8') as csv_file:
        csv_writer = csv.writer(csv_file)

        for value in new_values:
            if not value:
                raise ValueError("Invalid value: value cannot be None or empty.")

            row = [""] * len(header)
            row[label_index] = value.split(".")[0]

            if "front" in value:
                row[image_index] = base_path + value
                row[image_back_index] = base_path + value.replace("front", "back")
            else:
                row[image_index] = base_path + value
                row[image_back_index] = ""

            row[item_count_index] = 1
            row[item_key_index] = value.split(".")[0]
            csv_writer.writerow(row)

current_filename = os.path.basename(__file__).split(".")[0]
base_path = "https://csump.github.io/src/" + current_filename + "/"
directory = "../src/" + current_filename + "/"
files = list_files_in_directory(directory)
files = [file for file in files if not ("back" in file)]
file_path =  "./" + current_filename + ".csv"

generate_csv(file_path, files)