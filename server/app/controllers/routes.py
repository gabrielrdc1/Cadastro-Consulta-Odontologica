from flask import Flask, request, jsonify
from firebase_admin import auth
from dotenv import load_dotenv
import json
import requests
import os
from flask_validate_json import validate_json
import re

app = Flask(__name__)
from app.models.models import Pacientes, Agenda, DentistaEspecializacao, Dentistas, Especializacao

schema_paciente = {
    "type": "object",
    "properties": {
        "paciente_nome": {"type": "string"},
        "cpf": {
            "type": "string",
            "pattern": "^\\d{11}$"
        },
        "email": {
            "type": "string",
            "pattern": "^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$"
        },
        "password": {"type": "string"}
    },
    "required": ["paciente_nome", "cpf", "email", "password"]
}

schema_consulta = {
    "type": "object",
    "properties": {
        "paciente_id": {"type": "integer"},
        "dent_esp_id": {"type": "integer"},
        "data_consulta": {"type": "string"},
        "hora_consulta": {"type": "string"}
    },
    "required": ["paciente_id", "dent_esp_id", "data_consulta", "hora_consulta"]
}

schema_dentista = {
    "type": "object",
    "properties": {
        "dentista_nome": {"type": "string"},
        "dentista_email": {"type": "string"}
    },
    "required": ["dentista_nome", "dentista_email"]
}

schema_especializacao = {
    "type": "object",
    "properties": {
        "especializacao_nome": {"type": "string"}
    },
    "required": ["especializacao_nome"]
}

schema_dentista_especializacao = {
    "type": "object",
    "properties": {
        "dentista_id": {"type": "integer"},
        "especializacao_id": {"type": "integer"}
    },
    "required": ["dentista_id", "especializacao_id"]
}


load_dotenv()
def verify_token(usuario = True):
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
            if request.endpoint in ['create_dentista_especializacao', 'get_consultas']:
                return verify_token(usuario=False)
            return verify_token()

         
    @app.route('/api/pacientes', methods=['POST'])
    @validate_json(schema_paciente)
    def create_paciente():
        data = request.get_json()
        paciente_nome = data['paciente_nome']
        cpf = data['cpf']
        email = data['email']
        password = data['password']
        
        if Pacientes.query.filter_by(email=email).first() or Pacientes.query.filter_by(cpf=cpf).first() :
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
        id_token = json_response['idToken']

        try:
            decoded_token = auth.verify_id_token(id_token)
            uid = decoded_token['uid']
        except Exception as e:
            return jsonify({'error': 'Falha ao obter o UID do usuário'}), 500

        paciente = Pacientes.query.filter_by(email=email).first()
        dentista = Dentistas.query.filter_by(dentista_email=email).first()

        if paciente:
            user_id = paciente.paciente_id
            user_name = paciente.paciente_nome
        elif dentista:
            user_id = dentista.dentista_id
            user_name = dentista.dentista_nome
        else:
            return jsonify({'error': 'Usuário não encontrado no banco de dados'}), 404

        return jsonify({
            'message': 'Login realizado com sucesso',
            'token': id_token,
            'refreshToken': json_response['refreshToken'],
            'userId': user_id,
            'userName': user_name,
        }), 200

        
    @app.route('/api/paciente/<int:id>', methods=['GET'])
    def get_paciente(id):
        paciente = Pacientes.query.get(id)
        if paciente:
            paciente_data = {
                'id': paciente.paciente_id,
                'nome': paciente.paciente_nome,
                'cpf': paciente.cpf,
                'email': paciente.email,
                'data_criacao': paciente.data_criacao,
                'ativo': 'Sim' if paciente.ativo else 'Não'
            }
            return jsonify(paciente_data), 200
        else:
            return jsonify({'error': 'Paciente não encontrado'}), 404
    
    @app.route('/api/pacientes', methods=['GET'])
    def get_pacientes():
        pacientes = Pacientes.query.filter_by(ativo=True).all()
        if pacientes:
            pacientes_list = []
            for paciente in pacientes:
                paciente_data = {
                    'id': paciente.paciente_id,
                    'nome': paciente.paciente_nome,
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

            if Pacientes.query.filter_by(email=email).first() or Pacientes.query.filter_by(cpf=cpf).first() :
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
                    'id': consulta.agenda_id,
                    'data': consulta.data_consulta,
                    'hora': consulta.hora_consulta,
                    'paciente': consulta.paciente.paciente_nome,
                    'dentista': consulta.dentista.dentista_nome,
                    'especializacao': consulta.especializacao.especializacao_nome,
                }
                consultas_list.append(consulta_data)
            
            return jsonify(consultas_list), 200
        else:
            return jsonify({'message': 'Nenhuma consulta encontrada'}), 404
        
    @app.route('/api/consulta/<int:id>', methods=['GET'])
    def get_consulta(id):
        consulta = Agenda.query.get(id)
        if consulta:
            return jsonify(consulta)
        else:
            return jsonify({'error': 'Consulta não encontrada'}), 404
        
    @app.route('/api/consulta', methods=['POST'])
    @validate_json(schema_consulta)
    def create_consulta():
        data = request.get_json()
        paciente_id = data['paciente_id']
        dent_esp_id = data['dent_esp_id']
        data_consulta = data['data_consulta']
        hora_consulta = data['hora_consulta']
        
        try:
            new_consulta = Agenda(paciente_id=paciente_id, dent_esp_id=dent_esp_id, data=data_consulta, hora_consulta=hora_consulta)
            new_consulta.save()
        except Exception as e:
            return jsonify({"error": str(e)}), 400

        return jsonify({"message": "Consulta created successfully"}), 201
    
    @app.route('/api/consulta/<int:id>', methods=['PATCH'])
    def update_consulta(id):
        consulta = Agenda.query.get(id)
        
        if consulta:
            data = request.get_json()
            paciente_id = data['paciente_id']
            dent_esp_id = data['dent_esp_id']
            data_consulta = data['data_consulta']
            hora_consulta = data['hora_consulta']
            
            consulta.paciente_id = paciente_id
            consulta.dent_esp_id = dent_esp_id
            consulta.data_consulta = data_consulta
            consulta.hora_consulta = hora_consulta
            consulta.save()
            return jsonify(consulta), 200
        else:
            return jsonify({'error': 'Consulta não encontrada'}), 404
        
    
    @app.route('/api/dentistas', methods=['GET'])
    def get_dentistas():
        dentistas = Dentistas.query.all()
        if dentistas:
            dentistas_list = []
            for dentista in dentistas:
                dentista_data = {
                    'id': dentista.dentista_id,
                    'nome': dentista.dentista_nome,
                    'email': dentista.dentista_email,
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
    @validate_json(schema_dentista)
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
    
    @app.route('/api/dentista/<int:id>', methods=['PATCH'])
    def update_dentista(id):
        dentista = Dentistas.query.get(id)
        
        if dentista:
            data = request.get_json()
            dentista_nome = data['dentista_nome']
            dentista_email = data['dentista_email']
            
            if Dentistas.query.filter_by(dentista_email=dentista_email).first():
                return jsonify({'error': 'Dentista já cadastrado'}), 400
            
            dentista.dentista_nome = dentista_nome
            dentista.dentista_email = dentista_email
            dentista.save()
            return jsonify(dentista), 200
        else:
            return jsonify({'error': 'Dentista não encontrado'}), 404
    
    @app.route('/api/dentista/ativo/<int:id>', methods=['PATCH'])
    def desativar_dentista(id):
        dentista = Dentistas.query.get(id)
        if dentista:
            dentista.ativo = False
            dentista.save()
            return jsonify(dentista), 200
        
        else:
            return jsonify({'error': 'Dentista não encontrado'}), 404
        
    @app.route('/api/especializacoes', methods=['GET'])
    def get_especializacoes():
        especializacoes = Especializacao.query.all()
        if especializacoes:
            especializacoes_list = []
            for especializacao in especializacoes:
                especializacao_data = {
                    'id': especializacao.id,
                    'nome': especializacao.especializacao_nome,
                }
                especializacoes_list.append(especializacao_data)
            
            return jsonify(especializacoes_list), 200
        else:
            return jsonify({'message': 'Nenhuma especialização encontrada'}), 404
        
    @app.route('/api/especializacao/<int:id>', methods=['GET'])
    def get_especializacao(id):
        especializacao = Especializacao.query.get(id)
        if especializacao:
            return jsonify(especializacao)
        else:
            return jsonify({'error': 'Especialização não encontrada'}), 404
        
    @app.route('/api/especializacao', methods=['POST'])
    @validate_json(schema_especializacao)
    def create_especializacao():
        data = request.get_json()
        especializacao_nome = data['especializacao_nome']
        
        if Especializacao.query.filter_by(especializacao_nome=especializacao_nome).first():
            return jsonify({'error': 'Especialização já cadastrada'}), 400

        try:
            new_especializacao = Especializacao(especializacao_nome=especializacao_nome)
            new_especializacao.save()
        except Exception as e:
            return jsonify({"error": str(e)}), 400

        return jsonify({"message": "Especialização created successfully"}), 201
    
    @app.route('/api/especializacao/<int:id>', methods=['PATCH'])
    def update_especializacao(id):
        especializacao = Especializacao.query.get(id)
        
        if especializacao:
            data = request.get_json()
            especializacao_nome = data['especializacao_nome']
            
            if Especializacao.query.filter_by(especializacao_nome=especializacao_nome).first():
                return jsonify({'error': 'Especialização já cadastrada'}), 400
            
            especializacao.especializacao_nome = especializacao_nome
            especializacao.save()
            return jsonify(especializacao), 200
        else:
            return jsonify({'error': 'Especialização não encontrada'}), 404
        
    @app.route('/api/especializacao/ativo/<int:id>', methods=['PATCH'])
    def desativar_especializacao(id):
        especializacao = Especializacao.query.get(id)
        if especializacao:
            especializacao.ativo = False
            especializacao.save()
            return jsonify(especializacao), 200
        
        else:
            return jsonify({'error': 'Especialização não encontrada'}), 404
        
    @app.route('/api/dentista-especializacao', methods=['POST'])
    @validate_json(schema_dentista_especializacao)
    def create_dentista_especializacao():
        data = request.get_json()
        dentista_id = data['dentista_id']
        especializacao_id = data['especializacao_id']
        
        if DentistaEspecializacao.query.filter_by(dentista_id=dentista_id, especializacao_id=especializacao_id).first():
            return jsonify({'error': 'Relação já cadastrada'}), 400

        try:
            new_dentista_especializacao = DentistaEspecializacao(dentista_id=dentista_id, especializacao_id=especializacao_id)
            new_dentista_especializacao.save()
        except Exception as e:
            return jsonify({"error": str(e)}), 400

        return jsonify({"message": "Relação created successfully"}), 201
    
    @app.route('/api/dentista-especializacao/<int:id>', methods=['GET'])
    def get_dentista_especializacao(id):
        dentista_especializacao = DentistaEspecializacao.query.get(id)
        if dentista_especializacao:
            return jsonify(dentista_especializacao)
        else:
            return jsonify({'error': 'Relação não encontrada'}), 404
        
    @app.route('/api/dentista-especializacao/<int:id>', methods=['DELETE'])
    def delete_dentista_especializacao(id):
        dentista_especializacao = DentistaEspecializacao.query.get(id)
        if dentista_especializacao:
            dentista_especializacao.delete()
            return jsonify({'message': 'Relação deletada com sucesso'}), 200
        else:
            return jsonify({'error': 'Relação não encontrada'}), 404
    