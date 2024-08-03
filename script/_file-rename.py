import os
import unicodedata

def normalize_string(s):
    # Normalize unicode characters to ASCII
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if not unicodedata.combining(c))
    s = s.encode('ASCII', 'ignore').decode('ASCII')
    
    # Replace spaces with dashes and convert to lowercase
    s = s.replace(' ', '-').lower()
    
    return s

def rename_files_in_directory(directory):
    for root, dirs, files in os.walk(directory):
        for filename in files:
            old_path = os.path.join(root, filename)
            
            # Normalize the filename
            new_filename = normalize_string(filename)
            new_path = os.path.join(root, new_filename)
            
            # Rename the file
            if old_path != new_path:
                os.rename(old_path, new_path)
                print(f"Renamed: {old_path} -> {new_path}")

# Example usage
directory = '../src/' 
rename_files_in_directory(directory)
