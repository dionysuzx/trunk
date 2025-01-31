import requests
from bs4 import BeautifulSoup
import json

# TODO: broken script
def scrape_taoteaching():
    base_url = "https://www.taoistic.com/taoteching-laotzu/taoteching-"
    chapters = {}

    for i in range(1, 82):  # There are 81 chapters
        url = f"{base_url}{str(i).zfill(2)}.htm"  # Zfill for leading zero
        response = requests.get(url)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            chapter_data = {}
            # Find the verse
            verses_div = soup.find('div', class_='vers')
            if verses_div:
                chapter_data['Verse'] = verses_div.get_text(separator='\n', strip=True)
            else:
                chapter_data['Verse'] = "No verse found"

            # Find the commentary
            commentary_content = []
            current_element = verses_div.next_sibling
            while current_element and (current_element.name != 'div' or current_element.get('align') != 'left'):
                current_element = current_element.next_sibling

            # Collecting all elements until <center> tag
            if current_element:
                for element in current_element.next_siblings:
                    if element.name == 'center':
                        break
                    commentary_content.append(str(element))

            chapter_data['Commentary'] = ''.join(commentary_content)

            chapters[f"Chapter {i}"] = chapter_data
        else:
            print(f"Failed to retrieve chapter {i}")

    # Convert the dictionary to JSON format
    with open('taoteching.json', 'w') as f:
        json.dump(chapters, f, indent=4, ensure_ascii=False)

    print("Scraping completed and data is saved to taoteching.json.")

scrape_taoteaching()
