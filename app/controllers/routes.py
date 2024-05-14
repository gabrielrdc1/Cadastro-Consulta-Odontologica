from flask import Flask, request, jsonify
from firebase_admin import auth
from dotenv import load_dotenv
import json
import requests
import os

app = Flask(__name__)
from app.models.models import Pacientes, Agenda, DentistaEspecializacao, Dentistas, Especializacao


load_dotenv()
def verify_token():
    id_token = request.headers.get('Authorization')
    if not id_token:
        return jsonify({'error': 'Token não fornecido'}), 401

    try:
        decoded_token = auth.verify_id_token(id_token)
        request.uid = decoded_token['uid']
    except auth.InvalidIdTokenError:
        return jsonify({'error': 'Token inválido'}), 401
    except auth.ExpiredIdTokenError:
        return jsonify({'error': 'Token expirado'}), 401

def init_routes(app): 
    @app.before_request
    def before_request_func():
        if request.endpoint not in ['login', 'create_paciente']:
            return verify_token()
         
    @app.route('/api/pacientes', methods=['POST'])
    def create_paciente():
        data = request.get_json()
        paciente_nome = data['paciente_nome']
        cpf = data['cpf']
        email = data['email']
        password = data['password']
        
        if Pacientes.query.filter_by(email=email).first():
            return jsonify({'error': 'Paciente já cadastrado'}), 400

        try:
            pacient_record = auth.create_user(email=email, password=password)
            firebase_uid = pacient_record.uid
        except Exception as e:
            return jsonify({"error": str(e)}), 400

        try:
            new_pacient = Pacientes(paciente_nome=paciente_nome, cpf=cpf, email=email)
            new_pacient.save()
        except Exception as e:
            auth.delete_user(firebase_uid)
            return jsonify({"error": str(e)}), 400

        return jsonify({"message": "Paciente created successfully", "firebase_uid": firebase_uid}), 201         
    
    
    @app.route('/login', methods=['POST'])
    def login():
        email = request.json['email']
        password = request.json['password']

        url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={os.getenv('FIREBASE_API_KEY')}"

        payload = json.dumps({
            "email": email,
            "password": password,
            "returnSecureToken": True
        })
        headers = {'Content-Type': 'application/json'}

        response = requests.post(url, headers=headers, data=payload)
        if response.status_code != 200:
            return jsonify({'error': 'Credenciais inválidas'}), 401

        json_response = response.json()
        return jsonify({
            'message': 'Login realizado com sucesso',
            'token': json_response['idToken'],
            'refreshToken': json_response['refreshToken']
        }), 200
        
    @app.route('/api/paciente/<int:id>', methods=['GET'])
    def get_paciente(id):
        paciente = Pacientes.query.get(id)
        if paciente:
            return jsonify(paciente.serialize())
        else:
            return jsonify({'error': 'Paciente não encontrado'}), 404
    
    @app.route('/api/pacientes', methods=['GET'])
    def get_pacientes():
        pacientes = Pacientes.query.filter_by(ativo=True).all()
        if pacientes:
            pacientes_list = []
            for paciente in pacientes:
                paciente_data = {
                    'id': paciente.id,
                    'nome': paciente.cliente_nome,
                    'cpf': paciente.cpf,
                    'email': paciente.email,
                    'data_criacao': paciente.data_criacao,
                    'ativo': 'Sim' if paciente.ativo else 'Não'
                }
                pacientes_list.append(paciente_data)
            
            return jsonify(pacientes_list), 200
        else:
            return jsonify({'message': 'Nenhum paciente encontrado'}), 404
    
    
    @app.route('/api/paciente/<int:id>', methods=['PATCH'])
    def update_paciente(id):
        paciente = Pacientes.query.get(id)
        
        if paciente:
            data = request.get_json()
            paciente_nome = data['paciente_nome']
            cpf = data['cpf']
            email = data['email']

            if Pacientes.query.filter_by(email=email).first():
                return jsonify({'error': 'Paciente já cadastrado'}), 400
        
            data = request.get_json()
            paciente.paciente_nome = paciente_nome
            paciente.cpf = cpf
            paciente.email = email 
            paciente.save()
            return jsonify(paciente), 200
        else:
            return jsonify({'error': 'Paciente não encontrado'}), 404

    @app.route('/api/paciente/ativo/<int:id>', methods=['PATCH'])
    def desativar_paciente(id):
        paciente = Pacientes.query.get(id)
        if paciente:
            paciente.ativo = False
            paciente.save()
            return jsonify(paciente), 200
        
        else:
            return jsonify({'error': 'Paciente não encontrado'}), 404
        
    @app.route('/api/consultas', methods=['GET'])
    def get_consultas():
        consultas = Agenda.query.all()
        if consultas:
            consultas_list = []
            for consulta in consultas:
                consulta_data = {
                    'id': consulta.id,
                    'data': consulta.data,
                    'hora': consulta.hora,
                    'paciente': consulta.paciente.cliente_nome,
                    'dentista': consulta.dentista.dentista_nome,
                    'especializacao': consulta.especializacao.especializacao_nome,
                }
                consultas_list.append(consulta_data)
            
            return jsonify(consultas_list), 200
        else:
            return jsonify({'message': 'Nenhuma consulta encontrada'}), 404
        
    
    @app.route('/api/dentistas', methods=['GET'])
    def get_dentistas():
        dentistas = Dentistas.query.all()
        if dentistas:
            dentistas_list = []
            for dentista in dentistas:
                dentista_data = {
                    'id': dentista.id,
                    'nome': dentista.dentista_nome,
                    'cro': dentista.cro,
                    'data_criacao': dentista.data_criacao,
                    'ativo': 'Sim' if dentista.ativo else 'Não'
                }
                dentistas_list.append(dentista_data)
            
            return jsonify(dentistas_list), 200
        else:
            return jsonify({'message': 'Nenhum dentista encontrado'}), 404
        
    @app.route('/api/dentista/<int:id>', methods=['GET'])
    def get_dentista(id):
        dentista = Dentistas.query.get(id)
        if dentista:
            return jsonify(dentista)
        else:
            return jsonify({'error': 'Dentista não encontrado'}), 404
        
    @app.route('/api/dentista', methods=['POST'])
    def create_dentista():
        data = request.get_json()
        dentista_nome = data['dentista_nome']
        dentista_email = data['dentista_email']
        
        if Dentistas.query.filter_by(dentista_email=dentista_email).first():
            return jsonify({'error': 'Dentista já cadastrado'}), 400

        try:
            new_dentista = Dentistas(dentista_nome=dentista_nome, dentista_email=dentista_email)
            new_dentista.save()
        except Exception as e:
            return jsonify({"error": str(e)}), 400

        return jsonify({"message": "Dentista created successfully"}), 201
    