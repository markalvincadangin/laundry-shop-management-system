import os
import re

directory = 'backend/src/main/java/com/himotech/laundryms'

def replace_in_file(filepath):
    if "SystemSettings" in filepath:
        return # Skip system settings which remains BIGINT

    with open(filepath, 'r') as file:
        content = file.read()
    
    original = content

    # 1. Replace field types in DTOs and Entities
    content = re.sub(r'private (Long|Integer) id;', r'private UUID id;', content)
    content = re.sub(r'private (Long|Integer) ([a-zA-Z0-9_]+Id);', r'private UUID \2;', content)
    content = re.sub(r'public (Long|Integer) getId', r'public UUID getId', content)
    content = re.sub(r'public (Long|Integer) get([a-zA-Z0-9_]+Id)', r'public UUID get\2', content)
    content = re.sub(r'public void setId\((Long|Integer) id\)', r'public void setId(UUID id)', content)
    content = re.sub(r'public void set([a-zA-Z0-9_]+Id)\((Long|Integer) ([a-zA-Z0-9_]+Id)\)', r'public void set\1(UUID \3)', content)

    # 2. Replace @GeneratedValue
    content = re.sub(r'@GeneratedValue\(strategy = GenerationType.IDENTITY\)', r'@GeneratedValue(strategy = GenerationType.UUID)', content)

    # 3. Replace Repository definitions
    content = re.sub(r'JpaRepository<([a-zA-Z0-9_]+), (Long|Integer)>', r'JpaRepository<\1, UUID>', content)

    # 4. Replace method signatures (Controllers, Services)
    content = re.sub(r'@PathVariable (Long|Integer) id', r'@PathVariable UUID id', content)
    content = re.sub(r'\b(Long|Integer) id\b', r'UUID id', content)
    content = re.sub(r'\b(Long|Integer) ([a-zA-Z0-9_]+Id)\b', r'UUID \2', content)

    # Add import if needed
    if 'UUID' in content and 'import java.util.UUID;' not in content:
        content = re.sub(r'(package [^;]+;)', r'\1\n\nimport java.util.UUID;', content, count=1)

    if content != original:
        with open(filepath, 'w') as file:
            file.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.java'):
            replace_in_file(os.path.join(root, file))
