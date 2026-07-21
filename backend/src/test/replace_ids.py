import os
import re

directory = "/home/markc/projects/web-dev/laundry-shop-management-system/backend/src/test/java/com/himotech/laundryms"

# Pattern to find .id(...) where ... is a number, possibly followed by L
pattern = re.compile(r'\.id\(\d+L?\)')

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith(".java"):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            if pattern.search(content):
                # Ensure java.util.UUID is imported or use the fully qualified name
                # Let's just use UUID.randomUUID() since most classes already import java.util.UUID or can use it.
                # Actually, fully qualified java.util.UUID.randomUUID() is safer if not imported.
                new_content = pattern.sub('.id(java.util.UUID.randomUUID())', content)
                with open(filepath, 'w') as f:
                    f.write(new_content)
                print(f"Updated {filepath}")
