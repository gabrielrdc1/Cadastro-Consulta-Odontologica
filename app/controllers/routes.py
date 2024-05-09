from flask import Flask, request, jsonify
from firebase_admin import auth
from dotenv import load_dotenv
import json
import requests
import os

app = Flask(__name__)
from app.models.models import Paciente, Consulta


def init_routes(app):  
    @app.route('/api/pacientes', methods=['POST'])
    def cadastrar_paciente():
        data = request.get_json()
        if 'nome' in data and 'email' in data and 'senha' in data:
            novo_paciente = Paciente(nome=data['nome'], email=data['email'], senha=data['senha'])
            novo_paciente.save()
            return jsonify({"message": "Paciente cadastrado com sucesso"}), 201
        else:
            return jsonify({"error": "Nome, email e senha são obrigatórios"}), 400

    @app.route('/api/login', methods=['POST'])
    def login():
        data = request.get_json()
        if 'email' in data and 'senha' in data:
            paciente = Paciente.query.filter_by(email=data['email'], senha=data['senha']).first()
            if paciente:
                access_token = create_access_token(identity=paciente.id)
                return jsonify(access_token=access_token), 200
            else:
                return jsonify({"error": "Credenciais inválidas"}), 401
        else:
            return jsonify({"error": "Email e senha são obrigatórios"}), 400

    @app.route('/api/consultas', methods=['POST'])
    @jwt_required() 
    def agendar_consulta():
        data = request.get_json()
        if 'data' in data:
            paciente_id = get_jwt_identity()  
            nova_consulta = Consulta(data=data['data'], paciente_id=paciente_id)
            nova_consulta.save()
            return jsonify({"message": "Consulta agendada com sucesso"}), 201
        else:
            return jsonify({"error": "Data da consulta é obrigatória"}), 400
