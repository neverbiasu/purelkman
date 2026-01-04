from playwright.sync_api import sync_playwright
import time
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:5173/")

        # Click to start game
        time.sleep(1)
        page.mouse.click(400, 300)
        time.sleep(2) # Wait for scene to load

        if not os.path.exists("verification"):
            os.makedirs("verification")

        # Capture console logs to check for AI errors
        page.on("console", lambda msg: print(f"Console: {msg.text}"))

        # Take initial screenshot
        page.screenshot(path="verification/ai_start.png")
        print("Initial screenshot captured")

        # Wait for potential movement
        time.sleep(3)

        # Take second screenshot
        page.screenshot(path="verification/ai_end.png")
        print("End screenshot captured")

        browser.close()

if __name__ == "__main__":
    run()
