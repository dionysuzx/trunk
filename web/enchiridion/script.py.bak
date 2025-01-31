import json

# Read the content from the local file
with open("epicench.1b.txt", "r") as file:
    content = file.read()

# Splitting the content by lines
lines = content.split('\n')

# Initialize an empty list to store each item
items = []

# Initialize a variable to keep track of the current item number
item_number = 1

# Initialize an empty string to accumulate text for the current item
current_item_text = ""

# Iterate through the lines
for line in lines:
    # Check if the line starts with the item number
    if line.startswith(str(item_number) + "."):
        # If there is already some accumulated text, add it to the items list
        if current_item_text:
            items.append({"item_number": item_number, "text": current_item_text.strip()})
            # Increment the item number for the next item
            item_number += 1
            # Reset the current item text
            current_item_text = ""
        # Add the current line to the current item text
        current_item_text += line
    else:
        # If the line does not start with the item number, just accumulate it
        current_item_text += " " + line

# Add the last item to the list if any text remains
if current_item_text:
    items.append({"item_number": item_number, "text": current_item_text.strip()})

# Convert the items list to JSON
json_output = json.dumps(items, indent=4)

# Save the JSON output to a file
with open("enchiridion.json", "w") as json_file:
    json_file.write(json_output)

# Print a confirmation message
print("The JSON file has been created successfully!")
