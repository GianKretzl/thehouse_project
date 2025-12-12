import requests
import json

url = "http://localhost:8000/api/v1/teachers/"
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaXJldG9yQHRoZWhvdXNlLmVkdS5iciIsImV4cCI6MTc2NjE0MjkxMX0.W5MhVWtIVw7_8GX9cxliFiCBVIorZyIAIFTcdyYTNuE"

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

data = {
    "cpf": "12345678901",
    "phone": "(11) 98888-7777",
    "specialty": "Matemática",
    "hire_date": "2025-12-12",
    "user": {
        "name": "Teste Professor",
        "email": "teste.prof@thehouse.edu.br",
        "password": "senha123"
    }
}

print("Enviando requisição POST...")
print(f"URL: {url}")
print(f"Headers: {headers}")
print(f"Data: {json.dumps(data, indent=2)}")

response = requests.post(url, headers=headers, json=data)

print(f"\nStatus Code: {response.status_code}")
print(f"Response: {response.text}")

if response.status_code != 201:
    print(f"\nERRO! Detalhes:")
    try:
        error_detail = response.json()
        print(json.dumps(error_detail, indent=2))
    except:
        print("Não foi possível parsear resposta")
