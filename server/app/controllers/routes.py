from flask import Flask, request, jsonify
from firebase_admin import auth
from dotenv import load_dotenv
import json
import requests
import os
from flask_validate_json import validate_json
from datetime import datetime, timedelta, time
from app.utils.schemas import schema_paciente, schema_consulta, schema_dentista, schema_especializacao, schema_dentista_especializacao
from app.utils.functions import verify_token, get_time_slots
from app import db

app = Flask(__name__)
from app.models.models import Pacientes, Agenda, DentistaEspecializacao, Dentistas, Especializacao


load_dotenv()

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
        dentista = True

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
            user = paciente.to_dict()
            user['type'] = 'paciente'
        elif dentista:
            user = dentista.to_dict()
            user['type'] = 'dentista'
        else:
            return jsonify({'error': 'Usuário não encontrado no banco de dados'}), 404

        return jsonify({
            'message': 'Login realizado com sucesso',
            'token': id_token,
            'refreshToken': json_response['refreshToken'],
            'user': user
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
        

    @app.route('/api/consultas/horario-livres', methods=['POST'])
    def get_available_slots():
        data = request.get_json() 
        if not data or 'data' not in data:
            return jsonify({'error': 'Data não fornecida'}), 400
        
        try:
            data_consulta = datetime.strptime(data['data'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Formato de data inválido. Use YYYY-MM-DD.'}), 400

        consultas_marcadas = Agenda.query.filter_by(data_consulta=data_consulta).all()

        start_time = time(8, 0)  
        end_time = time(18, 0)  
        interval = timedelta(minutes=30)

        all_slots = get_time_slots(start_time, end_time, interval)
        occupied_slots = []

        for consulta in consultas_marcadas:
            especializacao = DentistaEspecializacao.query.filter_by(dent_espec_id=consulta.dent_esp_id).first()
            if especializacao:
                hora_inicio = consulta.hora_consulta
                hora_fim = (datetime.combine(datetime.today(), hora_inicio) + timedelta(minutes=especializacao.tempo)).time()
                current_time = hora_inicio
                while current_time < hora_fim:
                    occupied_slots.append(current_time)
                    current_time = (datetime.combine(datetime.today(), current_time) + interval).time()

        available_slots = [slot for slot in all_slots if slot not in occupied_slots]

        return jsonify({
            "available_slots": [slot.strftime('%H:%M') for slot in available_slots]
        })
        
    @app.route('/api/consultas', methods=['GET'])
    def get_consultas():
        consultas = Agenda.query.all()
        if consultas:
            consultas_list = []
            for consulta in consultas:
                consulta_data = {
                    'id': consulta.agenda_id,
                    'paciente': consulta.paciente_id,
                    'dentista': consulta.dent_esp_id,
                    'data_consulta': consulta.data_consulta,
                    'hora_consulta': consulta.hora_consulta
                }
                consultas_list.append(consulta_data)
            
            return jsonify(consultas_list), 200
        else:
            return jsonify({'message': 'Nenhuma consulta encontrada'}), 404
        
    @app.route('/api/consulta/<int:id>', methods=['GET'])
    def get_consulta(id):
        consultas = db.session.query(
            Agenda.agenda_id,
            Agenda.paciente_id,
            Agenda.data_consulta,
            Agenda.hora_consulta,
            Dentistas.dentista_nome,
            Especializacao.especializacao_nome
        ).join(DentistaEspecializacao, Agenda.dent_esp_id == DentistaEspecializacao.dent_espec_id)\
        .join(Dentistas, DentistaEspecializacao.dentista_id == Dentistas.dentista_id)\
        .join(Especializacao, DentistaEspecializacao.especializacao_id == Especializacao.especializacao_id)\
        .filter(Agenda.paciente_id == id).all()

        consulta_list = []
        if consultas:
            for consulta in consultas:
                consulta_data = {
                    'id': consulta.agenda_id,
                    'paciente': consulta.paciente_id,
                    'dentista': consulta.dentista_nome,
                    'especializacao': consulta.especializacao_nome,
                    'data_consulta': consulta.data_consulta.strftime('%Y-%m-%d'),
                    'hora_consulta': consulta.hora_consulta.strftime('%H:%M:%S')
                }
                consulta_list.append(consulta_data)
            return jsonify(consulta_list), 200
        else:
            return jsonify({'error': 'Consulta não encontrada'}), 404


        
    @app.route('/api/consulta', methods=['POST'])
    def create_consulta():
        data = request.get_json()
        try:
            paciente_id = data['paciente_id']
            dent_esp_id = data['dent_esp_id']
            data_consulta_str = data['data_consulta']
            hora_consulta_str = data['hora_consulta']
            
            data_consulta = datetime.strptime(data_consulta_str, '%Y-%m-%d').date()
            hora_consulta = datetime.strptime(hora_consulta_str, '%H:%M:%S').time()

            new_consulta = Agenda(paciente_id=paciente_id, dent_esp_id=dent_esp_id, data_consulta=data_consulta, hora_consulta=hora_consulta)
            new_consulta.save()

            return jsonify({"message": "Consulta created successfully"}), 201
        except KeyError as e:
            return jsonify({"error": f"Missing key: {str(e)}"}), 400
        except ValueError as e:
            return jsonify({"error": f"Date format error: {str(e)}"}), 400
        except Exception as e:
            return jsonify({"error": str(e)}), 400
    
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
        
    @app.route('/api/dentista/<int:dentista_id>/agendamentos', methods=['GET'])
    def get_dentista_agendamentos(dentista_id):
        try:
            dentista = Dentistas.query.filter_by(dentista_id=dentista_id).first()
            if not dentista:
                return jsonify({'error': 'Dentista não encontrado'}), 404

            especializacoes_ids = [esp.dent_espec_id for esp in dentista.especializacoes]
            
            agendamentos = Agenda.query.filter(Agenda.dent_esp_id.in_(especializacoes_ids)).all()

            agendamentos_list = [agendamento.to_dict() for agendamento in agendamentos]

            return jsonify(agendamentos_list), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
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
            dentista_data = {
                'id': dentista.dentista_id,
                'nome': dentista.dentista_nome,
                'email': dentista.dentista_email,
                'data_criacao': dentista.data_criacao,
                'ativo': 'Sim' if dentista.ativo else 'Não'
            }
            return jsonify(dentista_data)
        else:
            return jsonify({'error': 'Dentista não encontrado'}), 404
        
    @app.route('/api/dentista', methods=['POST'])
    @validate_json(schema_dentista)
    def create_dentista():
        data = request.get_json()
        dentista_nome = data['dentista_nome']
        dentista_email = data['dentista_email']
        password = data['password']
        
        if Dentistas.query.filter_by(dentista_email=dentista_email).first():
            return jsonify({'error': 'Dentista já cadastrado'}), 400
        
        try:
            pacient_record = auth.create_user(email=dentista_email, password=password)
            firebase_uid = pacient_record.uid
        except Exception as e:
            return jsonify({"error": str(e)}), 400

        try:
            new_dentista = Dentistas(dentista_nome=dentista_nome, firabase_uid = firebase_uid,  dentista_email=dentista_email)
            new_dentista.save()
        except Exception as e:
            auth.delete_user(firebase_uid)
            return jsonify({"error": str(e)}), 400

        return jsonify({"message": "Dentista created successfully", "firebase_uid": firebase_uid}), 201
    
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
        
    @app.route('/api/dentista/<int:dentista_id>/especialidades', methods=['GET'])
    def get_dentista_especialidades(dentista_id):
        try:
            dentista = Dentistas.query.filter_by(dentista_id=dentista_id).first()
            if not dentista:
                return jsonify({'error': 'Dentista não encontrado'}), 404

            especializacoes = DentistaEspecializacao.query.filter_by(dentista_id=dentista_id).all()
            especialidades_list = []
            for especializacao in especializacoes:
                especializacao_dict = especializacao.to_dict()
                especializacao_nome = Especializacao.query.filter_by(especializacao_id=especializacao.especializacao_id).first().especializacao_nome
                especializacao_dict['especializacao_nome'] = especializacao_nome
                especialidades_list.append(especializacao_dict)

            return jsonify(especialidades_list), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/especializacoes', methods=['GET'])
    def get_especializacoes():
        especializacoes = Especializacao.query.all()
        if especializacoes:
            especializacoes_list = []
            for especializacao in especializacoes:
                especializacao_data = {
                    'id': especializacao.especializacao_id,
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
            especializacao_id = {
                'id': especializacao.especializacao_id,
                'nome': especializacao.especializacao_nome,
            }
            return jsonify(especializacao_id)
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
        
    @app.route('/api/dentista-especializacoes', methods=['GET'])
    def get_dentista_especializacoes():
        dentista_especializacoes = DentistaEspecializacao.query.all()
        if dentista_especializacoes:
            dentista_especializacoes_list = []
            for dentista_especializacao in dentista_especializacoes:
                dentista_especializacao_data = {
                    'id': dentista_especializacao.especializacao_id,
                    'dentista': dentista_especializacao.dentista_nome.dentista_nome,
                    'especializacao': dentista_especializacao.especializacao_id,
                }
                dentista_especializacoes_list.append(dentista_especializacao_data)
            
            return jsonify(dentista_especializacoes_list), 200
        else:
            return jsonify({'message': 'Nenhuma relação encontrada'}), 404
        
    @app.route('/api/dentista-especializacao/<int:id>', methods=['GET'])
    def get_dentista_especializacao(id):
        dentista_especializacoes = DentistaEspecializacao.query.filter_by(especializacao_id=id).all()
        if dentista_especializacoes:
            dentistas_ids = []
            for dentista_especializacao in dentista_especializacoes:
                dentista_especializacao_data = {
                    'id': dentista_especializacao.dentista_id,
                    'dentista': dentista_especializacao.dentista_nome.dentista_nome,
                    'especializacao': dentista_especializacao.especializacao_id,
                }
                dentistas_ids.append(dentista_especializacao_data)
            return jsonify(dentistas_ids)
        else:
            return jsonify({'error': 'Relação não encontrada'}), 404

        
    @app.route('/api/dentista-especializacao', methods=['POST'])
    @validate_json(schema_dentista_especializacao)
    def create_dentista_especializacao():
        data = request.get_json()
        dentista_id = data['dentista_id']
        especializacao_id = data['especializacao_id']
        tempo = data['tempo']
        
        if DentistaEspecializacao.query.filter_by(dentista_id=dentista_id, especializacao_id=especializacao_id).first():
            return jsonify({'error': 'Relação já cadastrada'}), 400

        try:
            new_dentista_especializacao = DentistaEspecializacao(dentista_id=dentista_id, especializacao_id=especializacao_id, tempo=tempo)
            new_dentista_especializacao.save()
        except Exception as e:
            return jsonify({"error": str(e)}), 400

        return jsonify({"message": "Relação created successfully"}), 201
        
    @app.route('/api/dentista-especializacao/<int:id>', methods=['DELETE'])
    def delete_dentista_especializacao(id):
        dentista_especializacao = DentistaEspecializacao.query.get(id)
        if dentista_especializacao:
            dentista_especializacao.delete()
            return jsonify({'message': 'Relação deletada com sucesso'}), 200
        else:
            return jsonify({'error': 'Relação não encontrada'}), 404
    