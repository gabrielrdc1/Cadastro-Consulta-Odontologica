from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from firebase_admin import credentials
import firebase_admin
import os

from dotenv import load_dotenv


def create_app():
    return Flask(__name__)
   
app = create_app()

DATABASE_URL = f"postgresql://{os.getenv('DATABASE_USER')}:{os.getenv('DATABASE_PASSWORD')}@{os.getenv('DATABASE_HOST')}:{os.getenv('DATABASE_PORT')}/{os.getenv('DATABASE_NAME')}"
# app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
cred = credentials.Certificate("auth-firebase.json")
firebase_admin.initialize_app(cred)
    
db = SQLAlchemy(app)

from app.models.models import Pacientes, Agenda, DentistaEspecializacao, Dentistas, Especializacao

with app.app_context():
    db.create_all()
    
from app.controllers.routes import init_routes
init_routes(app)


