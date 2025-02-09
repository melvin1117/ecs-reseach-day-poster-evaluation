from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import pandas as pd

# Initialize the WebDriver
driver = webdriver.Chrome()

# URL of the faculty page
url = "https://ecs.syracuse.edu/faculty-staff"
driver.get(url)

# Wait for the page to load
wait = WebDriverWait(driver, 10)

# Locate faculty profile elements
faculty_profiles = wait.until(EC.presence_of_all_elements_located((By.XPATH, '//div[@class="ecs-profile box-clickable"]')))

# Initialize lists to store data
names, emails, degrees, details, img_links = [], [], [], [], []

# Loop through each faculty profile
for index in range(len(faculty_profiles)):
    try:
        # Re-locate the profile element (to avoid stale reference)
        faculty_profiles = wait.until(EC.presence_of_all_elements_located((By.XPATH, '//div[@class="ecs-profile box-clickable"]')))
        profile = faculty_profiles[index]
        
        # Scroll into view before clicking
        driver.execute_script("arguments[0].scrollIntoView();", profile)
        driver.execute_script("arguments[0].click();", profile)  # JavaScript Click

        # Wait for the new page to load
        wait.until(EC.presence_of_element_located((By.XPATH, '//h1[@class="title"]')))

        # Extract name
        try:
            name = driver.find_element(By.XPATH, '//h1[@class="title"]').text
        except:
            name = "N/A"

        # Extract email
        try:
            email_elements = driver.find_elements(By.XPATH, "//*[contains(text(), '@syr.edu')]")
            email = email_elements[0].text if email_elements else "N/A"
        except:
            email = "N/A"

        # Extract degrees
        try:
            degrees_list = driver.find_elements(By.XPATH, '//p[strong[text()="Degrees:"]]/following-sibling::ul[1]/li')
            degree = ", ".join([d.text for d in degrees_list]) if degrees_list else "N/A"
        except:
            degree = "N/A"

        # Extract faculty details
        try:
            detail = driver.find_element(By.XPATH, "//div[@class='col-md-8 content-section content profile-detail']").text
        except:
            detail = "N/A"

        # Extract image link
        try:
            img_element = driver.find_element(By.XPATH, "//aside[contains(@class, 'profile-image')]//img")
            img_link = img_element.get_attribute("src")
        except:
            img_link = "N/A"

        # Append to lists
        names.append(name)
        emails.append(email)
        degrees.append(degree)
        details.append(detail)
        img_links.append(img_link)

        # Go back to the main faculty page
        driver.back()

        # Wait for the main page to load again
        wait.until(EC.presence_of_element_located((By.XPATH, '//div[@class="ecs-profile box-clickable"]')))

    except Exception as e:
        print(f"Error extracting data for profile {index + 1}: {e}")

        # Handle unexpected browser window closure
        if len(driver.window_handles) == 0:
            print("Browser window closed unexpectedly. Restarting browser...")
            driver = webdriver.Chrome()
            driver.get(url)

        driver.back()
        wait.until(EC.presence_of_element_located((By.XPATH, '//div[@class="ecs-profile box-clickable"]')))

# Close the WebDriver
driver.quit()

# Create a DataFrame
df = pd.DataFrame({
    "Name": names,
    "Email": emails,
    "Degree": degrees,
    "Details": details,
    "Image Link": img_links
})

# Save the DataFrame to a CSV file
df.to_csv("faculty_data.csv", index=False)

print("Data scraping complete. Data saved to faculty_data.csv.")
