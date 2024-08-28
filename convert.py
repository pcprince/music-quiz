import csv
import json

def csv_to_json(csv_file_path, json_file_path):
    songs = []

    # Read the CSV file
    with open(csv_file_path, mode='r', encoding='utf-8') as csv_file:
        csv_reader = csv.DictReader(csv_file)

        # Convert each row into the desired JSON format
        for row in csv_reader:
            song = {
                'name': row['name'],
                'artists': [
                    {'name': row['artist']}
                ]
            }
            songs.append(song)

    # Convert the list of songs to a JSON string with double quotes
    json_string = json.dumps(songs, indent=4)

    # Write the JSON output to a file
    with open(json_file_path, mode='w', encoding='utf-8') as json_file:
        json_file.write(json_string)

# Example usage
csv_file_path = 'songs.csv'  # Input CSV file
json_file_path = 'songs.json'  # Output JSON file

csv_to_json(csv_file_path, json_file_path)
