import os
from pymongo import MongoClient
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client['watermark']

# Criar coleções se não existirem
if 'users' not in db.list_collection_names():
    db.create_collection('users')

if 'imagesLogs' not in db.list_collection_names():
    db.create_collection('imagesLogs')

# Criar usuário admin de teste se não existir
if db.users.count_documents({}) == 0:
    hashed_password = bcrypt.generate_password_hash("Admin123!", rounds=14).decode('utf-8')
    db.users.insert_one({
        "nif": "000000000",
        "email": "admin@teste.com",
        "password": hashed_password,
        "token_user": "ADMIN123",
        "is_admin": True
    })

print("Banco de dados inicializado com sucesso!")
