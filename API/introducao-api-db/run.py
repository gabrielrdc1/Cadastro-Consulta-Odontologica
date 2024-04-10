from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'super-secret"'  
jwt = JWTManager(app)
db = SQLAlchemy(app)

class Paciente(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    senha = db.Column(db.String(100), nullable=False)

class Consulta(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    data = db.Column(db.Date, nullable=False)
    paciente_id = db.Column(db.Integer, db.ForeignKey('paciente.id'), nullable=False)
    paciente = db.relationship('Paciente', backref='consultas')

@app.route('/api/pacientes', methods=['POST'])
def cadastrar_paciente():
    data = request.get_json()
    if 'nome' in data and 'email' in data and 'senha' in data:
        novo_paciente = Paciente(nome=data['nome'], email=data['email'], senha=data['senha'])
        db.session.add(novo_paciente)
        db.session.commit()
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
        db.session.add(nova_consulta)
        db.session.commit()
        return jsonify({"message": "Consulta agendada com sucesso"}), 201
    else:
        return jsonify({"error": "Data da consulta é obrigatória"}), 400

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
